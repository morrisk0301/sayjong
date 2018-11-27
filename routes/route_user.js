var async = require('async');

module.exports = function(router, passport) {
    console.log('route_user 호출됨.');

    // 로그인 인증
    router.post('/login', function(req, res){
        console.log("로그인 포스트 요청", req.body);
        var MongoClient =require('mongodb').MongoClient;
        var url = "mongodb://localhost:27017/";
        if(req.body.email == '' || req.body.password=='') return res.json({msg: "1-4"});
        async.waterfall([
            function(done){
                MongoClient.connect(url, function(err, db) {
                    db.db('local').collection('temporary_users').findOne({'email':req.body.email}, function(err, result) {
                        if(err) throw err;
                        if(result){
                            db.close();
                            res.json({msg: "1-3"});
                            return;
                        }
                        db.close();
                        done(null);
                    });
                });
            },
            function(done){
                passport.authenticate('local-login', {
                    failureFlash: false
                }, function(err, user, message) {
                    if(err) res.json({msg: "1-8"});
                    //1-5는 관리자용 로그인
                    if(req.body.auth_login){
                        if(message=="1-5"){
                            req.login(user, function(err){
                                res.redirect('/');
                            });
                        } else{
                            res.json({msg: message});
                        }
                    } else{
                        if(message=="1-0" || message=="1-5"){
                            req.login(user, function(err){
                                res.json({msg: message, user: user});
                            });
                        } else{
                            res.json({msg: message});
                        }
                    }
                })(req, res);
            }, function(err){
                if(err) throw err;
            }
        ]);
    });

    router.get('/logout', function(req, res) {
        console.log('로그아웃 get 요청');
        req.logout();
        res.json({logoutStatus: true})
    });

    //회원가입시 이메일 인증
    router.post('/signup', function(req, res, next){
        console.log("회원가입 post 요청", req.body);
        if(req.body.email=='' || !req.body.email) return res.json({msg: "2-1"});
        else if(!req.body.email.includes('sju.ac.kr')) return res.json({msg: "2-2"});
        else if(req.body.password=='' || !req.body.password) return res.json({msg: "2-3"});
        else if(req.body.name=='' || !req.body.name) return res.json({msg: "2-4"});
        else if(req.body.stuid=='' || !req.body.stuid) return res.json({msg: "2-5"});
        else {
            passport.authenticate('local-signup', {
                failureFlash: true
            }, function (message) {
                res.json({msg: message});
            })(req, res, next);
        }
    });

    router.get('/email-verification/:URL', function(req, res){
        console.log('이메일 인증 get 요청', req.params);
        var nev = require('../config/email_verification');
        var url = req.params.URL;
        nev.confirmTempUser(url, function(err, user){
            console.log("confirmed user " + user);
            if(err) throw err;
            if (user) {
                res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                res.write('<script type="text/javascript">alert("이메일 인증 완료!");window.close();</script>');
                res.end();
            } else {
                return res.status(404).send('ERROR: confirming temp user FAILED');
            }
        });
    });

    router.get('/resendVerificationEmail/:EMAIL', function(req, res){
        console.log('이메일 재인증 get 요청', req.params);
        var nev = require('../config/email_verification');
        var email = req.params.EMAIL;
        nev.resendVerificationEmail(email, function(err, userFound){
            if(err) throw err;
            if(userFound) res.json({resendStatus: true, errmessage: null});
            else res.json({resendStatus: false, errmessage: "인증 요청이 존재하지 않습니다."})
        })
    });

    router.post('/withdrawal', function(req, res){
        console.log('withdrawal post 요청', req.body);
        var database = req.app.get('database');
        database.UserModel_sj.findOne({
            'email': req.body.email
        }, function(err, result){
            if(err) throw err;
            result.isUnregistered = true;
            result.save(function(err){
                if(err) throw err;
                req.logout();
                res.json({withdrawalstatus:true})
            })
        })
    });
};