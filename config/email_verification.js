var rawdb = require('../database/database');
var User = rawdb.mongoose.model('user_sj');
var nev = require('email-verification')(rawdb.mongoose);

nev.configure({
    verificationURL: 'http://localhost:9948/email-verification/${URL}',
    //verificationURL: 'http://49.236.137.121:9948/email-verification/${URL}',
    URLLength: 48,
    persistentUserModel: User,
    expirationTime: 86400,
    transportOptions: {
        host: 'smtp.office365.com', // Office 365 server
        port: 587,     // secure SMTP
        secureConnection: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
        auth: {
            user: '13011874@sju.ac.kr',
            pass: '453mor30!'
        },
        tls: {
            ciphers: 'SSLv3'
        }
    },
    verifyMailOptions: {
        from: '세이종<13011874@sju.ac.kr>',
        subject: '세이종 이메일 인증',
        html: '<p><a href="${URL}">여기를 클릭하시면 이메일 인증이 완료 됩니다.</a> 이 주소를 ' +
        '브라우저에 복사하고 접속하셔도 인증이 완료 됩니다.:</p><p>${URL}</p>',
        text: 'Please verify your account by clicking the following link, or by copying and pasting it into your browser: ${URL}'
    },
    shouldSendConfirmation: true,
    confirmMailOptions: {
        from: '세이종<13011874@sju.ac.kr>',
        subject: '세이종 이메일 인증이 완료되었습니다!',
        html: '<p>세이종 이메일 인증을 완료해 주셔서 감사합니다!</p>',
        text: '이제 정상적으로 세이종을 사용하실 수 있습니다.'
    },
    // hashingFunction: null
}, function (err, options) {
    if (err) console.error(err);
    console.log('configured: ' + (typeof options === 'object'));
});
nev.generateTempUserModel(User, function (err, tempUserModel) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('generated temp user model: ' + (typeof tempUserModel === 'function'));
});


module.exports = nev;