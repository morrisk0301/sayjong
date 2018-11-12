var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var MessageSchema_sj = mongoose.Schema({
        message_id_unique: {type:Number, required: true}
        , super_thread_id: {type: Number, required: true}
        , send_date: {type: Date, 'default': Date.now}
        , body: {type: String, 'default':''}
        , type: {type: String}
        , sending_user_id: {type: Number, required: true}
        , expired_at: {type: Date, expires: '30d'}
    });

    return MessageSchema_sj;
};

module.exports = Schema;