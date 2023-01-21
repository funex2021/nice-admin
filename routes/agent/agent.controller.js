const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const Query = require('./agent.sqlmap'); // 여기
var isNullOrEmpty = require('is-null-or-empty');
const CONSTS = require(path.join(process.cwd(), '/routes/services/consts'))
const axios = require('axios');
const CommQuery = require(path.join(process.cwd(), "/routes/common.sqlmap.js"));
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
const encUtil = require(path.join(process.cwd(), '/routes/services/encUtil'));


exports.view = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchText , pageIndex, rowsPerPage, srtDt, endDt} = req.body;

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

    let search = {};
    search.srchOption = srchOption;
    search.srchText = srchText;
    search.rowsPerPage = parseInt(rowsPerPage);
    search.srtDt = srtDt;
    search.endDt = endDt;

    mydb.executeTx(async conn => {
        try {

            let totalPageCount = await Query.QGetAgentListCnt(obj, conn);
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            let agentList = await Query.QGetAgentList(obj, conn);

            let basicInfo = {}
            basicInfo.title = 'agent';
            basicInfo.menu = 'MENU00000000000007';
            basicInfo.rtnUrl = 'agent/index';
            basicInfo.agentList = agentList;
            basicInfo.search = search;
            basicInfo.pagination = pagination;
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("agent view", e)
            next(e);
        }
    });
}

exports.withdraw = async (req, res, next) => {
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

            let totalPageCount = await Query.QGetAgentWithdrawListCnt(obj, conn);

            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)

            let withdrawList = await Query.QGetAgentWithdrawList(obj, conn);

            let agentList = await Query.QGetAgentSelectList(obj, conn);

            let basicInfo = {}
            basicInfo.title = 'agent';
            basicInfo.menu = 'MENU00000000000008';
            basicInfo.rtnUrl = 'agent/withdraw';
            basicInfo.withdrawList = withdrawList;
            basicInfo.agentList = agentList;
            basicInfo.search = search;
            basicInfo.pagination = pagination;
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("agentWithdraw view", e)
            next(e);
        }
    });
}

exports.updateWithdrawStatus = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let { seq, status } = req.body;

    let obj = {};
    obj.seq = seq;
    obj.status = status;

    mydb.executeTx(async (conn) => {
        try {
            await Query.QUptWithdrawStatus(obj, conn);

            conn.commit();

            res.json(rtnUtil.successTrue("200", "처리되었습니다."));
        } catch (e) {
            conn.rollback();
            logUtil.errObj("updateWithdrawStatus Error", e);
            next(e);
        }
    });
};


exports.agentProc = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let { seq,  agent_id , agent_pw , bank_nm , acc_nm , bank_acc  } = req.body;
    let obj = {};
    obj.seq = seq;
    obj.agent_id = agent_id;
    obj.agent_pw = agent_pw;
    obj.bank_nm = bank_nm;
    obj.acc_nm = acc_nm;
    obj.bank_acc = bank_acc;
    obj.admin_grade = 'CMDT00000000000002';

    if(isNullOrEmpty(obj.agent_pw)){
        let passInfo = await encUtil.createPasswordHash(obj.agent_pw);
        obj.agent_pw = passInfo.password;
        obj.agent_salt = passInfo.salt;
    }

    mydb.executeTx(async (conn) => {
        try {
            if(isNullOrEmpty(seq)){
                await Query.QInsAgent(obj, conn);
            }else{
                await Query.QUptAgent(obj, conn);
            }
            conn.commit();

            res.json(rtnUtil.successTrue("200", "처리되었습니다."));
        } catch (e) {
            conn.rollback();
            logUtil.errObj("agentProc Error", e);
            next(e);
        }
    });
};


exports.agentInfo = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let { seq } = req.body;

    let obj = {};
    obj.adminSeq = seq;
    obj.admin_grade = 'CMDT00000000000002';

    mydb.executeTx(async (conn) => {
        try {
            let agentInfo = await Query.QGetAgentInfo(obj , conn);

            res.json(rtnUtil.successTrue("200", "처리되었습니다." , agentInfo[0]));
        } catch (e) {
            conn.rollback();
            logUtil.errObj("agentProc Error", e);
            next(e);
        }
    });
};

