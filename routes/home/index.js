const router = require('express').Router()
const board = require('./home.controller')
const path = require('path');
const admUtil = require(path.join(process.cwd(),'/routes/config/common/admUtil'))
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(301).redirect('/login');
    }
};

module.exports = router;