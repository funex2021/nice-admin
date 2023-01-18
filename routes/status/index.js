const router = require('express').Router()
const path = require('path');
var passport = require('passport');
const status = require('./status.controller')
const admUtil = require(path.join(process.cwd(),'/routes/config/common/admUtil'))
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(301).redirect('/login');
    }
};

router.get('/view', isAuthenticated, status.view);
router.post('/view', isAuthenticated, status.view);

module.exports = router;