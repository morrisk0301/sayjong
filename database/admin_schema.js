var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var AdminSchema_sj = mongoose.Schema({
        user_id: {type: Number, unique: true}
        , email: {type: String, unique: true}
        , name: {type: String, 'default':''}
        , nickname: {type: String, unique: true}
		, admin_rank: {type: Number, 'default':1}
		, created_at: {type: Date, 'default': Date.now()}
    });

    return AdminSchema_sj;
};

module.exports = Schema;

