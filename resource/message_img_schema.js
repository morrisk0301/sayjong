var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var MessageIMGSchema_sj = mongoose.Schema({
        message_id_unique: {type:Number, required: true}
        , super_thread_id: {type: Number, required: true}
        , send_date: {type: Date, 'default': Date.now}
        , image: {type:String, 'default':''}
        , sending_user_id: {type: Number, required: true}
        , expired_at: {type: Date, expires: '30d'}
    });

    return MessageIMGSchema_sj;
};

module.exports = Schema;