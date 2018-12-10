var express = require('express')
  , http = require('http')
  , path = require('path');

var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');
  

//===== Passport 사용 =====//
var passport = require('passport');
var flash = require('connect-flash');

var cors = require('cors');

// 익스프레스 객체 생성
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');

app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb', extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));


app.use(passport.initialize());
app.use(passport.session());
//app.use(passport.authenticate('passport-one-session-per-user'));
app.use(flash());

app.use(cors());


var router = express.Router();
app.use('/', router);

var configPassport = require('./config/passport');
configPassport(app, passport);

var userRouter = require('./routes/route_user');
userRouter(router, passport);

var forgotRouter = require('./routes/route_forgot');
forgotRouter(router);

var chatRouter = require('./routes/route_chat');
chatRouter(router);

var adminRouter = require('./routes/route_admin');
adminRouter(router);

var tempRouter = require('./routes/route_temp');
tempRouter(router);

module.exports = app;