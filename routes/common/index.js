const router = require('express').Router()
const cmm = require('./cmm.controller')
const path = require('path');
const admUtil = require(path.join(process.cwd(),'/routes/config/common/admUtil'))
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(301).redirect('/login');
  }
};

router.get('/view', admUtil.getSellerAmt,  cmm.VCommCodeMst)
router.post('/view', admUtil.getSellerAmt,  cmm.VCommCodeMst)

router.post('/viewDtl',  cmm.VCommCodeDtl)

router.post('/setCommCodeMst',  cmm.setCommCodeMst)
router.post('/setCommCodeDtl',  cmm.setCommCodeDtl)


module.exports = router