var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true    // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	}, function(req, email, password, done) {
    // 요청 파라미터 중 name 파라미터 확인
	var paramName = req.body.name;
	var paramStuid = req.body.stuid;

	console.log('passport의 local-signup 호출됨 ');

	// findOne 메소드가 blocking되지 않도록 하고 싶은 경우, async 방식으로 변경
	process.nextTick(function() {
		var database = req.app.get('database');
		var rawdb = require('../../database/database');

		database.UserModel_sj.findOne({ 'email' :  email }, function(err, user) {
			// 에러 발생 시
			if (err) {
				return done(err);
			}

            var nev = require('../email_verification');

            // 모델 인스턴스 객체 만들어 저장
            rawdb.mongoose.model('IdentityCounter').findOne({'model':'UserModel_sj'}, function(err, result){
                if(err) throw err;
                result.count += 1;
                result.save(function(err){
                    if(err) throw err;
                    var newuser = new database.UserModel_sj({
                        'email':email, 'password':password, 'name':paramName, 'user_id': result.count,
                        'stuid': paramStuid
                    });

                    nev.createTempUser(newuser, function(err, existingPersistentUser, newTempUser){
                        if(err) return done(err);

                        if(existingPersistentUser){
                            var error = '2-7';
                            return done(error);
                        }

                        if(newTempUser){
                            var URL = newTempUser[nev.options.URLFieldName];
                            nev.sendVerificationEmail(email, URL, function(err, info){
                                if(err)
                                    throw err;
                                    //return done("2-9");
                                else {
                                    result.count = result.count + 1;
                                    result.save(function(err){
                                        return done("2-0");
                                    });
                                }
                            })
                        } else {
                            nev.resendVerificationEmail(email, function(err, userFound){
                                if(err) throw err;
                                if(userFound) return done("2-0");
                                else return done("2-9");
                            })
                        }
                    });
                })
            });
		});
	});

});
