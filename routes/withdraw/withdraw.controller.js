const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const Query = require('./withdraw.sqlmap'); // 여기
var isNullOrEmpty = require('is-null-or-empty');
const CONSTS = require(path.join(process.cwd(), '/routes/services/consts'))
const axios = require('axios');
const CommQuery = require(path.join(process.cwd(), "/routes/common.sqlmap.js"));
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

exports.view = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, pageIndex, rowsPerPage, srtDt, endDt} = req.body;

    if (pageIndex == "" || pageIndex == null) {
        pageIndex = 1;
    }
    if (rowsPerPage == "" || rowsPerPage == null) {
        rowsPerPage = 10;
    }

    if (srtDt == undefined || srtDt == "" || srtDt == null) {
        endDt = moment().format("YYYY-MM-DD")
        srtDt = moment().format("YYYY-MM-DD")
    }

    let obj = {};
    obj.srchOption = srchOption;
    obj.pageIndex = parseInt(pageIndex);
    obj.rowsPerPage = parseInt(rowsPerPage);
    obj.adminGrade = req.user.adminGrade;
    obj.adminId = req.user.adminId;
    obj.adminSeq = req.user.adminSeq;
    obj.srtDt = srtDt;
    obj.endDt = endDt;

    let search = {};
    search.srchOption = srchOption;
    search.rowsPerPage = parseInt(rowsPerPage);
    search.srtDt = srtDt;
    search.endDt = endDt;

    mydb.executeTx(async conn => {
        try {

            let totalPageCount = await Query.QGetWithdrawListCnt(obj, conn);
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            let withdrawList = await Query.QGetWithdrawList(obj, conn);

            let status = {};
            status.mstCode = "CMMT00000000000025";
            let statusList = await CommQuery.QGetDtlCodeList(status, conn);

            let basicInfo = {}
            basicInfo.title = 'withdraw';
            basicInfo.menu = 'MENU00000000000006';
            basicInfo.rtnUrl = 'withdraw/index';
            basicInfo.withdrawList = withdrawList;
            basicInfo.statusList = statusList;
            basicInfo.search = search;
            basicInfo.pagination = pagination;
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("withdraw view", e)
            next(e);
        }
    });
}


exports.withdrawProc = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let { price } = req.body;

    mydb.executeTx(async (conn) => {
        try {

            let obj = {};
            obj.srchOption = 'CMMT00000000000091';
            obj.adminSeq = req.user.adminSeq;

            console.log(obj.srchOption)

            let cnt = await Query.QGetWithdrawListCnt(obj, conn);

            if(cnt > 0){
                return res.json(rtnUtil.successFalse("500", "이미 출금요청건이 있습니다."));
            }

            let ins = {};
            ins.adminSeq = req.user.adminSeq;
            ins.price = price;

            await Query.QSetWithdraw(ins , conn);

            conn.commit();
            res.json(rtnUtil.successTrue("200","출금신청이 완료되었습니다." ));
        } catch (e) {
            console.log(e);
            res.json(rtnUtil.successFalse("500", "출금신청이 실패하였습니다."));
        }
    });
};

