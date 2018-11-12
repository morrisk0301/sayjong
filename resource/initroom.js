var rawdb = require('../database/database');
var async = require('async');

init_room = function(io, socket){
    console.log('init_room function load됨');
    socket.on('initroom', function(user_id) {
        console.log('init_room 이벤트를 받았습니다');
        async.waterfall([
            function (done) {
                rawdb.mongoose.model('threadparticipant_sj').find({'super_user_id': user_id}, function (err, result) {
                    if (err) console.log(err);
                    done(err, result);
                });
            },
            function (result, done) {
                var counter = 0;
                for (var j = 0; j < result.length; j++) {
                    rawdb.mongoose.model('thread_sj').findOne({'thread_id': result[j].super_thread_id}, function (err, thread) {
                        socket.join(thread.thread_id);
                        console.log('방 입장!');
                        var curRoom = io.sockets.adapter.rooms[thread.thread_id];
                        curRoom.thread_id = thread.thread_id;
                        curRoom.thread_name = thread.thread_name;
                        curRoom.thread_superuser_id = thread.thread_superuser_id;
                        curRoom.thread_time = thread.thread_time;
                        curRoom.thread_n_people = thread.thread_n_people;
                        curRoom.is_open = thread.is_open;
                        counter++;
                        if (counter == result.length) done(null);
                    });
                }
            }, function(done){
                var roomList = getRoomList(io, socket.id);
                var output = {command: 'list', rooms: roomList};
                done(null, output);
            }, function (output, done) {
                io.to(socket.id).emit('room', output);
                console.log('socket 채팅방 설정 완료!');
            }, function (err) {
                console.log(err);
            }
        ]);
    });
};

module.exports = init_room;