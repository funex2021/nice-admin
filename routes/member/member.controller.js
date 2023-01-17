const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const Query = require('./member.sqlmap'); // 여기
var isNullOrEmpty = require('is-null-or-empty');
const CONSTS = require(path.join(process.cwd(), '/routes/services/consts'))
const axios = require('axios');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

exports.view = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchText, pageIndex, rowsPerPage} = req.body;

    if (pageIndex == "" || pageIndex == null) {
        pageIndex = 1;
    }
    if (rowsPerPage == "" || rowsPerPage == null) {
        rowsPerPage = 10;
    }

    let obj = {};
    obj.srchOption = srchOption;
    obj.srchText = srchText;
    obj.pageIndex = parseInt(pageIndex);
    obj.rowsPerPage = parseInt(rowsPerPage);
    obj.adminGrade = req.user.adminGrade;
    obj.adminId = req.user.adminId;
    obj.adminSeq = req.user.adminSeq;

    console.log(obj)

    let search = {};
    search.srchOption = srchOption;
    search.srchText = srchText;
    search.rowsPerPage = parseInt(rowsPerPage);

    mydb.executeTx(async conn => {
        try {

            let totalPageCount = await Query.QGetMemberListCnt(obj, conn);

            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)

            let memberList = await Query.QGetMemberList(obj, conn);

            let companyListTotal = await Query.QGetCompanyListTotal(obj, conn);

            let basicInfo = {}
            basicInfo.title = 'member';
            basicInfo.menu = 'MENU00000000000004';
            basicInfo.rtnUrl = 'member/index';
            basicInfo.memberList = memberList;
            basicInfo.companyListTotal = companyListTotal;
            basicInfo.search = search;
            basicInfo.pagination = pagination;
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("company view", e)
            next(e);
        }
    });
}