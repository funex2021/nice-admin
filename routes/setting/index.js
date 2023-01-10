const router = require('express').Router()
const st = require('./setting.controller')
const path = require('path');
const admUtil = require(path.join(process.cwd(),'/routes/config/common/admUtil'))
const {is} = require("password-validator/src/lib");
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(301).redirect('/login');
  }
};

// 메인 admin 
router.post('/m/view', admUtil.getSellerAmt, isAuthenticated, st.mview);
router.get('/m/view', admUtil.getSellerAmt, isAuthenticated, st.mview);
router.post('/m/ins', isAuthenticated, st.mins);

router.post('/m/initPwd', isAuthenticated, st.initPwd);
router.post('/m/approve', isAuthenticated, st.approve);

router.post('/m/:type/refresh', isAuthenticated,  st.refresh);
router.post('/m/uptCompnyInfo', isAuthenticated, st.uptCompnyInfo);

// sub admin 관리
router.post('/a/view', isAuthenticated,  st.aview);
router.post('/a/ins', isAuthenticated,  st.ains);
router.post('/a/del', isAuthenticated,  st.adel);

router.post('/a/menu_view', isAuthenticated,  st.menu_view);
router.post('/a/menu_set', isAuthenticated,  st.menu_set);

//시스템 관리 
router.post('/a/sc', isAuthenticated,  st.systemConfigView);
router.get('/a/sc', isAuthenticated,  st.systemConfigView);
router.post('/a/scu', isAuthenticated,  st.systemConfigUpt);

router.post('/a/pu', isAuthenticated,  st.payConfigUpt);
router.post('/updateRate', isAuthenticated, st.updateRate);
router.post('/updateSignUpView', isAuthenticated, st.updateSignUpView);

module.exports = router