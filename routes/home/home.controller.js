const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const Query = require('./home.sqlmap'); // 여기
var isNullOrEmpty = require('is-null-or-empty');
const CONSTS = require(path.join(process.cwd(), '/routes/services/consts'))
const axios = require('axios');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

exports.totalMember = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {} = req.body;

    let obj = {};

    mydb.executeTx(async conn => {
        try {
            let totalMemberCnt = await Query.QGetMemberTotalCnt(obj, conn);

            conn.commit();
            res.json(rtnUtil.successTrue("200", "", totalMemberCnt))
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse("500", e))
        }
    });
}

exports.totalCompany = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {} = req.body;

    let obj = {};
    obj.adminId = req.user.adminId;
    obj.adminSeq = req.user.adminSeq;

    mydb.executeTx(async conn => {
        try {
            let totalCompanyCnt = await Query.QGetCompanyTotalCnt(obj, conn);

            conn.commit();
            res.json(rtnUtil.successTrue("200", "", totalCompanyCnt))
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse("500", e))
        }
    });
}

exports.totalSell = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {} = req.body;

    let obj = {};
    obj.adminId = req.user.adminId;
    obj.adminSeq = req.user.adminSeq;

    mydb.executeTx(async conn => {
        try {
            //이번달입금건수
            let totalSellCnt = await Query.QGetSellTotalCnt(obj, conn);
            //이번달입금금액
            let totalSell = await Query.QGetSellTotal(obj, conn);

            let rtnObj = {};
            rtnObj.totalSellCnt = totalSellCnt;
            rtnObj.totalSell = totalSell;

            conn.commit();
            res.json(rtnUtil.successTrue("200", "", rtnObj))
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse("500", e))
        }
    });
}