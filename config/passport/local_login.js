var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true   // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	}, function(req, email, password, done) { 
		console.log('passport의 local-login 호출됨 : ' + email + ', ' + password);
		var database = req.app.get('database');
	    database.UserModel_sj.findOne({ 'email' :  email }, function(err, user) {
	    	if (err) return done(null, null, "1-8");

	    	// 등록된 사용자가 없는 경우
	    	if (!user) {
	    		console.log('계정이 일치하지 않음.');
	    		return done(null, null, "1-2");
	    	}
	    	else{
	    		if(user.isUnregistered)
	    			return done(null, null, "1-7");
	    		database.UserBanModel_sj.findOne({
					'ban_email': email
				}, function(err, ban_user){
	    			if(err) throw err;
	    			if(ban_user) return done(null, null, "1-6");
	    			else{
                        database.AdminModel_sj.findOne({
                            'email': email
                        }, function(err, user_admin){
                            if(err) throw err;
                            var authenticated = user.authenticate(password, user._doc.salt, user._doc.pwd_hashed);
                            if (!authenticated) {
                                console.log('비밀번호 일치하지 않음.');
                                return done(null, null, "1-1");
                            }
                            if(!user_admin){
                                console.log('계정과 비밀번호가 일치함.');
                                console.log(user);
                                return done(null, user, "1-0");
                            } else{
                                console.log('관리자 로그인.');
                                console.log(user_admin);
                                return done(null, user, "1-5");
                            }
                        })
					}
				})
			}
	    });
	});

