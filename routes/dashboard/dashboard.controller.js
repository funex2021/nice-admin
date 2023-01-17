const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const Query = require('./dashboard.sqlmap'); // 여기
var isNullOrEmpty = require('is-null-or-empty');
const CONSTS = require(path.join(process.cwd(), '/routes/services/consts'))
const axios = require('axios');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

exports.view = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            let obj = {};

            let basicInfo = {}
            basicInfo.title = 'dashboard';
            basicInfo.menu = 'MENU00000000000001';
            basicInfo.rtnUrl = 'dashboard/index';
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("Dashboard view", e)
            next(e);
        }
    });
}