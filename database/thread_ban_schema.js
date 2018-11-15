var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {

    var ThreadBanSchema_sj = mongoose.Schema({
        thread_id: {type: Number, required: true}
        , thread_name: {type: String}
        , thread_superuser_id: {type: Number, required: true}
        , thread_n_people: {type: Number}
        , thread_img: {type:String}
        , thread_time: {type: Date}
        , thread_about: {type: String}
        , is_ban: {type: Boolean}
        , is_open: {type: Boolean}
        , is_hot: {type: Number}
        , is_use_realname: {type:Boolean}
        , thread_created_at: {type: Date}
        , ban_reason: {type: Number}
        , created_at: {type: Date, 'default': Date.now}
    });

    return ThreadBanSchema_sj;
};

module.exports = Schema;