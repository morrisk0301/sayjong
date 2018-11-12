var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var CategoryParticipantSchema_sj = mongoose.Schema({
        super_thread_id: {type: Number, required: true}
        , super_category_id: {type: Number, required: true}
        , super_thread_name: {type: String, required: true}
        , super_category_name: {type:String, required: true}
        , expired_at: {type: Date, expires: '1s'}
    });

    return CategoryParticipantSchema_sj;
};

module.exports = Schema;