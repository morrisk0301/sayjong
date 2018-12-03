var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var BanSchema_sj = mongoose.Schema({
        ban_type: {type:String, 'default':'user'}
        , shingo_email: {type:String, require:true}
        , ban_reason: {type:Number, required:true}
        , ban_thread_id: {type:Number, required:true}
        , ban_nickname: {type:String}
        , ban_body: {type:String, 'default':''}
        , ban_img: {type:String, 'default':''}
        , ban_img2: {type:String, 'default':''}
        , ban_img3: {type:String, 'default':''}
        , ban_email: {type:String}
        , ban_result: {type:String}
        , ban_days: {type:Number}
        , ban_feedback: {type:String}
        , ban_admin: {type:String}
        , user_ban_id: {type:Number}
		, created_at: {type: Date, 'default': Date.now()}
    });

    return BanSchema_sj;
};

module.exports = Schema;

