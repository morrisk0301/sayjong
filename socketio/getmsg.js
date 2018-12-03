var rawdb = require('../database/database');
var async = require('async');
var searchNum = 20;
var sortmethod = require('../database/sort');

function getNick(ptcp, threadID, userID, callback){
    ptcp.findOne({
        'super_thread_id': threadID,
        'super_user_id': userID
    }, function(err, result){
        if(err) throw err;
        return callback(result.nickname);
    })
}

function initMsgfromDB(msg, ptcp, threadID, callback){
    msg.find({'super_thread_id': threadID}, function(err, result){
        var output = [];
        var startcnt = result.length<searchNum ? 0 : result.length-searchNum;

        async.map(result, function(item, callback){
            getNick(ptcp, threadID, item.sending_user_id, function(nick){
                callback(null, nick);
            })
        }, function(err, resultNick){
            if(err) throw err;
            for(var i=startcnt;i<result.length;i++){
                var newval = {
                    'sender': result[i].sending_user_id,
                    'recipient': threadID,
                    'data': result[i].body,
                    //'message_id_unique': result.length-1-result[i].message_id_unique,
                    'message_id_unique': result[i].message_id_unique,
                    'message_id': result[i].message_id,
                    'type': result[i].type,
                    'send_date': result[i].send_date,
                    'send_date_string': result[i].send_date_string,
                    'nickname': resultNick[i]
                };
                output.push(newval);
            }
            return callback(null, output);
        })
    })
}

function getMsgfromDB(msg, ptcp, threadID, msgStartId, msgEndId, callback){
    msg.find({'super_thread_id': threadID}, function(err, result){
        var output = [];
        var startcnt = msgStartId>=0 && msgStartId<=result.length ? msgStartId : 0;
        var endcnt = msgEndId>=0 && msgEndId<=result.length ? msgEndId : 0;

        async.map(result, function(item, callback){
            getNick(ptcp, threadID, item.sending_user_id, function(nick){
                callback(null, nick);
            })
        }, function(err, resultNick){
            if(err) throw err;
            for(var i=startcnt;i<endcnt;i++){
                var newval = {
                    'sender': result[i].sending_user_id,
                    'recipient': threadID,
                    'data': result[i].body,
                    //'message_id_unique': result.length-1-result[i].message_id_unique,
                    'message_id_unique': result[i].message_id_unique,
                    'message_id': result[i].message_id,
                    'type': result[i].type,
                    'send_date': result[i].send_date,
                    'send_date_string': result[i].send_date_string,
                    'nickname': resultNick[i]
                };
                output.push(newval);
            }
            return callback(null, output);
        })
    })
}

function searchMsgfromDB(msg, ptcp, threadID, searchTxt, msgId, callback){
    if(searchTxt.length<2) return callback('Less than 2 letters', null);
    msg.find({'super_thread_id': threadID}, function(err, result){
        var output = [];
        var searchcnt = msgId>=0 && msgId<=result.length ? msgId : 0;

        async.map(result, function(item, callback){
            getNick(ptcp, threadID, item.sending_user_id, function(nick){
                callback(null, nick);
            })
        }, function(err, resultNick){
            if(err) throw err;

            for(var i=searchcnt;i>=0;i--){
                if(result[i].type=='text' && result[i].body.toLowerCase().includes(searchTxt.toLowerCase())){
                    var startcnt = i>=0 ? i : 0;
                    var endcnt = i+20<=result.length? i+20 : result.length;
                    for(var j=startcnt;j<endcnt;j++){
                        var newval = {
                            'sender': result[j].sending_user_id,
                            'recipient': threadID,
                            'data': result[j].body,
                            //'message_id_unique': result.length-1-result[j].message_id_unique,
                            'message_id_unique': result[j].message_id_unique,
                            'message_id': result[j].message_id,
                            'type': result[j].type,
                            'send_date': result[j].send_date,
                            'send_date_string': result[j].send_date_string,
                            'nickname': resultNick[j]
                        };
                        output.push(newval);
                    }
                    break;
                }
                //없으면 없다고 쏴주기
            }

            return callback(null, output);
        })
    });
}


getMsg = function(io, socket){
    console.log('getmsg function load됨');
    socket.on('getmsg', function(msgQuery){
        console.log('getmsg 요청');
        console.log(msgQuery);

        var msg = rawdb.mongoose.model('message_sj');
        var ptcp = rawdb.mongoose.model('threadparticipant_sj');
        var thread = rawdb.mongoose.model('thread_sj');

        async.waterfall([
            function(done){
                //thread_participant DB에서 유저, 채팅방 매칭 확인
                ptcp.findOne({'super_thread_id': msgQuery.roomId, 'super_user_id': msgQuery.sender}, function(err, result){
                    if(!result)
                        return io.to(socket.id).emit('alarm', {command: 'getmsg', msg: "err"});
                    else done(null);
                })
            },
            function(done){
                thread.findOne({
                    'thread_id': msgQuery.roomId
                }, function(err, result){
                    if(err) throw err;
                    if(result.is_ban){
                        var output = [{
                            'sender': 0,
                            'recipient': msgQuery.roomId,
                            'data': '이 채팅방은 신고된 채팅방입니다. 24시간 후 삭제 예정입니다.',
                            'message_id_unique': 0,
                            'type': 'text',
                            'send_date': Date.now(),
                            'nickname': '관리자'
                        }];
                        return io.to(socket.id).emit('getmsg', output);
                    }
                    else done(null);
                })
            },
            function(done){
                if(msgQuery.command=='init'){
                    initMsgfromDB(msg, ptcp, msgQuery.roomId, function(err, result){
                        done(null, result);
                    });
                }
                else if(msgQuery.command=='get'){
                    getMsgfromDB(msg, ptcp, msgQuery.roomId, msgQuery.msg_idx_start, msgQuery.msg_idx_end, function(err, result){
                        done(null, result);
                    });
                }
                else if(msgQuery.command=='search') {
                    searchMsgfromDB(msg, ptcp, msgQuery.roomId, msgQuery.searchtxt, msgQuery.searchId, function(err, result){
                        if(err){
                            console.log(err);
                            return;
                        }
                        done(null, result);
                    })
                }
            },
            function(output, done){
                if(output.length>0) {
                    output_sort = output.sort(sortmethod.sortWithMessageIdUnique);
                    io.to(socket.id).emit('getmsg', output_sort);
                } else
                    io.to(socket.id).emit('alarm', {command: 'getmsg', msg: "err"});
            }, function(err){
                if(err) console.log(err);
            }
        ]);
    });
};


module.exports = getMsg;