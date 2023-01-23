const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const Query = require('./company.sqlmap'); // 여기
var isNullOrEmpty = require('is-null-or-empty');
const CONSTS = require(path.join(process.cwd(), '/routes/services/consts'))
const axios = require('axios');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
const agentQuery = require(path.join(process.cwd(), "/routes/agent/agent.sqlmap.js"));

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

    let search = {};
    search.srchOption = srchOption;
    search.srchText = srchText;
    search.rowsPerPage = parseInt(rowsPerPage);

    mydb.executeTx(async conn => {
        try {

            let totalPageCount = await Query.QGetCompanyListCnt(obj, conn);

            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)

            let companyList = await Query.QGetCompanyList(obj, conn);

            let companyListTotal = await Query.QGetCompanyListTotal(obj, conn);

            let agentList = await agentQuery.QGetAgentSelectList(obj,conn);

            let basicInfo = {}
            basicInfo.title = 'company';
            basicInfo.menu = 'MENU00000000000003';
            basicInfo.rtnUrl = 'company/index';
            basicInfo.companyList = companyList;
            basicInfo.companyListTotal = companyListTotal;
            basicInfo.agentList = agentList;
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


exports.companyProc = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let { seq , company_commission , agent_seq , agent_commission  } = req.body;

    let obj = {};
    obj.seq                 = seq;
    obj.company_commission  = company_commission;
    obj.agent_seq           = agent_seq;
    obj.agent_commission    = agent_commission;


    if(req.user.adminGrade != 'CMDT00000000000001'){
        return res.json(rtnUtil.successFalse("500", "권한이 없습니다.관리자에게 문의해주세요"));
    }
    mydb.executeTx(async (conn) => {
        try {
            let companyInfo = await Query.QGetCompanyInfo(obj , conn);
            if(companyInfo.length <= 0){
                return res.json(rtnUtil.successFalse("500", "해당업체는 등록하실수 없습니다. 관리자에게 문의해주세요"));
            }else if(!isNullOrEmpty(companyInfo[0].agent_seq)){
                return res.json(rtnUtil.successFalse("500", "이미 에이전트가 등록된 업체입니다. 관리자에게 문의해주세요"));
            }else{
                await Query.QUptCompany(obj, conn);
                conn.commit();

                return res.json(rtnUtil.successTrue("200", "처리되었습니다."));
            }
        } catch (e) {
            conn.rollback();
            logUtil.errObj("companyProc Error", e);
            next(e);
        }
    });
};


