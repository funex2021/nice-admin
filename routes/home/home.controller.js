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
    obj.adminGrade = req.user.adminGrade;
    obj.adminSeq = req.user.adminSeq;

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
    obj.adminGrade = req.user.adminGrade;
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
    obj.adminGrade = req.user.adminGrade;
    obj.adminSeq = req.user.adminSeq;

    mydb.executeTx(async conn => {
        try {
            //이번달입금건수
            let totalSellCnt = await Query.QGetSellTotalCnt(obj, conn);
            //이번달입금금액
            let totalSell = await Query.QGetSellTotal(obj, conn);
            //어제입금건수
            let yesterdayTotalSellCnt = await Query.QGetYesterdaySellTotalCnt(obj, conn);
            //어제입금금액
            let yesterdayTotalSell = await Query.QGetYesterdaySellTotal(obj, conn);
            //이번달총수익
            let totalRevenue = await Query.QGetRevenueTotalCnt(obj, conn);
            //어제총수익
            let yesterdayTotalRevenue = await Query.QGetYesterdayRevenueTotalCnt(obj, conn);

            let rtnObj = {};
            rtnObj.totalSellCnt = totalSellCnt;
            rtnObj.totalSell = totalSell;
            rtnObj.yesterdayTotalSellCnt = yesterdayTotalSellCnt;
            rtnObj.yesterdayTotalSell = yesterdayTotalSell;
            rtnObj.totalRevenue = totalRevenue;
            rtnObj.yesterdayTotalRevenue = yesterdayTotalRevenue;

            conn.commit();
            res.json(rtnUtil.successTrue("200", "", rtnObj))
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse("500", e))
        }
    });
}

exports.withdrawPrice = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {} = req.body;

    let obj = {};
    obj.adminGrade = req.user.adminGrade;
    obj.adminSeq = req.user.adminSeq;

    mydb.executeTx(async conn => {
        try {
            //인출가능금액
            let totalSell = await Query.QGetWithdrawPrice(obj, conn);

            res.json(rtnUtil.successTrue("200", "", totalSell))
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse("500", e))
        }
    });
}