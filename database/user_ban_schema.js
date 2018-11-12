var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var UserBanSchema_sj = mongoose.Schema({
        ban_email: {type: String, required:true}
        , ban_reason: {type: Number, required:true}
        , ban_days: {type: Number}
        , expired_at: {type: Date, expires: '1s'}
    });

    return UserBanSchema_sj;
};

module.exports = Schema;

