var rawdb = require('../database/database');
var convertImage = require('../database/convertImage');
var async = require('async');

getImage = function(io, socket){
    console.log('image function load됨');
    socket.on('image', function(image){
        console.log('image를 받았습니다.');
        var msg = rawdb.mongoose.model('message_sj');
        var count = rawdb.mongoose.model('message_counter_sj');
        var ptcp = rawdb.mongoose.model('threadparticipant_sj');

        async.waterfall([
            function(done){
                ptcp.findOne({'super_thread_id':image.recipient, 'super_user_id': image.sender}, function(err, result){
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
                        image['nickname'] = result.nickname;
                        done(null);
                    }
                })
            },
            function(done){
                count.findOneAndUpdate({'super_thread_id': image.recipient},
                    {$inc:{'msg_count':1}}, {new:true}, function(err, result){
                    var id_count = result.msg_count;
                    image['message_id_unique'] = id_count;
                    done(null, id_count);
                })
            }, function(id_count, done){
                convertImage(image.data, function(err, result){
                    if(err) throw err;
                    var newimg = new msg({
                        'message_id_unique': id_count,
                        'super_thread_id': parseInt(image.recipient),
                        'body': result.img_desize,
                        'body_full': result.img_full,
                        'type': 'image',
                        'sending_user_id': parseInt(image.sender),
                        'expired_at': Date.now()
                    });
                    newimg.save(function(err, result){
                        if(err) console.log(err);
                        io.in(image.recipient).emit('message', {
                            recipient: image.recipient,
                            sender: image.sender,
                            data: result.body,
                            message_id_unique:image.message_id_unique,
                            message_id: result.message_id,
                            nickname: image.nickname,
                            type: 'image',
                            send_date: result.send_date
                        });
                        console.log('저장 완료');
                    });
                });
            }, function(err){
                if(err) console.log(err);
            }
        ]);
    });
};

module.exports = getImage;