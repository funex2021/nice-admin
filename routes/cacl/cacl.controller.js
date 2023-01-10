const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./cacl.sqlmap'); // 여기
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");


exports.view = async (req, res, next) => {

    let {srtDt, endDt, gubun} = req.body;

    let search = {};
    if (srtDt == "" || srtDt == null) {
        endDt = moment().add(-1, 'd').format("YYYY/MM/DD")
        srtDt = moment().add(-1, 'd').format("YYYY/MM/DD")
    }
    console.log(srtDt)
    search.srtDt = srtDt;
    search.endDt = endDt;

    if (gubun == "" || gubun == null) {
        gubun = 'S'
    }
    search.gubun = gubun;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    mydb.execute(async conn => {
        try {
            let cacl = null;
            //본사가 코인을 판매 한 경우
            if (gubun == 'S') {
                cacl = await fnSaleCacl(req, search);
            } else if (gubun == 'T') {
                //고객이 지사 업체에게 포인트 전환시에
                cacl = await fnTransCacl(req, search);
            } else if (gubun == 'I' || gubun == 'D') {
                //관리자가 증감 하는 경우
                cacl = await fnGetIncreseDecrese(req, search);
            } else if (gubun == 'B') {
                // 미전환 금액
                cacl = await fnRemainBalance(req, search);
            }

            let obj = {};
            obj.srtDt = search.srtDt;
            obj.endDt = search.endDt;
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";
            else obj.cmpnyCd = req.user.cmpnyCd;

            // obj.cs_coin_sell = req.user.cs_coin_sell;
            // obj.cs_coin_trans = req.user.cs_coin_trans;
            obj.cs_coin_sell = 'cs_coin_sell';
            obj.cs_coin_trans = 'cs_coin_trans';

            let totSale = await Query.QGetTotSaleCacl(obj, conn);
            let totTrans = await Query.QGetTotTransCacl(obj, conn);
            let totBalance = await Query.QGetTotHisBalance(obj, conn);
            //CMDT00000000000044 차감
            obj.changeCd = "CMDT00000000000044"
            decreaseBalance = await Query.QGetInDecreaseChangeTotBalance(obj, conn);
            //CMDT00000000000043 증감
            obj.changeCd = "CMDT00000000000043"
            increaseBalance = await Query.QGetInDecreaseChangeTotBalance(obj, conn);
            let basicInfo = {}
            basicInfo.title = '코인 구매/판매 정산';
            basicInfo.menu = 'MENU00000000000007';

            basicInfo.caclList = cacl.caclList;
            basicInfo.search = search;
            basicInfo.rtnUrl = 'cacl/index';
            basicInfo.pagination = cacl.pagination;
            basicInfo.tot_buy_num = totSale.tot_buy_num;
            basicInfo.tot_pay_num = totSale.tot_pay_num;
            basicInfo.tot_trans_num = totTrans.tot_trans_num;
            basicInfo.decreaseBalance = decreaseBalance;
            basicInfo.increaseBalance = increaseBalance;
            basicInfo.totBalance = totBalance;

            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("paymentStatus view", e)
            next(e);
        }
    });

}

//고객이 본사에서 코인을 판매 할때 
function fnSaleCacl(req, search) {
    return new Promise(function (resolve, reject) {
        let {pageIndex} = req.body;

        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);
        mydb.execute(async conn => {
            try {
                let obj = {};
                obj.srtDt = search.srtDt;
                obj.endDt = search.endDt;
                let mainAdmin = req.user.adminGrade;
                if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";
                else obj.cmpnyCd = req.user.cmpnyCd;

                // if(obj.srtDt == moment().add(7, 'hours').format("YYYY-MM-DD")) {
                //   obj.cs_coin_sell = req.user.cs_coin_sell;
                //   obj.cs_coin_trans = req.user.cs_coin_trans;
                // } else {
                obj.cs_coin_sell = 'cs_coin_sell';
                obj.cs_coin_trans = 'cs_coin_trans';
                // }

                // 본사에서 구매한 경우 ( 지사에서 코인 정산 시 )totSum
                let totalSum = await Query.QGetSaleCaclTotal(obj, conn);
                let totalPageCount = totalSum.totSum
                if (pageIndex == "" || pageIndex == null) {
                    pageIndex = 1;
                }
                ;

                let salePagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
                obj.pageIndex = pageIndex;
                obj.rowsPerPage = salePagination.rowsPerPage;
                salePagination.totalItems = totalPageCount;

                let saleCaclList = await Query.QGetSaleCaclList(obj, conn);

                let rtnObj = {};
                rtnObj.pagination = salePagination;
                rtnObj.caclList = saleCaclList;
                resolve(rtnObj);

            } catch (e) {
                logUtil.errObj("paymentStatus view", e)
                reject(e);
            }
        });
    });
}

