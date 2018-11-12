var async = require('async');
var getNickname = require('./nickname');

 participate_thread = function(thread_id, user_id, database, callback){
    async.waterfall([
        function(done) {
            database.ThreadParticipantModel_sj.findOne({
                'super_thread_id': thread_id,
                'super_user_id': user_id
            }, function (err, result) {
                if(err) return callback(err);
                if(result){
                    console.log('이미 Thread Participant DB에 등록되어 있음');
                    return callback('이미 Thread Participant DB에 등록되어 있음');
                }
                else done(null)
            })
        },
        function(done){
            database.ThreadModel_sj.findOne({'thread_id': thread_id}, function(err, result){
                if(result.is_use_realname){
                    database.UserModel_sj.findOne({'user_id': user_id}, function(err, name_result){
                        done(null, name_result.name, result);
                    })
                }else{
                    getNickname(database, thread_id, function(err, nick){
                        done(null, nick, result);
                    });
                }
            });
        },
        function(nick, result, done){
            var newTP = database.ThreadParticipantModel_sj({
                'super_thread_id': thread_id, 'super_user_id': user_id, 'expired_at': result.thread_time,
                'nickname': nick
            });
            newTP.save(function (err) {
                if (err) return callback(err);
                else{
                    console.log('Thread Participant DB에 등록 완료');
                    return callback(null, nick);
                }
            })
        }, function(err){
            if(err) return callback(err);
        }
    ]);
};

participate_category = function(thread_id, category_array, database, callback){
    if(!category_array){
        console.log('카테고리가 없습니다.');
        return callback(null);
    }
    async.waterfall([
        function(done){
            database.ThreadModel_sj.findOne({
                'thread_id': thread_id
            }, function(err, result){
                if(err) throw err;
                done(null, result);
            })
        },
        function(thread_result, done){
            var category_array_unique = category_array.filter(function(elem, index, self) {
                return index === self.indexOf(elem);
            });
            done(null, category_array_unique, thread_result)
        },
        function(category_array, thread_result, done){
            async.map(category_array, function(item, callback){
                addCategory(item, thread_id, database, function(err, result){
                    callback(err, result);
                })
            }, function(err, category_id_array){
                if(err) throw err;
                console.log("카테고리 저장 완료");
                console.log("카테고리 ID ARRAY:", category_id_array);
                done(null, category_id_array, thread_result);
            });
        },
        function(category_id_array, thread_result, done){
            async.map(category_id_array, function(item, callback){
                addCategoryPTCP(item, thread_result, database, function(err){
                    callback(err);
                })
            }, function(err){
                if(err) throw err;
                console.log("카테고리 ID 저장 완료");
                callback(null);
            });
        }, function(err){
            if(err) return callback(err);
        }
    ])
};

function addCategory(category, thread_id, database, callback){
    async.waterfall([
        function(done){
            database.CategoryModel_sj.findOne({
                'category_name': category
            }, function(err, result){
                if(err) callback(err);
                if(!result) done(null, null);
                else done(null, result);
            });
        },
        function(result, done){
            if(result) callback(null, result.category_id);
            else{
                var newCat = new database.CategoryModel_sj({
                    'category_name': category
                });
                newCat.save(function(err, result){
                    callback(err, result.category_id);
                })
            }
        }, function(err){
            if(err) throw err;
        }
    ]);
}

function addCategoryPTCP(category_id, thread_result, database, callback){
    async.waterfall([
        function(done){
            database.CategoryParticipantModel_sj.findOne({
                'super_category_id': category_id,
                'super_thread_id': thread_result.thread_id
            }, function(err, result){
                if(err) callback(err);
                if(!result) done(null);
                else{
                    console.log('이미 Category Participant DB에 등록됨');
                    callback(null);
                }
            });
        },
        function(done){
            database.CategoryModel_sj.findOne({
                'category_id': category_id
            }, function(err, result){
                if(err) throw err;
                done(null, result.category_name);
            })
        },
        function(category_name, done){
            var newCatPTCP = new database.CategoryParticipantModel_sj({
                'super_category_id': category_id,
                'super_category_name': category_name,
                'super_thread_id': thread_result.thread_id,
                'super_thread_name': thread_result.thread_name,
                'expired_at': thread_result.thread_time
            });
            newCatPTCP.save(function(err){
                callback(err);
            })
        }, function(err){
            if(err) throw err;
        }
    ]);
}

leave_category = function(thread_id, database, callback){
    database.CategoryParticipantModel_sj.find({
        'super_thread_id': thread_id
    }).remove(function(err){
        callback(err);
    });
};

module.exports = {participate_thread, participate_category, leave_category};