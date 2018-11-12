var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var MessageSchema_sj = mongoose.Schema({
        banner_img: {type: String, required: true}
        , banner_type: {type: String, required: true}
        , banner_link: {type: String}
        , banner_user: {type: String, 'default': ''}
        , created_at: {type: Date, 'default': Date.now()}
    });

    return MessageSchema_sj;
};

module.exports = Schema;