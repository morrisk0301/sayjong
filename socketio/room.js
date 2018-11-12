var rawdb = require('../database/database');

room = function(io, socket){
    console.log('room function load됨');
    socket.on('room', function (room) {
        console.log('room 이벤트를 받았습니다.');
        if(room.command === 'join'){
            rawdb.mongoose.model('threadparticipant_sj').findOne({
                'super_thread_id':room.roomId,
                'super_user_id':room.sender
            }, function(err, result){
                if(err) console.log(err);
                if(!result){
                    var output = {command: 'join', msg: "내가 입장한 채팅방이 아닙니다."};
                    io.to(socket.id).emit('alarm', output);
                }
                else{
                    socket.join(room.roomId);

                    var output = {command: 'join', msg: "채팅방 소켓 접속 완료"};
                    io.to(socket.id).emit('alarm', output);
                }
            })
        }
        else if (room.command === 'leave') {  // 방 나가기 요청
            socket.leave(room.roomId);

            var output = {command: 'leave', msg: "채팅방 소켓 접속 해제 완료"};
            io.to(socket.id).emit('alarm', output);
        }
    });
};

getRoomList = function(io, userSocketId) {
    //console.dir(io.sockets.adapter.rooms);

    var roomList = [];

    Object.keys(io.sockets.adapter.rooms).forEach(function(roomId) { // for each room
        console.log('current room id : ' + roomId);
        var outRoom = io.sockets.adapter.rooms[roomId];

        // find default room using all attributes
        var foundDefault = false;
        var foundUser = false;
        var index = 0;
        Object.keys(outRoom.sockets).forEach(function(key) {
            console.log('#' + index + ' : ' + key + ', ' + outRoom.sockets[key]);

            if (roomId == key) {  // default room
                foundDefault = true;
                console.log('this is default room.');
            }
            if(key == userSocketId){
                foundUser = true;
                console.log('user is in the room.')
            }
            index++;
        });

        if (!foundDefault && foundUser) {
            roomList.push(outRoom);
        }
    });

    console.log('[ROOM LIST]');
    console.dir(roomList);

    return roomList;
};

module.exports = room;