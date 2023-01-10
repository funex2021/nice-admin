const path = require('path');
const router = require('express').Router()

var passport = require('passport');
const mem = require('./mem.controller')
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const admUtil = require(path.join(process.cwd(), '/routes/config/common/admUtil'))

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};

router.post("/signin", (req, res, next) => {
    console.log("=======signin=========")
    passport.authenticate("local-Signin", (authError, user, info) => {

        if (authError) {
            // 에러면 에러 핸들러로 보냅니다
            console.log(authError);
            return next(authError);
        }

        try {
            // 유저 정보가 없다는 것을 로그인 실패를 의미합니다
            //flash메시지가 일회용이기 때문이다.
            let alertMessage = {}
            alertMessage.success = false;
            alertMessage.message = info.message;

            req.flash("alertMessage", alertMessage);
            return res.redirect("/login");
        } catch (e) {
            // pass
        }


        return req.login(user, loginError => {
            if (loginError) {
                req.flash("alertMessage", info.message);
                return res.redirect("/login");
            }

            return res.redirect(307, "/c/view");
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

router.post('/view', isAuthenticated, admUtil.getSellerAmt, mem.mview);
router.get('/view', isAuthenticated, admUtil.getSellerAmt, mem.mview);

router.post('/ins', isAuthenticated, mem.mins);
router.post('/coin', isAuthenticated, mem.coinInfo);
router.post('/changePassword', isAuthenticated, mem.changePassword);
router.post('/changeAdminPassword', isAuthenticated, mem.changeAdminPassword);

router.post('/balance', isAuthenticated, mem.balance);
router.post('/changeBalance', isAuthenticated, admUtil.verifyTime, mem.changeBalance);

router.post('/history', isAuthenticated, mem.history);

router.post('/excelList', isAuthenticated, mem.excelView);

router.post('/mCngStatus', isAuthenticated, mem.mCngStatus);

router.post('/mViewAdminIns', isAuthenticated, mem.viewAdminIns);

router.post('/getIpList', isAuthenticated, mem.getIpList);
router.post('/deleteIp', isAuthenticated, mem.deleteIp);
router.post('/insertIp', isAuthenticated, mem.insertIp);

router.post('/logView', isAuthenticated, admUtil.getSellerAmt, mem.logView);
router.get('/logView', isAuthenticated, admUtil.getSellerAmt, mem.logView);

router.post('/userLogExcel', isAuthenticated, mem.userLogExcel);

router.post('/getUserIpList', isAuthenticated, mem.getUserIpList);
router.post('/deleteUserIp', isAuthenticated, mem.deleteUserIp);
router.post('/insertUserIp', isAuthenticated, mem.insertUserIp);

router.post('/getUserAccList', isAuthenticated, mem.getUserAccList);
router.post('/setAccBlock', isAuthenticated, mem.setAccBlock);

router.post('/getSellerList', isAuthenticated, mem.getSellerList);
router.post('/getSellerBalance', isAuthenticated, mem.getSellerBalance);
router.post('/sellerCoinSend', isAuthenticated, mem.sellerCoinSend);

router.post('/nftBankCancel', isAuthenticated, mem.nftBankCancel);

module.exports = router;