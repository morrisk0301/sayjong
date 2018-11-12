var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var NoticeSchema_sj = mongoose.Schema({
        notice_head: {type: String, 'default': ''}
        , notice_user: {type: String, 'default': ''}
        , notice_body: {type: String, 'default': ''}
		, created_at: {type: Date, 'default': Date.now()}
    });

    return NoticeSchema_sj;
};

module.exports = Schema;

