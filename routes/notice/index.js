const router = require('express').Router()
const notice = require('./notice.controller')
const path = require('path');
const admUtil = require(path.join(process.cwd(),'/routes/config/common/admUtil'))
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(301).redirect('/login');
  }
};

router.get('/view',  isAuthenticated, admUtil.getSellerAmt, notice.view)
router.post('/view',  isAuthenticated, admUtil.getSellerAmt, notice.view)

module.exports = router