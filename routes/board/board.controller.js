const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const Query = require('./board.sqlmap'); // 여기
var isNullOrEmpty = require('is-null-or-empty');
const CONSTS = require(path.join(process.cwd(), '/routes/services/consts'))
const axios = require('axios');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

exports.view = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            let obj = {};
            obj.cmpnyCd = req.user.cmpnyCd;
            obj.cs_coin_sell = req.user.cs_coin_sell;
            obj.cs_coin_trans = req.user.cs_coin_trans;

            // obj.srtDt = moment().add(7,'hours').format("YYYY-MM-DD")
            obj.srtDt = moment().format("YYYY-MM-DD")
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";

            let memberCount = await Query.QGetMemberCount(obj, conn);
            let monthmMemberCount = await Query.QGetMonthMemberCount(obj, conn);
            let totSuccessCoinSell = await Query.QGetTotSuccessCoinSell(obj, conn);
            let totCancelCoinSell = await Query.QGetTotCancelCoinSell(obj, conn);
            let totCoinTrans = await Query.QGetTotCoinTrans(obj, conn);
            let totBalance = await Query.QGetTotBalance(obj, conn);

            let balance = 0;

            balance = 0;
            let basicInfo = {}
            basicInfo.title = 'Admin 관리';
            basicInfo.menu = 'MENU00000000000001';
            basicInfo.rtnUrl = 'board/index';
            basicInfo.memberCount = memberCount;
            basicInfo.monthmMemberCount = monthmMemberCount;
            basicInfo.totSuccessCoinSell = totSuccessCoinSell;
            basicInfo.totCancelCoinSell = totCancelCoinSell;
            basicInfo.totCoinTrans = totCoinTrans;
            basicInfo.totBalance = totBalance;
            basicInfo.balance = balance;
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("board member count view", e)
            next(e);
        }
    });
}

exports.notice = async (req, res, next) => {
    let {pageIndex, rowsPerPage, srtDt, endDt} = req.body;

    if (srtDt == undefined || srtDt == '' || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        // srtDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        endDt = moment().format('YYYY-MM-DD');
        srtDt = moment().format('YYYY-MM-DD');
    }

    if (pageIndex == '' || pageIndex == null) {
        pageIndex = 1;
    }
    if (rowsPerPage == '' || rowsPerPage == null) {
        rowsPerPage = 10;
    }

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.endDt = endDt;
    obj.srtDt = srtDt;

    let search = {};
    search.endDt = endDt;
    search.srtDt = srtDt;

    mydb.executeTx(async conn => {
        try {
            let totalPageCount = await Query.QGetSubNoticeListCnt(obj, conn);

            let pagination = await pagingUtil.getDynamicPagination(
                pageIndex,
                totalPageCount,
                rowsPerPage
            );

            obj.pageIndex = parseInt(pageIndex);
            obj.rowsPerPage = parseInt(rowsPerPage);

            let noticeList = await Query.QGetSubNoticeList(obj, conn);

            let basicInfo = {}
            basicInfo.title = 'Admin 관리';
            basicInfo.menu = 'MENU00000000000009';
            basicInfo.rtnUrl = 'board/notice';
            basicInfo.search = search;
            basicInfo.pagination = pagination;
            basicInfo.noticeList = noticeList;
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("board notice view", e)
            next(e);
        }
    });
}

exports.noticeDetail = async (req, res, next) => {
    let {seq} = req.body;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let obj = {};
    obj.seq = seq;

    mydb.executeTx(async conn => {
        try {
            let detail = {};
            if (seq) {
                detail = await Query.QGetSubNoticeDetail(obj, conn);
            }

            let basicInfo = {}
            basicInfo.title = 'Admin 관리';
            basicInfo.menu = 'MENU00000000000009';
            basicInfo.rtnUrl = 'board/noticeDetail';
            basicInfo.detail = detail;
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("board notice view", e)
            next(e);
        }
    });
}

exports.insertNotice = async (req, res, next) => {
    let {title, content, use_yn} = req.body;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.title = title;
    obj.content = content;
    obj.use_yn = use_yn;

    mydb.executeTx(async conn => {
        try {

            await Query.QInsSubNotice(obj, conn);

            conn.commit();

            res.json(rtnUtil.successTrue("200", ""))
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse("500", e))
        }
    });
}

exports.updateNotice = async (req, res, next) => {
    let {seq, title, content, use_yn} = req.body;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let obj = {};
    obj.seq = seq;
    obj.title = title;
    obj.content = content;
    obj.use_yn = use_yn;

    mydb.executeTx(async conn => {
        try {

            await Query.QUptSubNotice(obj, conn);

            conn.commit();

            res.json(rtnUtil.successTrue("200", ""))
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse("500", e))
        }
    });
}