const router = require('express').Router()
const path = require('path');
var passport = require('passport');
const company = require('./company.controller')
const admUtil = require(path.join(process.cwd(),'/routes/config/common/admUtil'))
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(301).redirect('/login');
    }
};

router.get('/view', isAuthenticated, company.view);
router.post('/view', isAuthenticated, company.view);
router.post('/companyProc' , isAuthenticated , company.companyProc);
module.exports = router;