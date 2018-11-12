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

    //chat 화면
    router.route('/mychat').get(function(req, res) {
        console.log('mychat get 요청');
        if(!req.user) res.json({loginstatus: false, threadlist: null});
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
                                    'thread_img': result[i].thread_img,
                                    'client_num': resultArr[i].cli,
                                    'tag': resultArr[i].cat
                                };
                                threadlist.push(newChatList);
                            }
                            res.json({loginstatus: true, threadlist: threadlist});
                        });
                    });
                }, function(err){
                    if(err) throw err;
                }
            ]);
        }
    });

    router.route('/getAllChat').get(function(req, res) {
        console.log('getAllChat get 요청');
        if(!req.user) res.json({loginstatus: false, threadlist: null});
        else{
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
                    res.json({loginstatus: true, threadlist: threadlist});
                });
            });
        }
    });

    router.route('/getNewChat').get(function(req, res) {
        console.log('getNewChat get 요청');
        if(!req.user) res.json({loginstatus: false, threadlist: null});
        else{
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
                    res.json({loginstatus: true, threadlist: threadlist});
                });
            });
        }
    });

    router.route('/getHotChat').get(function(req, res){
        console.log('getHotChat get 요청');
        if(!req.user) res.json({loginstatus: false, threadlist: null});
        else{
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
                            'thread_id': result[i].thread_id,
                            'thread_name': result[i].thread_name,
                            'is_open': result[i].is_open,
                            'thread_n_people': result[i].thread_n_people,
                            'thread_time': result[i].thread_time,
                            'thread_about': result[i].thread_about,
                            'thread_img': result[i].thread_img,
                            'client_num': resultArr[i].cli,
                            'tag': resultArr[i].cat
                        };
                        threadlist.push(newChatList);
                    }
                    res.json({loginstatus: true, threadlist: threadlist});
                });
            });
        }
    });

    router.route('/getHotCategory').get(function(req, res){
        console.log('getHotCategory get 요청');
        if(!req.user) res.json({loginstatus: false, catlist: null});
        else{
            var database = req.app.get('database');
            var catlist = [];
            database.CategoryModel_sj.find({
                'category_hot': {$ne: -1}
            }, function(err, result){
                if(err) throw err;
                for(var i=0;i<result.length;i++){
                    catlist.push({
                        category_id: result[i].category_id,
                        category_name: result[i].category_name
                    });
                }
                res.json({loginstatus: true, catlist: catlist});
            })
        }
    });

    router.route('/newchat').post(function(req, res) {
        console.log('newchat post요청', req.body);
        if(!req.user) res.json({newstatus: false, loginstatus: false, errmessage: null, nickname: null});
        else if(!req.body.thread_name) res.json({newstatus: false, loginstatus: true, errmessage: "채팅방 이름이 입력되지 않았습니다.", nickname: null});
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
                        'thread_superuser_id': req.user.user_id, 'thread_img': paramImage,
                        'thread_about': paramAbout, 'is_use_realname': paramIsUseRealname
                    });
                    newthread.save(function(err, result){
                        if(err) throw err;
                        setMessageCount(result.thread_id, database);
                        participate.participate_category(result.thread_id, paramCategory, database, function(err){
                            if(err) throw err;
                            else{
                                participate.participate_thread(result.thread_id, req.user.user_id, database, function(err, nick){
                                    if(err) throw err;
                                    else res.json({newstatus:true, loginstatus: true, errmessage: null, nickname:nick});
                                });
                            }
                        });
                    })
                }else{
                    console.log('비공개 채팅방 만들기 요청');
                    var newthread = new database.ThreadModel_sj({
                        'thread_name': paramName, 'thread_n_people': paramPeople, 'thread_time': paramTime,
                        'thread_superuser_id': req.user.user_id, 'password': paramPassword, 'is_open': false,
                        'thread_about': paramAbout, 'thread_img': paramImage, 'is_use_realname': paramIsUseRealname
                    });
                    newthread.save(function(err, result){
                        if(err) throw err;
                        setMessageCount(result.thread_id, database);
                        participate.participate_category(result.thread_id, paramCategory, database, function(err){
                            if(err) throw err;
                            else{
                                participate.participate_thread(result.thread_id, req.user.user_id, database, function(err, nick){
                                    if(err) throw err;
                                    else res.json({newstatus:true, loginstatus: true, errmessage: null, nickname: nick});
                                });
                            }
                        });
                    })
                }
            });
        }
    });

    router.route('/jointhread').post(function(req, res) {
        console.log('jointhread post요청', req.body);
        if(!req.user) res.json({joinstatus: false, loginstatus: false, errmessage: null});
        else{
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
        }
    });

    router.route('/leavethread').post(function(req, res) {
        console.log('leavethread post요청', req.body);
        if(!req.user) res.json({leavestatus: false, loginstatus: false, errmessage: null});
        else{
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
                        if(err) throw err;
                        thread_result.remove(function(err){
                            if(err) throw err;
                            else res.json({leavestatus:true, errmessage: null});
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
        }
    });

    router.route('/searchThread/:TEXT').get(function(req, res) {
        console.log('searchThread get 요청', req.params);
        var paramText = req.params.TEXT;
        var database = req.app.get('database');
        if(!req.user) res.json({loginstatus: false, categorylist: null, threadlist: null});
        else {
            async.waterfall([
                function(done){
                    var output_cat = [];
                    database.CategoryModel_sj.find({}, function (err, result) {
                        if(err) throw err;
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].category_name.toLowerCase().includes(paramText.toLowerCase()))
                                output_cat.push({category_id: result[i].category_id, category_name: result[i].category_name});
                        }
                        done(null, output_cat);
                    });
                },
                function(output_cat, done){
                    var output_thread = [];
                    database.ThreadModel_sj.find({}, function (err, result) {
                        if(err) throw err;
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].thread_name.toLowerCase().includes(paramText.toLowerCase()))
                                output_thread.push({thread_id: result[i].thread_id, thread_name: result[i].thread_name});
                        }
                        res.json({loginstatus: true, categorylist: output_cat, threadlist: output_thread});
                    });
                }, function(err){
                    if(err) throw err;
                }
            ])
        }
    });

    router.route('/searchThreadbyCatId/:ID').get(function(req, res) {
        console.log('searchThreadbyCatId get 요청', req.params);
        var paramId = req.params.ID;
        var database = req.app.get('database');
        if(!req.user) res.json({loginstatus: false, threadlist: null});
        else{
            database.CategoryModel_sj.findOneAndUpdate({
                'category_id': paramId
            }, {$inc:{'category_counter':1}}, {new:true}, function(err){
                if(err) throw err;
                database.CategoryParticipantModel_sj.find({
                    'super_category_id': paramId
                }, function(err, result){
                    var output = [];
                    if(err) throw err;
                    for(var i=0;i<result.length;i++){
                        output.push({thread_id: result[i].super_thread_id, thread_name: result[i].super_thread_name});
                    }
                    res.json({loginstatus: true, threadlist: output})
                })
            });
        }
    });

    router.route('/editchat').post(function(req, res){
        console.log('editChat post 요청', req.body);
        if(!req.user) res.json({loginstatus: false, newstatus: false});
        else{
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
                            return res.json({loginstatus: true, newstatus: false, errmessage: "방장만 방을 수정할 수 있습니다."});
                        !result.is_open ? result.password = paramPassword : null;
                        result.thread_n_people = paramPeople;
                        result.thread_time = paramTime;
                        result.thread_about = paramAbout;
                        paramImage ? result.thread_img = paramImage : null;

                        result.save(function(err, result){
                            if(err) throw err;
                            participate.participate_category(result.thread_id, paramCategory, database, function(err){
                                if(err) throw err;
                                else res.json({loginstatus: true, editstatus: true});
                            });
                        })
                    })
                })
            });
        }
    })
};