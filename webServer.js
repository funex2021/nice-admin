var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
/*
* DB config
*/
const Pool = require('./routes/config/pool');
const pool = new Pool();
//global.__lib = __dirname + '/lib/';

const path = require('path');
const admUtil = require(path.join(process.cwd(), '/routes/config/common/admUtil'))

/*
* properties
*/
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('adm.properties');
const port = properties.get('com.server.port');

/*
* view html config
*/
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '5mb', extended: false, parameterLimit: 10000}));


//flash 미들웨어는 req 객체에 req.flash 메서드를 추가한다.
//req.flash(키,값)으로 해당키에 값을 설정하고,
//req.flsh(키)로 해당 키에 대한 값을 불러온다.
var flash = require('connect-flash');

//secret – 쿠키를 임의로 변조하는것을 방지하기 위한 sign 값 입니다. 원하는 값을 넣으면 됩니다.
//resave – 세션을 언제나 저장할 지 (변경되지 않아도) 정하는 값입니다. express-session documentation에서는 이 값을 false 로 하는것을 권장하고 필요에 따라 true로 설정합니다.
//saveUninitialized – uninitialized 세션이란 새로 생겼지만 변경되지 않은 세션을 의미합니다. Documentation에서 이 값을 true로 설정하는것을 권장합니다.
var expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 hour
app.use(session({
    cooke: {
        // maxAge: 30 * 24 * 60 * 60 * 1000,
        expires: expiryDate,
        httpOnly: true
    },
    resave: false,
    saveUninitialized: false,
    secret: 'cube!*Session'
})); // 세션 활성화

/*
* passport config
*/
var passport = require('passport') //passport module add
const passportConfig = require('./routes/passport'); // 여기

// flash는 세션을 필요로합니다. session 아래에 선언해주셔야합니다.
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


require('dotenv').config();

app.set('pool', pool);
passportConfig(pool);

app.use(function (req, res, next) {

    if (req.user) {
        res.locals.user = req.user;
    }
    next();
});

// ======= FRONT =========
app.get('/login', function (req, res, next) {
    let domain = req.headers.host;
    let basicInfo = {}
    basicInfo.title = 'Login';
    basicInfo.menu = 'MENU00000000000000';
    basicInfo.rtnUrl = 'login';
    let companyName = "";
    if (domain.includes('localhost')) {
        companyName = 'fun';
    } else if (domain.includes('.')) {
        companyName = domain.split('.')[0];
    } else if (domain.includes('wallet.object.mobi')) {
        companyName = "bbc"
    }
    basicInfo.ucompanyName = companyName.toUpperCase();
    basicInfo.companyName = companyName;

    req.basicInfo = basicInfo;
    next();
});

app.get('/', function (req, res) {
    res.redirect('/login');
});

app.get('/advance', function (req, res) {
    res.render("form-advanced")
});

app.locals.moment = require('moment');

app.use('/h', require('./routes/home'))
app.use('/d', require('./routes/dashboard'))


app.use(function (req, res, next) {
    let domain = req.headers.host;
    console.log('damain::', domain)
    let companyName = "";
    if (domain.includes('localhost')) {
        companyName = 'fun';
    } else if (domain.includes('.')) {
        companyName = domain.split('.')[0];
    } else if (domain.includes('wallet.object.mobi')) {
        companyName = "bbc"
    }
    ucompanyName = companyName.toUpperCase();

    console.log('req.url : ' + req.url.toLowerCase());
    let basicInfo = req.basicInfo;
    let alertMessage = {}
    alertMessage.success = "";
    alertMessage.message = "";
    try {
        if (basicInfo != undefined) {
            let rtnUrl = basicInfo.rtnUrl;
            let flashMessage = req.flash('alertMessage');

            console.log('req.user : ' + req.user)

            if (flashMessage.length > 0) {
                console.log('flashMessage : ' + flashMessage[0].success);
                console.log('flashMessage : ' + flashMessage[0].message);
                alertMessage.success = flashMessage[0].success;
                alertMessage.message = flashMessage[0].message;
            }

            res.render(rtnUrl, {
                'basicInfo': basicInfo,
                'alertMessage': alertMessage,
                'ucompany': ucompanyName,
                'company': companyName
            });
        } else {
            next();
        }
    } catch (e) {
        if (e instanceof SyntaxError) {
            console.log("SyntaxError")
            next(e);
        } else if (e instanceof TypeError) {
            console.log("TypeError")
            next(e);
        } else {
            res.render(rtnUrl, {
                'basicInfo': basicInfo,
                'alertMessage': alertMessage,
                'ucompany': ucompanyName,
                'company': companyName
            });
        }

    }
    // }

    //console.log("404")
    //var err = new Error('Not Found');
    //err.status = 404;
    //res.status(404).render('qna', {title: "Sorry, page not found"});
    //res.redirect('/login');
    //next(err);
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    let domain = req.headers.host;
    let companyName = "";
    if (domain.includes('localhost')) {
        companyName = 'fun';
    } else if (domain.includes('.')) {
        companyName = domain.split('.')[0];
    } else if (domain.includes('wallet.object.mobi')) {
        companyName = "bbc"
    }
    ucompanyName = companyName.toUpperCase();
    companyName = companyName;
    res.status(500).render('error/500error', {'ucompany': ucompanyName, 'company': companyName});
});

var server = app.listen(port, function () {
    console.log("Express server has started on port " + port)
});


// new version!!
