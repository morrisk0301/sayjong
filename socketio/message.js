var rawdb = require('../database/database');
var async = require('async');

message = function(io, socket){
    console.log('message function load됨');
    socket.on('message', function(message) {
        console.log('message 이벤트를 받았습니다.');
        var msg = rawdb.mongoose.model('message_sj');
        var thread = rawdb.mongoose.model('thread_sj');
        var count = rawdb.mongoose.model('message_counter_sj');
        var ptcp = rawdb.mongoose.model('threadparticipant_sj');

        async.waterfall([
            function(done){
                ptcp.findOne({'super_thread_id':message.recipient, 'super_user_id': message.sender}, function(err, result){
                    if(!result){
                        var output = {
                            'sender': -1,
                            'recipient': message.sender,
                            'data': '이 채팅방은 거위털 베개처럼 폭파되었습니다.',
                            'nickname': '관리자'
                        };
                        io.to(socket.id).emit('message', output);
                        return;
                    }
                    else{
                        message['nickname'] = result.nickname;
                        done(null);
                    }
                })
            },
            function(done){
                thread.findOne({'thread_id': message.recipient}, function(err, result){
                    var date = result.thread_time;
                    done(null, date);
                })
            },
            function(date, done){
                count.findOneAndUpdate({'super_thread_id': message.recipient},
                    {$inc:{'msg_count':1, 'current_count':1}}, {new:true}, function(err, result){
                    var id_count = result.msg_count;
                    message['message_id_unique'] = id_count;
                    done(null, date, id_count);
                })
            },
            function(date, id_count, done){
                var newmsg = new msg({
                    'message_id_unique': id_count,
                    'super_thread_id': parseInt(message.recipient),
                    'body': message.data,
                    'type': 'text',
                    'sending_user_id': parseInt(message.sender),
                    'expired_at': date
                });

                newmsg.save(function(err, result){
                    if(err) console.log(err);
                    message.type="text";
                    message.send_date = result.send_date;
                    message.message_id = result.message_id;
                    io.in(message.recipient).emit('message', message);
                });
            }, function(err){
                if(err) console.log(err);
            }
        ]);
    });
};

module.exports = message;