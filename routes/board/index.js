const router = require('express').Router()
const board = require('./board.controller')
const path = require('path');
const admUtil = require(path.join(process.cwd(),'/routes/config/common/admUtil'))
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(301).redirect('/login');
  }
};

router.get('/view',  isAuthenticated, admUtil.getSellerAmt, board.view)
router.post('/view',  isAuthenticated, admUtil.getSellerAmt, board.view)
router.get('/notice', isAuthenticated, board.notice);
router.post('/notice', isAuthenticated, board.notice);
router.get('/noticeDetail', isAuthenticated, board.noticeDetail);
router.post('/noticeDetail', isAuthenticated, board.noticeDetail);
router.post('/insertNotice', isAuthenticated, board.insertNotice);
router.post('/updateNotice', isAuthenticated, board.updateNotice);

module.exports = router