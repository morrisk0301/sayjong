function RandomInt(maximum, minimum){
    return(Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
}

var nickfront = [
    "강인한", "고독한", "목마른", "배고픈", "배부른", "겸손한", "발랄한", "음흉한", "애매한", "이상한",
    "도망간", "행복한", "외로운", "귀여운", "멋있는", "지각한", "출튀한", "잘생긴", "예쁜", "당당한",
    "훈훈한", "울부짖는", "단단한", "얍삽한", "졸린", "위대한", "똑똑한", "친절한", "수줍은", "상냥한"
];

var nickmid = [
    "모짜르트홀", "대양홀", "집현관", "군자관", "이당관", "세종관", "애지헌", "학생회관",
    "광개토관", "진관홀", "용덕관", "율굑관", "아사달", "영실관", "충무관", "다산관",
    "우정당", "새날관", "동천관"
];

var nickback= [
    "오리", "고양이", "고릴라", "사슴", "기린", "강아지", "다람쥐", "당나귀", "늑대",
    "고슴도치", "치타", "코끼리", "표범", "토끼", "독수리", "앵무새", "침팬지", "기니피그",
    "햄스터", "악어", "미어캣", "부엉이", "원숭이", "펭귄", "돌고래", "스컹크", "두루미",
    "호랑이", "두꺼비", "코알라"
];

getNickname = function(database, thread_id, callback){
    console.log("getNickname 호출");
    var temp_nick;
    var check;
    database.ThreadParticipantModel_sj.find({'super_thread_id':thread_id}, function(err, result){
        while(1){
            temp_nick = generateNick();
            if(result.length==0){
                check = true;
                break;
            }
            result.forEach(
                function(item, counter){
                    if(item.nickname==temp_nick){
                        check = false;
                        return;
                    }
                    if(counter==result.length-1) check = true;
                }
            );
            if(check) break;
        }
        if(check) return callback(null, temp_nick);
    });
};

generateNick = function(){
    var front = RandomInt(29, 0);
    var mid = RandomInt(18, 0);
    var back = RandomInt(29, 0);
    var nick = nickfront[front] + nickmid[mid] + nickback[back];
    return nick;
};

module.exports = getNickname;