// 고객이 메인 업체에게 포인트 전환 시에 
function fnTransCacl(req, search) {
    return new Promise(function (resolve, reject) {
        let {pageIndex} = req.body;

        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);
        mydb.execute(async conn => {
            try {
                let obj = {};
                obj.srtDt = search.srtDt;
                obj.endDt = search.endDt;
                let mainAdmin = req.user.adminGrade;
                if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";
                else obj.cmpnyCd = req.user.cmpnyCd;

                // if(obj.srtDt == moment().add(7, 'hours').format("YYYY-MM-DD")) {
                //   obj.cs_coin_sell = req.user.cs_coin_sell;
                //   obj.cs_coin_trans = req.user.cs_coin_trans;
                // } else {
                obj.cs_coin_sell = 'cs_coin_sell';
                obj.cs_coin_trans = 'cs_coin_trans';
                // }

                let totalSum = await Query.QGetTransCaclTotal(obj, conn);
                let totalPageCount = totalSum.totSum
                if (pageIndex == "" || pageIndex == null) {
                    pageIndex = 1;
                }
                ;

                let transPagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
                obj.pageIndex = pageIndex;
                obj.rowsPerPage = transPagination.rowsPerPage;
                transPagination.totalItems = totalPageCount;

                let transCaclList = await Query.QGetTransCaclList(obj, conn);

                let rtnObj = {};
                rtnObj.pagination = transPagination;
                rtnObj.caclList = transCaclList;

                resolve(rtnObj);

            } catch (e) {
                reject(e);
            }
        });
    });
}

//미전환 금액
function fnRemainBalance(req, search) {
    return new Promise(function (resolve, reject) {
        let {pageIndex} = req.body;

        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);
        mydb.execute(async conn => {
            try {
                let obj = {};
                obj.srtDt = search.srtDt;
                obj.endDt = search.endDt;
                let mainAdmin = req.user.adminGrade;
                if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";
                else obj.cmpnyCd = req.user.cmpnyCd;

                // if(obj.srtDt == moment().add(7, 'hours').format("YYYY-MM-DD")) {
                //   obj.cs_coin_sell = req.user.cs_coin_sell;
                //   obj.cs_coin_trans = req.user.cs_coin_trans;
                // } else {
                obj.cs_coin_sell = 'cs_coin_sell';
                obj.cs_coin_trans = 'cs_coin_trans';
                // }

                let totalSum = await Query.QGetRemainBalanceTotal(obj, conn);
                let totalPageCount = totalSum.totSum
                if (pageIndex == "" || pageIndex == null) {
                    pageIndex = 1;
                }
                ;

                let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
                obj.pageIndex = pageIndex;
                obj.rowsPerPage = pagination.rowsPerPage;
                pagination.totalItems = totalPageCount;

                let caclList = await Query.QGetRemainBalanceList(obj, conn);

                let rtnObj = {};
                rtnObj.pagination = pagination;
                rtnObj.caclList = caclList;

                resolve(rtnObj);

            } catch (e) {
                reject(e);
            }
        });
    });
}

// 관리자 가 증감 차감 하는 경우 
function fnGetIncreseDecrese(req, search) {
    return new Promise(function (resolve, reject) {
        let {pageIndex, gubun} = req.body;

        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);
        mydb.execute(async conn => {
            try {
                let obj = {};
                obj.srtDt = search.srtDt;
                obj.endDt = search.endDt;
                obj.gubun = gubun;
                let mainAdmin = req.user.adminGrade;
                if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";
                else obj.cmpnyCd = req.user.cmpnyCd;

                // if(obj.srtDt == moment().add(7, 'hours').format("YYYY-MM-DD")) {
                //   obj.cs_coin_sell = req.user.cs_coin_sell;
                //   obj.cs_coin_trans = req.user.cs_coin_trans;
                // } else {
                obj.cs_coin_sell = 'cs_coin_sell';
                obj.cs_coin_trans = 'cs_coin_trans';
                // }

                let totalSum = await Query.QGetIncreseDecreseTotal(obj, conn);
                let totalPageCount = totalSum
                if (pageIndex == "" || pageIndex == null) {
                    pageIndex = 1;
                }
                ;

                let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
                obj.pageIndex = pageIndex;
                obj.rowsPerPage = pagination.rowsPerPage;
                pagination.totalItems = totalPageCount;

                let caclList = await Query.QGetIncreseDecreseList(obj, conn);

                let rtnObj = {};
                rtnObj.pagination = pagination;
                rtnObj.caclList = caclList;

                resolve(rtnObj);

            } catch (e) {
                reject(e);
            }
        });
    });
}


