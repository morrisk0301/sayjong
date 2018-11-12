var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var ThreadParticipantSchema_sj = mongoose.Schema({
        super_thread_id: {type: Number, required: true}
        , super_user_id: {type: Number, required: true}
        , nickname: {type: String}
        , participate_time: {type: Date, 'default':Date.now}
        , expired_at: {type: Date, expires: '1s'}
    });

    return ThreadParticipantSchema_sj;
};

module.exports = Schema;