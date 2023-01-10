const path = require('path');
const router = require('express').Router()

const coin = require('./coin.controller')
const admUtil = require(path.join(process.cwd(), '/routes/config/common/admUtil'))

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};

router.post('/view', isAuthenticated, admUtil.getSellerAmt, coin.view);
router.get('/view', isAuthenticated, admUtil.getSellerAmt, coin.view);

router.post('/summary', isAuthenticated, coin.summary);
router.post('/tblView', isAuthenticated, coin.tblView);

router.post('/buycng', admUtil.verifyTime, coin.buyCngStatus);
router.post('/alram', coin.alram);
router.post('/coinReturnSend', isAuthenticated, coin.coinReturnSend);

router.post('/wview', isAuthenticated, admUtil.getSellerAmt, coin.walletView);

router.post('/excelList', isAuthenticated, coin.excelView)

router.post('/walletExcelList', isAuthenticated, coin.walletExcelView)

router.post('/wviewOld', isAuthenticated, admUtil.getSellerAmt, coin.walletViewOld);
router.post('/walletExcelListOld', isAuthenticated, coin.walletExcelViewOld);
router.post('/nftBuyList', isAuthenticated, coin.nftBuyList);
module.exports = router
