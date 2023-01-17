const router = require('express').Router()
const path = require('path');
var passport = require('passport');
const trade = require('./trade.controller')
const admUtil = require(path.join(process.cwd(),'/routes/config/common/admUtil'))
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(301).redirect('/login');
    }
};

router.get('/view', isAuthenticated, trade.view);
router.post('/view', isAuthenticated, trade.view);

module.exports = router;