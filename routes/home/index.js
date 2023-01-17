const router = require('express').Router()
const path = require('path');
var passport = require('passport');
const home = require('./home.controller')
const admUtil = require(path.join(process.cwd(),'/routes/config/common/admUtil'))
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(301).redirect('/login');
    }
};

router.post("/signin", (req, res, next) => {
    console.log("=======signin=========")
    passport.authenticate("local-Signin", (authError, user, info) => {
        if (authError) {
            // 에러면 에러 핸들러로 보냅니다
            console.log('authError:',authError);
            return next(authError);
        }

        try {
            // 유저 정보가 없다는 것을 로그인 실패를 의미합니다
            //flash메시지가 일회용이기 때문이다.
            let alertMessage = {}
            alertMessage.success = false;
            alertMessage.message = info.message;
            console.log('asdasd:',alertMessage)

            req.flash("alertMessage", alertMessage);
            return res.redirect("/login");
        } catch (e) {
            // pass
        }

        return req.login(user, loginError => {
            if (loginError) {
                console.log('loginError::', loginError)
                req.flash("alertMessage", info.message);
                return res.redirect("/login");
            }

            return res.redirect(307, "/d/view");
        });
    })(req, res, next);
});

router.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

router.post('/totalMember', isAuthenticated, home.totalMember);
router.post('/totalCompany', isAuthenticated, home.totalCompany);
router.post('/totalSell', isAuthenticated, home.totalSell);

module.exports = router;