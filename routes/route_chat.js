module.exports = function(router) {
    console.log('route_chat 호출됨.');
    var async = require('async');
    var convertImage = require('../database/convertImage');
    var defaultImage = require('../database/defaultThreadImage');
    var participate = require('../database/participate_method');
    var sortmethod = require('../database/sort');

    function setMessageCount(thread_id, database){
        var newCount = new database.MessageCounterModel_sj({
            'super_thread_id': thread_id
        });
        newCount.save(function(err){
            if(err) throw err;
            else console.log("Message Count 설정 완료")
        })
    }

    function setRoomImage(image){
        if(image) return image;
        return defaultImage();
    }

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

    function searchThreacbyCatid(paramId, database, cb){
        database.CategoryModel_sj.findOneAndUpdate({
            'category_id': paramId
        }, {$inc:{'category_counter':1}}, {new:true}, function(err){
            if(err) throw err;
            database.CategoryParticipantModel_sj.find({
                'super_category_id': paramId
            }, function(err, result){
                if(err) throw err;
                var threadlist = [];

                async.map(result, function(item, callback){
                    console.log(item);
                    database.ThreadModel_sj.findOne({
                        'thread_id': item.super_thread_id
                    }, function(err, thread_result){
                        if(err) throw err;
                        console.log(thread_result);
                        callback(null, thread_result)
                    })
                }, function(err, threadArr){
                    async.map(threadArr, function(item, callback){
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
                                'key': threadArr[i].thread_id,
                                'thread_name': threadArr[i].thread_name,
                                'is_open': threadArr[i].is_open,
                                'is_use_realname': threadArr[i].is_use_realname,
                                'thread_n_people': threadArr[i].thread_n_people,
                                'thread_time': threadArr[i].thread_time,
                                'thread_about': threadArr[i].thread_about,
                                'thread_img': threadArr[i].thread_img,
                                'client_num': resultArr[i].cli,
                                'tag': resultArr[i].cat
                            };
                            threadlist.push(newChatList);
                        }
                        return cb(null, threadlist)
                    });
                });
            })
        });
    }

    check_login = function(req, res, next){
        if(!req.user) res.json({loginstatus: false});
        else return next();
    };

    //chat 화면
    router.get('/mychat', check_login, function(req, res) {
        console.log('mychat get 요청');
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
                                'key': result[i].thread_id,
                                'thread_name': result[i].thread_name,
                                'is_open': result[i].is_open,
                                'is_use_realname': result[i].is_use_realname,
                                'thread_n_people': result[i].thread_n_people,
                                'thread_time': result[i].thread_time,
                                'thread_about': result[i].thread_about,
                                'thread_img': result[i].thread_img,
                                'client_num': resultArr[i].cli,
                                'tag': resultArr[i].cat
                            };
                            threadlist.push(newChatList);
                        }
                        res.json({threadlist: threadlist});
                    });
                });
            }, function(err){
                if(err) throw err;
            }
        ]);
    });

    router.get('/getAllChat', check_login, function(req, res) {
        console.log('getAllChat get 요청');
        var database = req.app.get('database');
        var threadlist = [];
        database.ThreadModel_sj.find().exec(function(err, result){
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
                    if(threadlist.length > 9) break;
                    var newChatList = {
                        'key': result[i].thread_id,
                        'thread_name': result[i].thread_name,
                        'is_open': result[i].is_open,
                        'is_use_realname': result[i].is_use_realname,
                        'thread_n_people': result[i].thread_n_people,
                        'thread_time': result[i].thread_time,
                        'thread_about': result[i].thread_about,
                        'client_num': resultArr[i].cli,
                        'tag': resultArr[i].cat
                    };
                    threadlist.push(newChatList);
                }
                res.json({threadlist: threadlist});
            });
        });
    });

    router.get('/getNewChat', check_login, function(req, res) {
        console.log('getNewChat get 요청');
        var database = req.app.get('database');
        var threadlist = [];
        database.ThreadModel_sj.find().exec(function(err, result){
            if(err) throw err;
            result = result.sort(sortmethod.sortWithCreatedAt);
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
                    if(threadlist.length > 9) break;
                    var newChatList = {
                        'key': result[i].thread_id,
                        'thread_name': result[i].thread_name,
                        'is_open': result[i].is_open,
                        'is_use_realname': result[i].is_use_realname,
                        'thread_n_people': result[i].thread_n_people,
                        'thread_img': result[i].thread_img,
                        'thread_time': result[i].thread_time,
                        'thread_about': result[i].thread_about,
                        'client_num': resultArr[i].cli,
                        'tag': resultArr[i].cat
                    };
                    threadlist.push(newChatList);
                }
                res.json({threadlist: threadlist});
            });
        });
    });

    router.get('/getHotChat', check_login, function(req, res){
        console.log('getHotChat get 요청');
        var database = req.app.get('database');
        var threadlist = [];
        database.ThreadModel_sj.find({'is_hot': {$ne: -1}}, function(err, result){
            if(err) throw err;
            result = result.sort(sortmethod.sortWithIsHot);
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
                        'key': result[i].thread_id,
                        'thread_name': result[i].thread_name,
                        'is_open': result[i].is_open,
                        'is_use_realname': result[i].is_use_realname,
                        'thread_n_people': result[i].thread_n_people,
                        'thread_time': result[i].thread_time,
                        'thread_about': result[i].thread_about,
                        'thread_img': result[i].thread_img,
                        'client_num': resultArr[i].cli,
                        'tag': resultArr[i].cat
                    };
                    threadlist.push(newChatList);
                }
                res.json({threadlist: threadlist});
            });
        });
    });

    router.get('/getHotCategory', check_login, function(req, res){
        console.log('getHotCategory get 요청');
        var database = req.app.get('database');
        var catlist = [];
        database.CategoryModel_sj.find({
            'category_hot': {$ne: -1}
        }, function(err, result){

            if(err) throw err;
            result = result.sort(sortmethod.sortWithCategoryHot);
            for(var i=0;i<result.length;i++){
                catlist.push({
                    category_id: result[i].category_id,
                    category_name: result[i].category_name
                });
            }
            res.json({catlist: catlist});
        })
    });

    router.get('/getFullThreadImage', check_login, function(req, res) {
        console.log('getFullThreadImage get 요청');
        var database = req.app.get('database');
        database.ThreadModel_sj.findOne({
            'thread_id': req.query.thread_id
        }, function(err, result){
            if(err) throw err;
            res.json({img: result.thread_img_full});
        })
    });

    router.get('/getFullMessageImage', check_login, function(req, res) {
        console.log('getFullMessageImage get 요청');
        var database = req.app.get('database');
        database.MessageModel_sj.findOne({
            'message_id': req.query.message_id
        }, function(err, result){
            if(err) throw err;
            res.json({img: result.body_full});
        })
    });

    router.post('/newchat', check_login, function(req, res) {
        console.log('newchat post요청', req.body);
        if(!req.body.thread_name) res.json({errmessage: "채팅방 이름이 입력되지 않았습니다."});
        else{
            var paramName = req.body.thread_name;
            var paramIsopen = req.body.is_open=='false' ? false : req.body.is_open;
            var paramPassword = req.body.password ? req.body.password : '';
            var paramPeople = req.body.thread_n_people;
            var paramTime = req.body.thread_time;
            var paramAbout = req.body.thread_about;
            var paramIsUseRealname = req.body.is_use_realname=='false' ? false : req.body.is_use_realname;
            var paramCategory =  req.body.thread_category ? JSON.parse(req.body.thread_category) : undefined;
            var database = req.app.get('database');

            convertImage(setRoomImage(req.body.thread_img), function(err, paramImage){
                if(err) throw err;
                if(paramIsopen){
                    console.log('오픈 채팅방 만들기 요청');
                    var newthread = new database.ThreadModel_sj({
                        'thread_name': paramName, 'thread_n_people': paramPeople, 'thread_time': paramTime,
                        'thread_superuser_id': req.user.user_id, 'thread_img': paramImage.img_desize,
                        'thread_img_full': paramImage.img_full, 'thread_about': paramAbout,
                        'is_use_realname': paramIsUseRealname
                    });
                    newthread.save(function(err, result){
                        if(err) throw err;
                        setMessageCount(result.thread_id, database);
                        participate.participate_category(result.thread_id, paramCategory, database, function(err){
                            if(err) throw err;
                            else{
                                participate.participate_thread(result.thread_id, req.user.user_id, database, function(err, nick){
                                    if(err) throw err;
                                    else res.json({newstatus:true, errmessage: null, nickname:nick});
                                });
                            }
                        });
                    })
                }else{
                    console.log('비공개 채팅방 만들기 요청');
                    var newthread = new database.ThreadModel_sj({
                        'thread_name': paramName, 'thread_n_people': paramPeople, 'thread_time': paramTime,
                        'thread_superuser_id': req.user.user_id, 'password': paramPassword, 'is_open': false,
                        'thread_about': paramAbout, 'thread_img': paramImage.img_desize,
                        'thread_img_full': paramImage.img_full, 'is_use_realname': paramIsUseRealname
                    });
                    newthread.save(function(err, result){
                        if(err) throw err;
                        setMessageCount(result.thread_id, database);
                        participate.participate_category(result.thread_id, paramCategory, database, function(err){
                            if(err) throw err;
                            else{
                                participate.participate_thread(result.thread_id, req.user.user_id, database, function(err, nick){
                                    if(err) throw err;
                                    else res.json({newstatus:true, errmessage: null, nickname: nick});
                                });
                            }
                        });
                    })
                }
            });
        }
    });

    router.post('/jointhread', check_login, function(req, res) {
        console.log('jointhread post요청', req.body);
        var paramID = req.body.roomID;
        var paramPW = req.body.roomPW;
        var database = req.app.get('database');
        database.ThreadModel_sj.findOne({
            'thread_id':paramID
        }, function(err, thread){
            if(err) throw err;
            if(!thread.is_open){
                console.log('비공개 채팅방 입장');
                var authenticated = thread.authenticate(paramPW, thread._doc.salt, thread._doc.pwd_hashed);
                if (!authenticated) {
                    console.log('비밀번호 일치하지 않음.');
                    res.json({joinstatus:false, errmessage: "채팅방 비밀번호가 일치하지 않습니다."});
                } else{
                    participate.participate_thread(paramID, req.user.user_id, database, function(err, nick){
                        if(err) res.json({joinstatus:false, errmessage: err});
                        else res.json({joinstatus:true, errmessage: err, nickname: nick});
                    });
                }
            } else{
                console.log('공개 채팅방 입장');
                participate.participate_thread(paramID, req.user.user_id, database, function(err, nick){
                    if(err) res.json({joinstatus:false, errmessage: err});
                    else res.json({joinstatus:true, errmessage: null, nickname: nick});
                });
            }
        });
    });

    router.post('/leavethread', check_login, function(req, res) {
        console.log('leavethread post요청', req.body);
        var paramID = req.body.roomID;
        var database = req.app.get('database');
        database.ThreadModel_sj.findOne({
            'thread_id': paramID
        }, function(err, thread_result){
            if(err) throw err;
            if(thread_result.thread_superuser_id==req.user.user_id){
                database.ThreadParticipantModel_sj.find({
                    'super_thread_id': paramID
                }).remove(function(err){
                    database.CategoryParticipantModel_sj.find({
                        'super_thread_id': paramID
                    }).remove(function(err){
                        if (err) throw err;
                        thread_result.remove(function (err) {
                            if (err) throw err;
                            else res.json({leavestatus: true, errmessage: null});
                        })
                    })
                })
            }else{
                database.ThreadParticipantModel_sj.find({
                    'super_thread_id': paramID,
                    'super_user_id': req.user.user_id
                }).remove(function(err){
                    if(err) throw err;
                    else res.json({leavestatus:true, errmessage: null})
                });
            }
        });
    });

    router.get('/searchThread/:TEXT', check_login, function(req, res) {
        console.log('searchThread get 요청', req.params);
        var paramText = req.params.TEXT;
        var database = req.app.get('database');
        async.waterfall([
            function(done){
                var output_cat = [];
                database.CategoryModel_sj.findOne({
                    'category_name': paramText
                }, function (err, cat_result) {
                    if(err) throw err;
                    if(!cat_result) done(null, null);
                    else {
                        searchThreacbyCatid(cat_result.category_id, database, function (err, result) {
                            if (err) done(null, null);
                            else done(null, result)
                        })
                    }
                });
            },
            function(output_cat, done){
                var output_thread = [];
                database.ThreadModel_sj.find({
                    'thread_name': {$regex : new RegExp(paramText, "i")}
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
                                'key': result[i].thread_id,
                                'thread_name': result[i].thread_name,
                                'is_open': result[i].is_open,
                                'is_use_realname': result[i].is_use_realname,
                                'thread_n_people': result[i].thread_n_people,
                                'thread_time': result[i].thread_time,
                                'thread_about': result[i].thread_about,
                                'thread_img': result[i].thread_img,
                                'client_num': resultArr[i].cli,
                                'tag': resultArr[i].cat
                            };
                            output_thread.push(newChatList);
                        }
                        res.json({categorylist: output_cat, threadlist: output_thread});
                    });
                });
            }, function(err){
                if(err) throw err;
            }
        ])
    });

    router.get('/searchThreadbyCatId/:ID', check_login, function(req, res) {
        console.log('searchThreadbyCatId get 요청', req.params);
        var paramId = req.params.ID;
        var database = req.app.get('database');
        searchThreacbyCatid(paramId, database, function(err, threadlist){
            res.json({threadlist:threadlist});
        })
    });
    
    //edit chat는 1차 출시에서 빠짐
    router.post('/editchat', check_login, function(req, res){
        console.log('editChat post 요청', req.body);
        var paramId = req.body.thread_id;
        var paramPassword = req.body.password ? req.body.password : '';
        var paramPeople = req.body.thread_n_people;
        var paramTime = req.body.thread_time;
        var paramAbout = req.body.thread_about;
        var paramImage = req.body.thread_img;
        var paramCategory =  req.body.thread_category ? JSON.parse(req.body.thread_category) : undefined;
        var database = req.app.get('database');
        convertImage(paramImage, function(err, paramImage){
            if(err) throw err;
            participate.leave_category(paramId, database, function(err){
                if(err) throw err;
                database.ThreadModel_sj.findOne({
                    'thread_id': paramId
                }, function(err, result){
                    if(err) throw err;
                    if(result.thread_superuser_id != req.user.user_id)
                        return res.json({errmessage: "방장만 방을 수정할 수 있습니다."});
                    !result.is_open ? result.password = paramPassword : null;
                    result.thread_n_people = paramPeople;
                    result.thread_time = paramTime;
                    result.thread_about = paramAbout;
                    paramImage ? result.thread_img = paramImage.img_desize : null;
                    paramImage ? result.thread_img_full = paramImage.img_full : null;

                    result.save(function(err, result){
                        if(err) throw err;
                        participate.participate_category(result.thread_id, paramCategory, database, function(err){
                            if(err) throw err;
                            else res.json({editstatus: true});
                        });
                    })
                })
            })
        });
    })
};