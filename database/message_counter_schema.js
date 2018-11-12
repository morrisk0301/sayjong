var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var MessageCounterSchema_sj = mongoose.Schema({
        super_thread_id: {type: Number, unique: true}
        , msg_count: {type: Number, 'default': -1}
        , current_count: {type: Number, 'default': -1}
        , expired_at: {type: Date, expires: '30d'}
    });

    return MessageCounterSchema_sj;
};

module.exports = Schema;