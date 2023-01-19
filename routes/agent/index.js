const router = require('express').Router()
const path = require('path');
var passport = require('passport');
const agent = require('./agent.controller')
const admUtil = require(path.join(process.cwd(),'/routes/config/common/admUtil'))
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(301).redirect('/login');
    }
};

router.get('/view', isAuthenticated, agent.view);
router.post('/view', isAuthenticated, agent.view);

router.get('/withdraw', isAuthenticated, agent.withdraw);
router.post('/withdraw', isAuthenticated, agent.withdraw);
router.post('/updateWithdrawStatus', isAuthenticated, agent.updateWithdrawStatus);

module.exports = router;