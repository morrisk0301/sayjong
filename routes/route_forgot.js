var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var node_smtpTransport = require('nodemailer-smtp-transport');

module.exports = function(router) {
    //비밀번호 되찾기

    router.route('/forgot').post(function(req, res, next){
        console.log('forgot post 요청', req.body);
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    if(err) throw err;
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                var database = req.app.get('database');
                database.UserModel_sj.findOne({ email: req.body.email }, function(err, user) {
                    if(err) throw err;
                    if (!user) {
                        res.json({forgotstatus: false, errmessage:"등록된 이메일이 존재하지 않습니다.", forgotuser: null});
                    }
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function(err) {
                        if(err) throw err;
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {
                var smtpTransport = nodemailer.createTransport(node_smtpTransport({
                    host: 'smtp.office365.com', // Office 365 server
                    port: 587,     // secure SMTP
                    secureConnection: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
                    auth: {
                        user: '13011874@sju.ac.kr',
                        pass: '453mor30!'
                    },
                    tls: {
                        ciphers: 'SSLv3'
                    }
                }));
                var mailOptions = {
                    to: user.email,
                    from: '세이종<13011874@sju.ac.kr>',
                    subject: '세이종 비밀번호 재설정',
                    html: '<p>세이종 비밀번호 변경을 위한 이메일 입니다</p><br><br><p><a href = "http://'+req.headers.host+'/reset/'+token+'">' +
                    '이 링크를 클릭하시거나 주소를 브라우저에 복사해서 입력하시기 바랍니다:</a></p><br><p>' +
                    'http://'+req.headers.host+'/reset/'+token+'</p>'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    if(err) throw err;
                    else{res.json({forgotstatus: true, errmessage:null, forgotuser: user});}
                });
            }
        ], function(err){
            if(err) return next(err);
        })
    });

    router.route('/reset/:token').get(function(req, res) {
        console.log('reset get 요청', req.params);
        var database = req.app.get('database');
        database.UserModel_sj.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if(err) throw err;
            if (!user) {
                res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                res.write('<script type="text/javascript">alert("유저가 없거나 이미 인증되었습니다.");window.close();</script>');
                res.end();
            } else {
                res.render('reset', {user: req.user, token:req.params.token});
            }
        });
    });

    //router.route('/reset/:token').post(function(req, res){
    router.route('/reset').post(function(req, res){
        console.log('reset post 요청', req.body);
        var token = req.body.token;
        async.waterfall([
            function(done) {
                var database = req.app.get('database');
                database.UserModel_sj.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                    if (!user) {
                        res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                        res.write('<script type="text/javascript">alert("비밀번호 토큰이 만료되었습니다.");window.close();</script>');
                        res.end();
                        return;
                    }

                    user.password = req.body.password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    user.save(function(err) {
                        done(err, user);
                    });
                });
            },
            function(user, done) {
                var smtpTransport = nodemailer.createTransport(node_smtpTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'sayjong.alom@gmail.com',
                        pass: 'sayjong1!'
                    }
                }));
                var mailOptions = {
                    to: user.email,
                    from: 'Do Not Reply <sajong.alom@gmail.com>',
                    subject: '세이종 비밀번호 재설정이 완료되었습니다.',
                    text: '안녕하세요,\n\n' +
                    '회원님의 세이종 계정 ' + user.email + ' 의 비밀번호가 성공적으로 변경되었습니다.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    done(err, user);
                });
            }
        ], function(err, user) {
            if(err){
                res.render('complete_reset', {resetstatus: false})
            }
            else{
                res.render('complete_reset', {resetstatus: true})
            }
        });
    });
};