var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var ThreadSchema_sj = mongoose.Schema({
        thread_name: {type: String, 'default':''}
        , pwd_hashed: {type: String, 'default':''}
        , salt: {type: String}
        , thread_superuser_id: {type: Number, required: true}
        , thread_n_people: {type: Number, 'default':1000}
        , thread_img: {type:String, 'default':''}
        , thread_time: {type: Date, 'default': '2100-01-01', expires:'1s'}
        , thread_about: {type: String, 'default': ''}
        , is_ban: {type: Boolean, 'default': false}
        , is_open: {type: Boolean, 'default': true}
        , is_hot: {type: Number, 'default': -1}
        , is_use_realname: {type:Boolean, 'default': false}
        , created_at: {type: Date, 'default': Date.now}
        , updated_at: {type: Date, 'default': Date.now}
    });
    ThreadSchema_sj
        .virtual('password')
        .set(function(password) {
            this._password = password;
            this.salt = this.makeSalt();
            this.pwd_hashed = this.encryptPassword(password);
            console.log('virtual password 호출됨 : ' + this.pwd_hashed);
        })
        .get(function() { return this._password });

    // 스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
    // 비밀번호 암호화 메소드
    ThreadSchema_sj.method('encryptPassword', function(plainText, inSalt) {
        if (inSalt) {
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });

    // salt 값 만들기 메소드
    ThreadSchema_sj.method('makeSalt', function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });

    // 인증 메소드 - 입력된 비밀번호와 비교 (true/false 리턴)
    ThreadSchema_sj.method('authenticate', function(plainText, inSalt, pwd_hashed) {
        if (inSalt) {
            console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), pwd_hashed);
            return this.encryptPassword(plainText, inSalt) === pwd_hashed;
        } else {
            console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText), this.pwd_hashed);
            return this.encryptPassword(plainText) === this.pwd_hashed;
        }
    });

    return ThreadSchema_sj;
};

module.exports = Schema;