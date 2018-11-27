module.exports = function(router) {
    console.log('router_admin 호출됨');
    var async = require('async');
    var convertImage = require('../database/convertImage');

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

    check_login = function(req, res, next){
        if(!req.user) res.json({loginstatus: false});
        else return next();
    };

    router.route('/').get(function(req, res) {
        console.log('/ 패스 요청됨.');
        if(req.user)
            res.render('index', {login_success:true, loginmessage: req.flash('loginMessage')});
        else
            res.render('index', {login_success:false, loginmessage: req.flash('loginMessage')});
    });

    router.get('/admin_register', check_auth, function(req, res){
        console.log('/admin_register 호출됨.');
        var database = req.app.get('database');
        database.AdminModel_sj.find({}, function(err, result){
            if(err) throw err;
            res.render('admin_register', {admin_list: result});
        })
    });

    router.get('/admin_pwreset', check_auth, function(req, res){
        console.log('/admin_pwreset 호출됨.');
        res.render('admin_pwreset', {resetPW: null});
    });

    router.get('/admin_notice', check_auth, function(req, res){
        console.log('/admin_notice 호출됨.');
        var database = req.app.get('database');
        database.NoticeModel_sj.find({}, function(err, result){
            if(err) throw err;
            res.render('admin_notice', {notice_list: result});
        });
    });

    router.get('/admin_notice_edit', check_auth, function(req, res){
        console.log('/admin_notice_edit 호출됨.');
        var database = req.app.get('database');
        database.NoticeModel_sj.findOne({
            'notice_id': req.query.notice_id
        }, function(err, result){
            if(err) throw err;
            console.log(result);
            res.render('admin_notice_edit', {notice: result});
        });
    });

    router.get('/admin_banner', check_auth, function(req, res){
        console.log('admin_banner 호출됨.');
        var database = req.app.get('database');
        database.BannerModel_sj.find({}, function(err, result){
            if(err) throw err;
            res.render('admin_banner', {banner_list: result});
        });
    });

    router.get('/admin_banner_add', check_auth, function(req, res){
        console.log('admin_banner_add 호출됨.');
        res.render('admin_banner_add');
    });

    router.get('/admin_banner_edit', check_auth, function(req, res){
        console.log('/admin_banner_edit 호출됨.');
        var database = req.app.get('database');
        database.BannerModel_sj.findOne({
            'banner_id': req.query.banner_id
        }, function(err, result){
            if(err) throw err;
            console.log(result);
            res.render('admin_banner_edit', {banner: result});
        });
    });

    router.get('/admin_ban', check_auth, function(req, res){
        console.log('admin_ban 호출됨.');
        var database = req.app.get('database');
        database.ThreadBanModel_sj.find({}).select({
            'thread_ban_id':1,
            'thread_id': 1,
            'thread_name':1,
            'ban_reason': 1,
            'created_at': 1
        }).exec(
            function(err, thread_result){
                if(err) throw err;
                database.UserBanModel_sj.find({},
                    function(err, user_result){
                        if(err) throw err;
                        res.render('admin_ban', {ban_user_list: user_result, ban_thread_list: thread_result});
                    })
            })

    });

    router.get('/admin_banlist', check_auth, function(req, res){
        console.log('admin_banlist 호출됨');
        var database = req.app.get('database');
        database.BanModel_sj.find({}, function(err, result){
            if(err) throw err;
            res.render('admin_banlist', {ban_list: result})
        })
    });

    router.get('/admin_ban_edit', check_auth, function(req, res){
        console.log('/admin_ban_edit 호출됨.');
        var database = req.app.get('database');
        database.BanModel_sj.findOne({
            'ban_id': req.query.ban_id
        }, function(err, result){
            if(err) throw err;
            console.log(result);
            res.render('admin_ban_edit', {ban: result});
        });
    });

    router.get('/admin_chatview', check_auth, function(req, res){
        console.log('/admin_chatview 호출됨.');
        res.render('admin_chatview', {chatdata:null});
    });

    router.get('/admin_ban_reset', check_auth, function(req, res) {
        console.log('admin_user_ban_delete 호출됨');
        var database = req.app.get('database');
        database.UserBanModel_sj.find({
            'user_ban_id': req.query.user_ban_id
        }).remove(function(err){
            if(err) throw err;
            database.BanModel_sj.findOne({
                'ban_id': req.query.ban_id
            }, function(err, result){
                result.ban_email = null;
                result.ban_days = null;
                result.ban_feedback = null;
                result.ban_result = null;
                result.user_ban_id = null;
                result.save(function(err){
                    if(err) throw err;
                    res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                    res.write('<script type="text/javascript">alert("초기화 되었습니다.");window.close();</script>');
                    res.end();
                })
            })
        })
    });

    router.get('/admin_get_ban', function(req, res){
        console.log('/admin_get_ban 호출됨.');
        var database = req.app.get('database');
        database.UserBanModel_sj.findOne({
            'ban_email': req.query.ban_email
        }, function(err, result){
            if(err) throw err;
            if(!result) res.json({is_ban: false});
            else res.json({is_ban: true});
        })
    });

    router.get('/admin_get_banner', check_login, function(req, res){
        console.log('/admin_get_banner 호출됨.');
        var database = req.app.get('database');
        database.BannerModel_sj.find({}).select({
            'banner_id': 1,
            'banner_img': 1,
            'banner_type': 1,
            'banner_link': 1,
            'created_at': 1,
        }).exec(function(err, result){
            if(err) throw err;
            res.json({banner_list: result})
        })
    });

    router.get('/admin_get_notice', check_login, function(req, res){
        console.log('/admin_get_notice 호출됨.');
        var database = req.app.get('database');
        database.NoticeModel_sj.find({}).select({
            'noticd_id': 1,
            'notice_user': 1,
            'notice_head': 1,
            'notice_body': 1,
            'created_at': 1,
        }).exec(function(err, result){
            if(err) throw err;
            res.json({notice_list: result})
        })
    });

    router.post('/admin_ban_thread_info', check_auth, function(req, res){
        console.log('/admin_ban_thread 호출됨.');
        var database = req.app.get("database");
        database.ThreadBanModel_sj.findOne({
            'thread_id': req.body.thread_id
            },
            function(err, result){
                res.render('admin_ban_thread_info', {chatdata:result});
            })
    });

    router.post('/admin_register', check_auth, function(req, res){
        console.log('/admin_register Post 호출됨.');
        var paramEmail = req.body.email;
        var paramNickname = req.body.nickname;
        var database = req.app.get('database');

        async.waterfall([
            function(done){
                database.AdminModel_sj.findOne({
                    'user_id': req.user.user_id
                }, function(err, result) {
                    if (err) throw err;
                    if (!result || result.admin_rank != 0) {
                        res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                        res.write('<script type="text/javascript">alert("권한이 없습니다.");window.close();</script>');
                        res.end();
                        return;
                    } else{
                        done(null);
                    }
                })
            },
            function(done){
                database.UserModel_sj.findOne({
                    'email': paramEmail
                }, function(err, result){
                    if(err) throw err;
                    if(!result){
                        res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                        res.write('<script type="text/javascript">alert("유저가 없습니다.");window.close();</script>');
                        res.end();
                        return;
                    } else{
                        done(null, result);
                    }
                })
            },
            function(user, done){
                var newAdmin = new database.AdminModel_sj({
                    'user_id': user.user_id,
                    'email': user.email,
                    'name': user.name,
                    'nickname': paramNickname
                });
                newAdmin.save(function(err){
                    if(err){
                        res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                        res.write('<script type="text/javascript">alert("에러입니다.");window.close();</script>');
                        res.end();   
                    }
                    else{
                        res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                        res.write('<script type="text/javascript">alert("저장되었습니다.");window.close();</script>');
                        res.end();
                    }
                })
            }, function(err){
                if(err) throw err;
            }
        ]);
    });

    router.post('/admin_delete', check_auth, function(req, res){
        console.log('admin_delete 호출 됨');
        var paramId = req.body.admin_id;
        var database = req.app.get('database');
        database.AdminModel_sj.findOne({
            'user_id': req.user.user_id
        }, function(err, result){
            if(err) throw err;
            if(!result || result.admin_rank!=0){
                res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                res.write('<script type="text/javascript">alert("권한이 없습니다.");window.location=\'/admin_register\';</script>');
                res.end();
            }else{
                database.AdminModel_sj.find({
                    'admin_id': paramId
                }).remove(function(err){
                    if(err) throw err;
                    res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                    res.write('<script type="text/javascript">alert("삭제되었습니다.");window.location=\'/admin_register\';</script>');
                    res.end();
                })
            }
        })
    });

    router.post('/admin_pwreset', check_auth, function(req, res){
        console.log('admin_pwreset 호출됨');
        var database = req.app.get('database');
        var randomPW = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
        database.UserModel_sj.findOne({
            'email': req.body.email
        }, function(err, user){
            if(err) throw err;
            if(!user){
                res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                res.write('<script type="text/javascript">alert("유저가 없습니다.");window.location=\'/admin_pwreset\';</script>');
                res.end();
            } else{
                database.AdminModel_sj.findOne({
                    'email': req.body.email
                }, function(err, user_admin){
                    if(err) throw err;
                    if(user_admin){
                        res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                        res.write('<script type="text/javascript">alert("관리자의 비밀번호는 초기화 할 수 없습니다.");window.location=\'/admin_pwreset\';</script>');
                        res.end();
                    }else{
                        user.password = randomPW;
                        user.save(function(err) {
                            res.render('admin_pwreset', {resetPW: randomPW});
                        });
                    }
                })
            }
        })
    });

    router.post('/admin_notice_add', check_auth, function(req, res) {
        console.log('admin_notice_add 호출됨');
        var database = req.app.get('database');
        var paramHead = req.body.notice_head;
        var paramBody = req.body.notice_body;
        database.AdminModel_sj.findOne({
            'email':req.user.email
        }, function(err, user){
           if(err) throw err;
            var newNotice = new database.NoticeModel_sj({
                'notice_user': user.nickname,
                'notice_head': paramHead,
                'notice_body': paramBody,
            });
            newNotice.save(function(err){
                if(err) throw err;
                res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                res.write('<script type="text/javascript">alert("공지사항이 저장되었습니다.");window.close();</script>');
                res.end();
            })
        });
    });

    router.post('/admin_notice_delete', check_auth, function(req, res) {
        console.log('admin_notice_delete 호출됨');
        var database = req.app.get('database');
        database.NoticeModel_sj.find({
            'notice_id': req.body.notice_id
        }).remove(function(err){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
            res.write('<script type="text/javascript">alert("삭제되었습니다.");window.location=\'/admin_notice\';</script>');
            res.end();
        })
    });

    router.post('/admin_notice_edit', check_auth, function(req, res) {
        console.log('admin_notice_edit 호출됨');
        var database = req.app.get('database');
        var paramHead = req.body.notice_head;
        var paramBody = req.body.notice_body;
        var paramID = req.body.notice_id;
        database.AdminModel_sj.findOne({
            'email':req.user.email
        }, function(err, user){
            if(err) throw err;
            database.NoticeModel_sj.findOne({
                'notice_id': paramID
            }, function(err, result){
                if(err) throw err;
                result.notice_user = user.nickname;
                result.notice_head = paramHead;
                result.notice_body = paramBody;
                result.save(function(err){
                    if(err) throw err;
                    res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                    res.write('<script type="text/javascript">alert("공지사항이 수정되었습니다.");window.close();</script>');
                    res.end();
                })
            });
        });
    });

    router.post('/admin_banner_add', check_auth, function(req, res) {
        console.log('admin_banner_add 호출됨');
        var database = req.app.get('database');
        convertImage(req.body.banner_img, function(err, paramImage){
            database.AdminModel_sj.findOne({
                'email':req.user.email
            }, function(err, user){
                if(err) throw err;
                var newBanner = new database.BannerModel_sj({
                    'banner_img': paramImage.img_full,
                    'banner_user': user.nickname,
                    'banner_type': req.body.banner_type,
                    'banner_link': req.body.banner_type=='Link'? req.body.banner_link : null,
                });
                newBanner.save(function(err){
                    if(err) throw err;
                    res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                    res.write('<script type="text/javascript">alert("배너가 저장되었습니다.");window.close();</script>');
                    res.end();
                })
            });
        });
    });

    router.post('/admin_banner_delete', check_auth, function(req, res) {
        console.log('admin_banner_delete 호출됨');
        var database = req.app.get('database');
        database.BannerModel_sj.find({
            'banner_id': req.body.banner_id
        }).remove(function(err){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
            res.write('<script type="text/javascript">alert("삭제되었습니다.");window.location=\'/admin_banner\';</script>');
            res.end();
        })
    });

    router.post('/admin_banner_edit', check_auth, function(req, res) {
        console.log('admin_banner_edit 호출됨');
        var database = req.app.get('database');
        database.AdminModel_sj.findOne({
            'email':req.user.email
        }, function(err, user){
            if(err) throw err;
            convertImage(req.body.banner_img, function(err, paramImage){
                if(err) throw err;
                database.BannerModel_sj.findOne({
                    'banner_id': req.body.banner_id
                }, function(err, result){
                    if(err) throw err;
                    result.banner_img = paramImage.img_full;
                    result.banner_user = user.nickname;
                    result.banner_type = req.body.banner_type;
                    result.banner_link = req.body.banner_type=='Link'? req.body.banner_link : null;
                    result.save(function(err){
                        if(err) throw err;
                        res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                        res.write('<script type="text/javascript">alert("배너가 수정되었습니다.");window.close();</script>');
                        res.end();
                    })
                });
            });
        });
    });

    router.post('/admin_ban_add', check_auth, function(req, res) {
        console.log('admin_ban_add 호출됨');
        var database = req.app.get('database');
        convertImage(req.body.ban_img, function(err, paramImage){
            var newBan = new database.BanModel_sj({
                'ban_thread_id': req.body.ban_thread_id,
                'shingo_email': req.body.shingo_email,
                'ban_reason': req.body.ban_reason,
                'ban_nickname': req.body.nickname,
                'ban_body': req.body.ban_body,
                'ban_img': paramImage.img_full
            });
            newBan.save(function(err){
                if(err) throw err;
                res.json({banstatus: true});
            })
        });
    });

    router.post('/admin_ban_edit', check_auth, function(req, res) {
        console.log('admin_ban_edit 호출됨');
        var database = req.app.get('database');
        var date = new Date();
        var paramDays = req.body.ban_days!="영구" ? req.body.ban_days : 36500;
        database.AdminModel_sj.findOne({
            'email':req.user.email
        }, function(err, user){
            if(err) throw err;
            database.BanModel_sj.findOne({
                'ban_id': req.body.ban_id
            }, function(err, result){
                if(err) throw err;
                var newBanUser = new database.UserBanModel_sj({
                    'ban_email': req.body.ban_email,
                    'ban_reason': result.ban_reason,
                    'ban_days': paramDays,
                    'expired_at': date.setTime(date.getTime() + paramDays * 86400000)
                });
                if(req.body.ban_result!="무혐의"){
                    newBanUser.save(function(err, result_save){
                        if(err) throw err;
                        result.ban_email = req.body.ban_email;
                        result.ban_admin = user.nickname;
                        result.ban_result = req.body.ban_result;
                        result.ban_feedback = req.body.ban_feedback;
                        result.ban_days = paramDays;
                        result.user_ban_id = result_save.user_ban_id;
                        result.save(function(err){
                            if(err) throw err;
                            res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                            res.write('<script type="text/javascript">alert("신고 처리가 완료되었습니다.");window.close();</script>');
                            res.end();
                        })
                    });
                } else{
                    result.ban_email = req.body.ban_email;
                    result.ban_admin = user.nickname;
                    result.ban_result = req.body.ban_result;
                    result.ban_feedback = req.body.ban_feedback;
                    result.ban_days = 0;
                    result.save(function(err){
                        if(err) throw err;
                        res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                        res.write('<script type="text/javascript">alert("신고 처리 및 회원 정지되었습니다.");window.close();</script>');
                        res.end();
                    })
                }
            });
        });
    });

    router.post('/admin_getchat', check_auth, function(req, res) {
        console.log('admin_getchat 호출됨');
        var database = req.app.get('database');
        database.MessageModel_sj.find({
            'super_thread_id': req.body.thread_id
        }, function(err, result){
            if(err) throw err;
            res.render('admin_chatview', {chatdata: result})
        })
    });

    router.post('/admin_user_ban', check_auth, function(req, res) {
        console.log('admin_getchat 호출됨');
        var database = req.app.get('database');
        var date = new Date();
        var paramDays = req.body.ban_days!="영구" ? req.body.ban_days : 36500;
        var newBanUser = new database.UserBanModel_sj({
            'ban_email': req.body.ban_email,
            'ban_reason': req.body.ban_reason,
            'ban_days': paramDays,
            'expired_at': date.setTime(date.getTime() + paramDays * 86400000)
        });

        newBanUser.save(function(err){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
            res.write('<script type="text/javascript">alert("회원 정지가 완료되었습니다.");window.location=\'/admin_ban\';</script>');
            res.end();
        })
    });

    router.post('/admin_user_ban_delete', check_auth, function(req, res) {
        console.log('admin_user_ban_delete 호출됨');
        var database = req.app.get('database');
        database.UserBanModel_sj.find({
            'user_ban_id': req.body.user_ban_id
        }).remove(function(err){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
            res.write('<script type="text/javascript">alert("삭제되었습니다.");window.location=\'/admin_ban\';</script>');
            res.end();
        })
    });

    router.post('/admin_thread_ban', check_auth, function(req, res) {
        console.log('admin_thread_ban 호출됨');
        var database = req.app.get('database');

        database.ThreadModel_sj.findOne({
            'thread_id': req.body.ban_thread_id
        }, function(err, result){
            if(err) throw err;
            if(!result){
                res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                res.write('<script type="text/javascript">alert("채팅방이 없습니다.");</script>');
                res.end();
            } else{
                var date = new Date();
                var exp_date = date.setTime(date.getTime() + 86400000);
                result.is_ban = true;
                result.thread_time = exp_date;
                result.save(function(err, result_save){
                    if(err) throw err;
                    database.ThreadParticipantModel_sj.update({
                            'super_thread_id': req.body.ban_thread_id},
                        {'expired_at': exp_date}, {multi:true}, function(err){
                            if(err) throw err;
                            var new_thread_ban = database.ThreadBanModel_sj({
                                'thread_id': result_save.thread_id,
                                'thread_name': result_save.thread_name,
                                'thread_superuser_id': result_save.thread_superuser_id,
                                'thread_n_people': result_save.thread_n_people,
                                'thread_about': result_save.thread_about,
                                'thread_img': result_save.thread_img,
                                'thread_time': result_save.thread_time,
                                'is_ban': result_save.is_ban,
                                'is_hot': result_save.is_hot,
                                'is_open': result_save.is_open,
                                'is_use_realname': result_save.is_use_realname,
                                'thread_created_at': result_save.created_at,
                                'ban_reason': req.body.ban_reason
                            });
                            new_thread_ban.save(function(err){
                                if(err) throw err;
                                res.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                                res.write('<script type="text/javascript">alert("삭제되었습니다.");window.location=\'/admin_ban\';</script>');
                                res.end();
                            })
                    })
                })
            }
        })
    });
};