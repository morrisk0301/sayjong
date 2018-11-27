module.exports = function(router) {
    console.log('router_temp 호출됨');
    var async = require('async');

    function getClientNum(thread_id, database, callback){
        database.ThreadParticipantModel_sj.find({
            'super_thread_id': thread_id
        }, function(err, result){
            if(err) throw err;
            if(!result) return callback(0);
            else return callback(result.length);
        })
    }

    function getCategory(thread_id, database, callback){
        database.CategoryParticipantModel_sj.find({
            'super_thread_id': thread_id
        }, function(err, result){
            if(err) throw err;
            if(!result) return callback([]);
            else{
                var catresult = [];
                for(var i=0;i<result.length;i++){
                    catresult.push(result[i].super_category_name);
                }
                return callback(catresult);
            }
        })
    }

    check_auth = function(req, res, next){
        var database = req.app.get('database');
        database.AdminModel_sj.findOne({
            'user_id': typeof(req.user)!='undefined'?req.user.user_id:-2
        }, function(err, result){
            if(err) return res.render('auth_fail');
            if(!result) return res.render('auth_fail');
            else return next();
        })
    };

    router.get('/signup', function(req, res) {
        if (req.user) {
            console.log('로그인 상태임');
            res.redirect('/');
        }
        else{
            console.log('/signup 패스 요청됨.');
            res.render('signup.ejs', {login_success:false});
        }
    });

    router.get('/chat', check_auth, function(req, res) {
        if(!req.user) res.redirect('/');
        else{
            var database = req.app.get('database');
            var threadlist = [];
            async.waterfall([
                function(done){
                    database.ThreadParticipantModel_sj.find({
                        'super_user_id': req.user.user_id
                    }, function(err, thread){
                        if(err) throw err;
                        thread = thread.map(function(doc){return doc.super_thread_id});
                        done(err, thread);
                    })
                },
                function(thread, done){
                    database.ThreadModel_sj.find({
                        'thread_id': {$in: thread}
                    }, function (err, result) {
                        if(err) throw err;

                        async.map(result, function(item, callback){
                            getClientNum(item.thread_id, database, function(result_cli){
                                getCategory(item.thread_id, database, function(result_cat){
                                    var result_all = {
                                        'cli': result_cli,
                                        'cat': result_cat
                                    };
                                    callback(null, result_all);
                                });
                            })
                        }, function(err, resultArr){
                            for(var i=0;i<result.length;i++){
                                var newChatList = {
                                    'thread_id': result[i].thread_id,
                                    'thread_name': result[i].thread_name,
                                    'is_open': result[i].is_open,
                                    'thread_n_people': result[i].thread_n_people,
                                    'thread_time': result[i].thread_time,
                                    'thread_about': result[i].thread_about,
                                    'client_num': resultArr[i].cli,
                                    'tag': resultArr[i].cat
                                };
                                threadlist.push(newChatList);
                            }
                            res.render('chat', {chat: threadlist, user: req.user});
                        });
                    });
                }, function(err){
                    if(err) throw err;
                }
            ]);
        }
    });

    router.get('/chatlist', check_auth, function(req, res) {
        console.log('/chatlist 패스 요청됨');
        if(!req.user) res.redirect('/');
        else{
            var database = req.app.get('database');
            database.ThreadModel_sj.find().exec(function(err, result){
                res.render('allchat', {chat:result, user:req.user});
            });
        }
    });

    router.get('/newchat', check_auth, function(req, res) {
        console.log('/newchat 패스 요청됨');
        if(!req.user) res.redirect('/');
        else{
            res.render('newchat', {login_success:true});
        }
    });

    router.get('/editchat', check_auth, function(req,res){
        console.log('/editchat 패스 요청됨');
        if(!req.user) res.redirect('/');
        else{
            res.render('editchat', {login_success:true});
        }
    });

    router.get('/forgot', check_auth, function(req, res) {
        console.log('/forgot 패스 요청됨.');
        res.render('forgot.ejs', {login_success:false});
    });

    router.get('/shingo', check_auth, function(req, res) {
        console.log('shingo 요청됨');
        res.render('shingo')
    });

    router.get('/withdrawal', check_auth, function(req, res) {
        console.log('withdrawal 요청됨');
        res.render('withdrawal')
    });

};