var sortmethod = require('./sort');

function updateCounter(msg_counter){
    msg_counter.update({}, {'current_count': -1}, {multi: true}, function(err){
        console.log('current_date, current_count 업데이트 완료')
    });
}

function updateThread(thread, thread_id, counter, current_count){
    thread.update(
        {'thread_id': thread_id}, {'is_hot': counter < 5 && current_count!=-1 ? counter : -1},
        {multi: true}, function(err){
        if(err) console.log(err);
    })
}

function setHot(rawdb){
    var msg_counter = rawdb.mongoose.model('message_counter_sj');
    var thread = rawdb.mongoose.model('thread_sj');
    console.log('is_hot 리셋 완료');
    msg_counter.find().exec(function(err, result){
        result = result.sort(sortmethod.sortWithCurrentCount);
        result.forEach(function(item, counter){
            updateThread(thread, item.super_thread_id, counter, item.current_count);
        });
        updateCounter(msg_counter);
    });
}

module.exports = function(){
    var rawdb = require('./database');
    setHot(rawdb);

    setInterval(function(){
        setHot(rawdb);
    }, 1000 * 60 * 60 * 24); // 1일

};