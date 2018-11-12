login = function(socket){
    console.log('logiin function load됨');
    socket.on('login', function(login) {
        console.log('login 이벤트를 받았습니다.');
        console.dir(login);

        // 기존 클라이언트 ID가 없으면 클라이언트 ID를 맵에 추가
        console.log('접속한 소켓의 ID : ' + socket.id);
        login_ids[login.id] = socket.id;
        socket.login_id = login.id;

        console.log('접속한 클라이언트 ID 갯수 : %d', Object.keys(login_ids).length);
        // 응답 메시지 전송
        sendResponse(socket, 'login', '200', '로그인되었습니다.');
    });
};

module.exports = login;