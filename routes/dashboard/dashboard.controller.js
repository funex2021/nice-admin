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

    let obj = {};
    obj.adminGrade = req.user.adminGrade;
    obj.adminSeq = req.user.adminSeq;

    mydb.executeTx(async conn => {
        try {

            //총수익금
            let totalRevenue = await Query.QGetTotalRevenue(obj, conn);
            //총수익금(이번주)
            let totalRevenueThisWeek = await Query.QGetTotalRevenueThisWeek(obj, conn);
            //총수익금(저번주)
            let totalRevenueLastWeek = await Query.QGetTotalRevenueLsatWeek(obj, conn);
            let revenuePercent = 0;
            if (totalRevenueLastWeek != '0') {
                revenuePercent = ((totalRevenueThisWeek - totalRevenueLastWeek) / totalRevenueLastWeek) * 100;
            }

            //총유저
            let totalMember = await Query.QGetTotalMember(obj, conn);
            //총유저(이번주)
            let totalMemberThisWeek = await Query.QGetTotalMemberThisWeek(obj, conn);
            //총유저(저번주)
            let totalMemberLastWeek = await Query.QGetTotalMemberLastWeek(obj, conn);
            let memberPercent = 0;
            if (totalMemberLastWeek != '0') {
                memberPercent = ((totalMemberThisWeek - totalMemberLastWeek) / totalMemberLastWeek) * 100;
            }

            //회원사
            let totalCompany = await Query.QGetTotalCompany(obj, conn);
            //회원사(이번주)
            let totalCompanyThisWeek = await Query.QGetTotalCompanyThisWeek(obj, conn);
            //회원사(저번주)
            let totalCompanyLastWeek = await Query.QGetTotalCompanyLastWeek(obj, conn);
            let companyPercent = 0;
            if (totalCompanyLastWeek != '0') {
                companyPercent = ((totalCompanyThisWeek - totalCompanyLastWeek) / totalCompanyLastWeek) * 100;
            }

            //매출 상위 top5
            let topCompany5 = await Query.QGetTopCompany5(obj, conn);

            //총판매건수
            let totalSellCntList = await Query.QGetTotalSellCntList(obj, conn);

            //월별종합현황
            let monthlyTotal = await Query.QGetMontylyTotal(obj, conn);
            let montylyTotalChart = await Query.QGetMontylyTotalChart(obj, conn);
            console.log(montylyTotalChart)

            let basicInfo = {}
            basicInfo.title = 'dashboard';
            basicInfo.menu = 'MENU00000000000001';
            basicInfo.rtnUrl = 'dashboard/index';
            basicInfo.totalRevenue = totalRevenue;
            basicInfo.revenuePercent = revenuePercent;
            basicInfo.totalMember = totalMember;
            basicInfo.memberPercent = memberPercent;
            basicInfo.totalCompany = totalCompany;
            basicInfo.companyPercent = companyPercent;
            basicInfo.topCompany5 = topCompany5;
            basicInfo.totalSellCntList = totalSellCntList;
            basicInfo.monthlyTotal = monthlyTotal;
            basicInfo.montylyTotalChart = montylyTotalChart;
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("Dashboard view", e)
            next(e);
        }
    });
}