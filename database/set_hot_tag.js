var sortmethod = require('./sort');

function updateCounter(category){
    category.update({}, {'category_counter': -1}, {multi: true}, function(err){
        console.log('category counter 업데이트 완료')
    });
}

function updateCategory(category, category_id, counter, current_count){
    category.update(
        {'category_id': category_id}, {'category_hot': counter < 10 && current_count!=-1 ? counter : -1},
        {multi: true}, function(err){
        if(err) console.log(err);
    })
}

function setHot(rawdb){
    var category = rawdb.mongoose.model('category_sj');
    console.log('category_hot 리셋 완료');
    category.find().exec(function(err, result){
        result = result.sort(sortmethod.sortWithCategoryCounter);
        console.log(result);
        result.forEach(function(item, counter){
            updateCategory(category, item.category_id, counter, item.category_counter);
        });
        updateCounter(category);
    });
}


module.exports = function(){
    var rawdb = require('./database');
    setHot(rawdb);

    setInterval(function(){
        setHot(rawdb);
    }, 1000 * 60 * 60 * 24); // 1일

};