var Schema = {};

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var CategorySchema_sj = mongoose.Schema({
        category_name: {type:String, required: true, unique: true},
        category_hot: {type:Number, 'default': -1},
        category_counter: {type:Number, 'default': -1}
    });

    return CategorySchema_sj;
};

module.exports = Schema;