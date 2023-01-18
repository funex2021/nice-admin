const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const Query = require('./status.sqlmap'); // 여기
var isNullOrEmpty = require('is-null-or-empty');
const CONSTS = require(path.join(process.cwd(), '/routes/services/consts'))
const axios = require('axios');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

exports.view = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchText, pageIndex, rowsPerPage, srtDt, endDt} = req.body;

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
    obj.srchText = srchText;
    obj.pageIndex = parseInt(pageIndex);
    obj.rowsPerPage = parseInt(rowsPerPage);
    obj.adminGrade = req.user.adminGrade;
    obj.adminId = req.user.adminId;
    obj.adminSeq = req.user.adminSeq;
    obj.srtDt = srtDt;
    obj.endDt = endDt;

    let search = {};
    search.srchOption = srchOption;
    search.srchText = srchText;
    search.rowsPerPage = parseInt(rowsPerPage);
    search.srtDt = srtDt;
    search.endDt = endDt;

    mydb.executeTx(async conn => {
        try {

            let totalPageCount = await Query.QGetSellListCnt(obj, conn);

            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)

            let sellList = await Query.QGetSellList(obj, conn);

            let companyListTotal = await Query.QGetCompanyListTotal(obj, conn);

            let basicInfo = {}
            basicInfo.title = 'status';
            basicInfo.menu = 'MENU00000000000002';
            basicInfo.rtnUrl = 'status/index';
            basicInfo.sellList = sellList;
            basicInfo.companyListTotal = companyListTotal;
            basicInfo.search = search;
            basicInfo.pagination = pagination;
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("trade view", e)
            next(e);
        }
    });
}