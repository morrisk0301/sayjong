var socketio = require('socket.io');
var message = require('./message');
var room = require('./room');
var getImage = require('./image');
var getMsg = require('./getmsg');


//클라이언트가 연결했을 때의 이벤트 처리

init = function(server){
    var io = socketio.listen(server);
    console.log('socket.io 요청을 받아들일 준비가 되었습니다.');
    io.on('connection', function(socket) {
        console.log('connection info :', socket.request.connection._peername);

        // 소켓 객체에 클라이언트 Host, Port 정보 속성으로 추가
        socket.remoteAddress = socket.request.connection._peername.address;
        socket.remotePort = socket.request.connection._peername.port;

        message(io, socket);
        room(io, socket);
        getImage(io, socket);
        getMsg(io, socket);
    });
};

module.exports = init;