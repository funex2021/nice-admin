const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./coin.sqlmap'); // 여기
const memQuery = require(path.join(process.cwd(), '/routes/membership/mem.sqlmap'))
const caclQuery = require(path.join(process.cwd(), '/routes/cacl/cacl.sqlmap'))

const tron = require(path.join(process.cwd(), '/routes/blockchain/bk.sqlmap'))

const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const encryption = require(path.join(process.cwd(), '/routes/services/encUtil'));
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const CONST = require(path.join(process.cwd(), '/routes/services/consts'));
var isNullOrEmpty = require('is-null-or-empty');
const {v4: uuidv4} = require('uuid');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const admUtil = require(path.join(process.cwd(), '/routes/config/common/admUtil'))
var requestIp = require('request-ip');


exports.view = async (req, res, next) => {


    //console.log('moment().format("YYYY/MM/DD HH:mm:ss") : ' + moment().format("YYYY/MM/DD HH:mm:ss"));


    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {alramDt, srtDt, endDt, srchOption, srchBuySts, srchText, pageIndex, rowsPerPage} = req.body;

    let search = {};
    search.option = srchOption;
    search.buysts = srchBuySts;
    if (srchOption == "") search.srchText = "";
    else {
        search.srchText = srchText;
        //pageIndex = 1;
    }
    if (srtDt == undefined || srtDt == "" || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        // srtDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        endDt = moment().format("YYYY/MM/DD")
        srtDt = moment().format("YYYY/MM/DD")
    }
    //console.log(srtDt)
    search.srtDt = srtDt;
    search.endDt = endDt;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.cs_coin_sell = req.user.cs_coin_sell;
    obj.cs_coin_trans = req.user.cs_coin_trans;

    obj.srchOption = srchOption;
    obj.srchBuySts = srchBuySts;
    obj.srchText = srchText;
    obj.srtDt = srtDt;
    obj.endDt = endDt;
    //console.log(req.user)
    //console.log(obj)
    mydb.executeTx(async conn => {
        try {
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";

            let totalPageCount = await Query.QGetCoinTotal(obj, conn);

            //console.log("controller pageIndex : " + pageIndex)

            if (pageIndex == "" || pageIndex == null || pageIndex == undefined) {
                pageIndex = 1;
            }
            ;
            if (rowsPerPage == "" || rowsPerPage == null || rowsPerPage == undefined) {
                rowsPerPage = 20;
            }
            ;

            let totSale = await caclQuery.QGetTotSaleCacl(obj, conn);
            let totTrans = await caclQuery.QGetTotTransCacl(obj, conn);
            let totBalance = await caclQuery.QGetTotBalance(obj, conn);
            //CMDT00000000000044 차감
            obj.changeCd = "CMDT00000000000044"
            decreaseBalance = await caclQuery.QGetInDecreaseChangeTotBalance(obj, conn);
            //CMDT00000000000043 증감
            obj.changeCd = "CMDT00000000000043"
            increaseBalance = await caclQuery.QGetInDecreaseChangeTotBalance(obj, conn);


            //console.log("controller pageIndex : " + pageIndex)

            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;

            // console.log(obj);

            let coinList = await Query.QGetCoinList(obj, conn);

            let basicInfo = {}
            basicInfo.title = '코인 구매 관리';
            basicInfo.menu = 'MENU00000000000005';
            basicInfo.rtnUrl = 'coin/paymentStatus';
            basicInfo.coinList = coinList;
            basicInfo.search = search;
            basicInfo.pagination = pagination;

            basicInfo.tot_buy_num = totSale.tot_buy_num;
            basicInfo.tot_pay_num = totSale.tot_pay_num;
            basicInfo.tot_trans_num = totTrans.tot_trans_num;
            basicInfo.decreaseBalance = decreaseBalance;
            basicInfo.increaseBalance = increaseBalance;
            basicInfo.totBalance = totBalance;
            basicInfo.alramDt = alramDt;
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("paymentStatus view", e)
            next(e);
        }
    });
}


exports.summary = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srtDt, endDt, srchOption, srchBuySts, srchText, pageIndex} = req.body;

    let search = {};
    search.option = srchOption;
    search.buysts = srchBuySts;
    if (srchOption == "") search.srchText = "";
    else {
        search.srchText = srchText;
        //pageIndex = 1;
    }

    if (srtDt == "" || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        // srtDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        endDt = moment().format("YYYY/MM/DD")
        srtDt = moment().format("YYYY/MM/DD")
    }
    //console.log(srtDt)
    search.srtDt = srtDt;
    search.endDt = endDt;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.cs_coin_sell = req.user.cs_coin_sell;
    obj.cs_coin_trans = req.user.cs_coin_trans;

    obj.srchOption = srchOption;
    obj.srchBuySts = srchBuySts;
    obj.srchText = srchText;
    obj.srtDt = srtDt;
    obj.endDt = endDt;

    mydb.execute(async conn => {
        try {
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";


            let totSale = await caclQuery.QGetTotSaleCacl(obj, conn);
            let totTrans = await caclQuery.QGetTotTransCacl(obj, conn);
            let totBalance = await caclQuery.QGetTotBalance(obj, conn);
            //CMDT00000000000044 차감
            obj.changeCd = "CMDT00000000000044"
            decreaseBalance = await caclQuery.QGetInDecreaseChangeTotBalance(obj, conn);
            //CMDT00000000000043 증감
            obj.changeCd = "CMDT00000000000043"
            increaseBalance = await caclQuery.QGetInDecreaseChangeTotBalance(obj, conn);
            let basicInfo = {};
            basicInfo.tot_buy_num = totSale.tot_buy_num;
            basicInfo.tot_pay_num = totSale.tot_pay_num;
            basicInfo.tot_trans_num = totTrans.tot_trans_num;
            basicInfo.decreaseBalance = decreaseBalance;
            basicInfo.increaseBalance = increaseBalance;
            basicInfo.totBalance = totBalance;

            res.json(rtnUtil.successTrue("200", "", {'basicInfo': basicInfo}));
            return;
        } catch (e) {
            logUtil.errObj("summary view", e)
            res.json(rtnUtil.successFalse('500', e.message, e, ''))
        }
    });
}

exports.tblView = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srtDt, endDt, srchOption, srchBuySts, srchText, pageIndex} = req.body;

    let search = {};
    search.option = srchOption;
    search.buysts = srchBuySts;
    if (srchOption == "") search.srchText = "";
    else {
        search.srchText = srchText;
        //pageIndex = 1;
    }

    if (srtDt == "" || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        // srtDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        endDt = moment().format("YYYY/MM/DD")
        srtDt = moment().format("YYYY/MM/DD")
    }
    //console.log(srtDt)
    search.srtDt = srtDt;
    search.endDt = endDt;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.cs_coin_sell = req.user.cs_coin_sell;
    obj.cs_coin_trans = req.user.cs_coin_trans;

    obj.srchOption = srchOption;
    obj.srchBuySts = srchBuySts;
    obj.srchText = srchText;
    obj.srtDt = srtDt;
    obj.endDt = endDt;

    mydb.execute(async conn => {
        try {
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";

            let totalPageCount = await Query.QGetCoinTotal(obj, conn);

            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;

            let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;

            let coinList = await Query.QGetCoinList(obj, conn);

            let basicInfo = {}
            basicInfo.coinList = coinList;
            basicInfo.search = search;
            basicInfo.pagination = pagination;

            res.json(rtnUtil.successTrue("200", "", {'basicInfo': basicInfo}));
            return;
        } catch (e) {
            logUtil.errObj("tblView view", e)
            res.json(rtnUtil.successFalse('500', e.message, e, ''))
        }
    });
}


exports.buyCngStatus = async (req, res, next) => {
    let {buySeq, buySts} = req.body;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            let obj = {}
            obj.buySeq = buySeq;
            obj.buySts = buySts;
            obj.cmpnyCd = req.user.cmpny_cd;
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";

            obj.cs_coin_sell = req.user.cs_coin_sell;
            obj.cs_coin_trans = req.user.cs_coin_trans;

            let currBuySts = await Query.QGetCoinBuySts(obj, conn);
            // 입금내역이 존재 여부 확인
            if (currBuySts.length > 0) {
                let mem_id = currBuySts[0].mem_id;
                //입금대기 상태
                if (currBuySts[0].sell_sts == 'CMDT00000000000024') {
                    obj.mSeq = currBuySts[0].m_seq;
                    // 취소 혹은 승인 처리를 합니다.
                    if (obj.buySts == 'CMDT00000000000026') {
                        // 현재 잔액 조회
                        let balance = await memQuery.QGetBalance(obj, conn);
                        obj.balance = balance[0].balance;

                        // 입금 잔액 + 기존 잔액 업데이트
                        let sellPayNum = await Query.QGetCsSendSell(obj, conn);
                        obj.totBalance = parseInt(obj.balance) + parseInt(sellPayNum[0].pay_num);
                        // obj.totBalance = parseInt(obj.balance) + parseInt(sellPayNum[0].buy_num);
                        await Query.QUptBalanceWallet(obj, conn);

                        // cs_coin_sell => sell_sts, txid, send_yn : update
                        let sendTxid = uuidv4() + uuidv4();
                        obj.sendTxid = sendTxid.replace(/[-/]/gi, '');
                        await Query.QUptCoinBuySts(obj, conn);

                        // cs_nft_buy 상태 업데이트
                        let nftBuyObj = {};
                        nftBuyObj.coinSellSeq = obj.buySeq;
                        nftBuyObj.buyStatus = 'CMDT00000000000087';
                        await Query.QUptNftBuy(nftBuyObj, conn);

                        // cs_coin_sell_his
                        obj.txid = obj.buySeq;
                        obj.output = '';
                        obj.memberYN = 'N';
                        obj.coinInfo = 'CMDT00000000000038'
                        obj.toAddress = '';
                        // obj.balance = sellPayNum[0].pay_num;
                        obj.balance = sellPayNum[0].buy_num;
                        obj.fromAddress = '';
                        obj.refrenceCode = obj.sendTxid;
                        obj.userId = mem_id;

                        await Query.QSetCoinSendHis(obj, conn);

                        conn.commit();

                        var hisObj = {};
                        hisObj.cmpnyCd = req.user.cmpnyCd;
                        hisObj.mSeq = '';
                        hisObj.admin_id = req.user.memId;
                        hisObj.adm_code = 'CMDT00000000000058';
                        hisObj.adm_request = JSON.stringify(obj);
                        hisObj.adm_response = '정상적으로 처리 되었습니다.';
                        hisObj.is_success = '01';
                        hisObj.adm_ip = requestIp.getClientIp(req);
                        await admUtil.QSetHistory(hisObj, conn)
                        conn.commit();


                        res.json(rtnUtil.successTrue("200", "", {'txid': ''}))
                    } else {
                        //취소건
                        obj.sendTxid = '';
                        await Query.QUptCoinBuySts(obj, conn);

                        // cs_nft_buy 상태 업데이트
                        let nftBuyObj = {};
                        nftBuyObj.coinSellSeq = obj.buySeq;
                        nftBuyObj.buyStatus = 'CMDT00000000000086';
                        await Query.QUptNftBuy(nftBuyObj, conn);

                        conn.commit();

                        var hisObj = {};
                        hisObj.cmpnyCd = req.user.cmpnyCd;
                        hisObj.mSeq = '';
                        hisObj.admin_id = req.user.memId;
                        hisObj.adm_code = 'CMDT00000000000058';
                        hisObj.adm_request = JSON.stringify(obj);
                        hisObj.adm_response = '정상적으로 처리 되었습니다.';
                        hisObj.is_success = '01';
                        hisObj.adm_ip = requestIp.getClientIp(req);
                        await admUtil.QSetHistory(hisObj, conn)
                        conn.commit();

                        res.json(rtnUtil.successTrue("200", "", {'txid': ''}))
                    }
                } else {
                    conn.rollback();
                    //console.log("승인/취소 처리된 요청건입니다.")
                    res.json(rtnUtil.successFalse('500', "승인/취소 처리된 요청건입니다. ", '', ''))
                }
            } else {
                conn.rollback();
                res.json(rtnUtil.successFalse('500', '요청건이 없습니다.', '', ''))
            }

        } catch (e) {
            logUtil.errObj("coin buyCngStatus", e)
            conn.rollback();
            res.json(rtnUtil.successFalse('500', e.message, e, ''))
        }
    });
}

exports.alram = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    let {alramDt} = req.body;
    mydb.execute(async conn => {
        try {
            let obj = {}
            obj.alramDt = alramDt;
            // obj.srtDt = moment().add(7, 'hours').format("YYYY/MM/DD HH:mm:ss")
            obj.srtDt = moment().format("YYYY/MM/DD HH:mm:ss")
            obj.cmpnyCd = req.user.cmpnyCd;
            obj.cs_coin_sell = req.user.cs_coin_sell;
            obj.cs_coin_trans = req.user.cs_coin_trans;

            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";
            let dateList = await Query.QGetAlramStatus(obj, conn);

            try {
                if (dateList.length > 0) {
                    res.json(rtnUtil.successTrue("200", "", {"dateList": dateList[0]}))
                } else {
                    res.json(rtnUtil.successFalse('422', '새로운 알람이 없습니다.', 'UNPROCESSABLE ENTITY', ''))
                }
            } catch (e) {
                //console.log(e)
                res.json(rtnUtil.successFalse('500', e.message, e, ''))
            }
        } catch (e) {
            //console.log(e)
            if (e.message.indexOf('cmpnyCd') > -1) res.json(rtnUtil.successFalse('403', e.message, e, ''));
            else res.json(rtnUtil.successFalse('500', e.message, e, ''));
        }
    });
}

exports.walletView = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchGubun, srchText, pageIndex, srtDt, endDt, rowsPerPage} = req.body;

    if (isNullOrEmpty(srchGubun)) {
        srchGubun = "";
    }


    let search = {};
    search.srchOption = srchOption;
    search.srchGubun = srchGubun;
    if (srchOption == "") search.srchText = "";
    else search.srchText = srchText;

    if (srtDt == undefined || srtDt == "" || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        // srtDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        srtDt = moment().format("YYYY/MM/DD")
        endDt = moment().format("YYYY/MM/DD")
    }

    search.srtDt = srtDt;
    search.endDt = endDt;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    // if(srtDt == moment().add(7, 'hours').format("YYYY/MM/DD")) {
    // if(srtDt == moment().format("YYYY/MM/DD")) {
    obj.cs_coin_sell = req.user.cs_coin_sell;
    obj.cs_coin_trans = req.user.cs_coin_trans;
    // } else {
    //   obj.cs_coin_sell = 'cs_coin_sell';
    //   obj.cs_coin_trans = 'cs_coin_trans';
    // }


    obj.srchOption = srchOption;
    obj.srchText = srchText;
    obj.gubun = srchGubun;
    obj.srtDt = srtDt;
    obj.endDt = endDt;

    //console.log(obj)
    mydb.executeTx(async conn => {
        try {
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;
            if (rowsPerPage == "" || rowsPerPage == null) {
                rowsPerPage = 10;
            }
            ;


            //console.log('srchGubun : ' + srchGubun)

            let totalPageCount = 0;
            if (isNullOrEmpty(srchGubun)) {
                totalPageCount = await Query.QGetGubunAllSendCoinHisTotal(obj, conn);
            } else {
                if (srchGubun == 'CMDT00000000000038') { //판매
                    totalPageCount = await Query.QGetSellSendCoinHisTot(obj, conn);
                } else if (srchGubun == 'CMDT00000000000039') { //전환
                    totalPageCount = await Query.QGetTransSendCoinHisTot(obj, conn);
                } else if (srchGubun == 'CMDT00000000000043' || srchGubun == 'CMDT00000000000044') { //증감
                    totalPageCount = await Query.QGetIncreseDecreseTotal(obj, conn);
                } else { //판매
                    totalPageCount = await Query.QGetGubunAllSendCoinHisTotal(obj, conn);
                }

            }

            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            //console.log(pagination)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;

            let coinList = null;
            if (isNullOrEmpty(srchGubun)) {
                coinList = await Query.QGetGubunAllSendCoinHis(obj, conn);
            } else {
                if (srchGubun == 'CMDT00000000000038') { //판매
                    coinList = await Query.QGetSellSendCoinHis(obj, conn);
                } else if (srchGubun == 'CMDT00000000000039') { //전환
                    coinList = await Query.QGetTransSendCoinHis(obj, conn);
                } else if (srchGubun == 'CMDT00000000000043' || srchGubun == 'CMDT00000000000044') { //증감
                    coinList = await Query.QGetIncreseDecreseList(obj, conn);
                } else {
                    coinList = await Query.QGetGubunAllSendCoinHis(obj, conn);
                }

            }


            let basicInfo = {}
            basicInfo.title = '지갑 입출금 내역';
            basicInfo.menu = 'MENU00000000000006';
            basicInfo.rtnUrl = 'coin/walletHis';
            basicInfo.coinList = coinList;
            basicInfo.search = search;
            basicInfo.pagination = pagination;

            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("walletView", e)
            next(e);
        }
    });
}

//코인 회수
exports.coinReturnSend = async (req, res, next) => {
    const param = JSON.parse(JSON.stringify(req.body));

    let obj = {}
    obj.buySeq = param['param[buySeq]'];
    obj.buySts = param['param[buySts]'];
    logUtil.logStr("coin coinReturnSend", "buySeq", obj)
    await Query.QUptCoinBuySts(obj, conn);

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            //사용자
            let coinInfo = await Query.QGetWallet(obj, conn);

            let unitCoinInfo = {};
            unitCoinInfo.address = coinInfo[0].coin_addr;

            let tronInfo = await tron.tronBalance(coinInfo[0].coin_addr);
            unitCoinInfo.coin = tronInfo.coin;
            unitCoinInfo.token = tronInfo.token;

            if (parseInt(tronInfo.token) > 0 && parseInt(balance) > 0) {

                let mstCoinInfo = await coinQuery.QGetMasterCoinInfo(obj, conn);
                obj.toAddress = mstCoinInfo[0].coin_addr;

                let clientCoinInfo = await coinQuery.QGetWallet(obj, conn);
                obj.fromAddress = clientCoinInfo[0].coin_addr;
                obj.fromCoinPk = clientCoinInfo[0].coin_pk;

                let txId = await tron.returnCoin(obj.toAddress, obj.balance, obj.fromAddress, obj.fromCoinPk)
                res.json(rtnUtil.successTrue('200', "", {"txid": txId}));
            }
        } catch (e) {
            res.json(rtnUtil.successFalse('500', e.message, e, ''))
        }
    });
}


exports.excelView = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srtDt, endDt, srchOption, srchBuySts, srchText, pageIndex} = req.body;

    let search = {};
    search.option = srchOption;
    search.buysts = srchBuySts;
    if (srchOption == "") search.srchText = "";
    else {
        search.srchText = srchText;
        //pageIndex = 1;
    }

    if (srtDt == "" || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        // srtDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        endDt = moment().format("YYYY/MM/DD")
        srtDt = moment().format("YYYY/MM/DD")
    }
    //console.log(srtDt)
    search.srtDt = srtDt;
    search.endDt = endDt;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    // obj.cs_coin_sell = req.user.cs_coin_sell;
    // obj.cs_coin_trans = req.user.cs_coin_trans;
    // if(srtDt == moment().add(7, 'hours').format("YYYY/MM/DD")) {
    if (srtDt == moment().format("YYYY/MM/DD")) {
        obj.cs_coin_sell = req.user.cs_coin_sell;
        obj.cs_coin_trans = req.user.cs_coin_trans;
    } else {
        obj.cs_coin_sell = 'cs_coin_sell';
        obj.cs_coin_trans = 'cs_coin_trans';
    }

    obj.srchOption = srchOption;
    obj.srchBuySts = srchBuySts;
    obj.srchText = srchText;
    obj.srtDt = srtDt;
    obj.endDt = endDt;

    mydb.execute(async conn => {
        try {
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";

            let totalPageCount = await Query.QGetCoinTotal(obj, conn);

            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;


            let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;
            obj.isExcel = true;
            let coinList = await Query.QGetCoinList(obj, conn);

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000057';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '정상적으로 처리 되었습니다.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue('200', "", {'coinList': coinList}));

            next();
        } catch (e) {
            logUtil.errObj("paymentStatus view", e)
            next(e);
        }
    });
}


exports.walletExcelView = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchGubun, srchText, pageIndex, srtDt, endDt} = req.body;

    if (isNullOrEmpty(srchGubun)) {
        srchGubun = "";
    }


    let search = {};
    search.srchOption = srchOption;
    search.srchGubun = srchGubun;
    if (srchOption == "") search.srchText = "";
    else search.srchText = srchText;

    if (srtDt == "" || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        // srtDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        endDt = moment().format("YYYY/MM/DD")
        srtDt = moment().format("YYYY/MM/DD")
    }

    search.srtDt = srtDt;
    search.endDt = endDt;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd; 
    // obj.cs_coin_sell = req.user.cs_coin_sell;
    // obj.cs_coin_trans = req.user.cs_coin_trans;
    // if(srtDt == moment().add(7, 'hours').format("YYYY/MM/DD")) {
    // if(srtDt == moment().format("YYYY/MM/DD")) {
    obj.cs_coin_sell = req.user.cs_coin_sell;
    obj.cs_coin_trans = req.user.cs_coin_trans;
    // } else {
    //   obj.cs_coin_sell = 'cs_coin_sell';
    //   obj.cs_coin_trans = 'cs_coin_trans';
    // }

    obj.srchOption = srchOption;
    obj.srchText = srchText;
    obj.gubun = srchGubun;
    obj.srtDt = srtDt;
    obj.endDt = endDt;

    //console.log(obj)
    mydb.execute(async conn => {
        try {
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;
            let totalPageCount = 0;
            if (isNullOrEmpty(srchGubun)) {
                totalPageCount = await Query.QGetGubunAllSendCoinHisTotal(obj, conn);
            } else {
                if (srchGubun == 'CMDT00000000000038') { //판매
                    totalPageCount = await Query.QGetSellSendCoinHisTot(obj, conn);
                } else if (srchGubun == 'CMDT00000000000039') { //전환
                    totalPageCount = await Query.QGetTransSendCoinHisTot(obj, conn);
                } else if (srchGubun == 'CMDT00000000000043' || srchGubun == 'CMDT00000000000044') { //증감
                    totalPageCount = await Query.QGetIncreseDecreseTotal(obj, conn);
                } else { //판매
                    totalPageCount = await Query.QGetGubunAllSendCoinHisTotal(obj, conn);
                }

            }

            let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
            //console.log(pagination)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = 999999;
            pagination.totalItems = totalPageCount;

            let coinList = null;
            if (isNullOrEmpty(srchGubun)) {
                coinList = await Query.QGetGubunAllSendCoinHis(obj, conn);
            } else {
                if (srchGubun == 'CMDT00000000000038') { //판매
                    coinList = await Query.QGetSellSendCoinHis(obj, conn);
                } else if (srchGubun == 'CMDT00000000000039') { //전환
                    coinList = await Query.QGetTransSendCoinHis(obj, conn);
                } else if (srchGubun == 'CMDT00000000000043' || srchGubun == 'CMDT00000000000044') { //증감
                    coinList = await Query.QGetIncreseDecreseList(obj, conn);
                } else {
                    coinList = await Query.QGetGubunAllSendCoinHis(obj, conn);
                }

            }

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000057';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '정상적으로 처리 되었습니다.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue('200', "", {'coinList': coinList}));


            // let basicInfo = {}c
            // basicInfo.title = '지갑 입출금 내역';
            // basicInfo.menu = 'MENU00000000000006';
            // basicInfo.rtnUrl = 'coin/walletHis';
            // basicInfo.coinList = coinList;
            // basicInfo.search = search;
            // basicInfo.pagination = pagination;

            // req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("walletView", e)
            next(e);
        }
    });
}


exports.walletViewOld = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchGubun, srchText, pageIndex, srtDt, endDt, rowsPerPage} = req.body;

    if (isNullOrEmpty(srchGubun)) {
        srchGubun = "";
    }


    let search = {};
    search.srchOption = srchOption;
    search.srchGubun = srchGubun;
    if (srchOption == "") search.srchText = "";
    else search.srchText = srchText;

    if (srtDt == undefined || srtDt == "" || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        // srtDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        endDt = moment().format("YYYY/MM/DD")
        srtDt = moment().format("YYYY/MM/DD")
    }

    search.srtDt = srtDt;
    search.endDt = endDt;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.cs_coin_sell = req.user.cs_coin_sell;
    obj.cs_coin_trans = req.user.cs_coin_trans;
    // if(srtDt == moment().add(7, 'hours').format("YYYY-MM-DD")) {
    // if (srtDt == moment().format("YYYY/MM/DD")) {
    //     obj.cs_coin_sell = req.user.cs_coin_sell;
    //     obj.cs_coin_trans = req.user.cs_coin_trans;
    // } else {
    //     obj.cs_coin_sell = 'cs_coin_sell';
    //     obj.cs_coin_trans = 'cs_coin_trans';
    // }


    obj.srchOption = srchOption;
    obj.srchText = srchText;
    obj.gubun = srchGubun;
    obj.srtDt = srtDt;
    obj.endDt = endDt;

    console.log(obj)
    mydb.execute(async conn => {
        try {
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;
            if (rowsPerPage == "" || rowsPerPage == null) {
                rowsPerPage = 10;
            }
            ;


            console.log('srchGubun : ' + srchGubun)

            let totalPageCount = 0;
            if (isNullOrEmpty(srchGubun)) {
                totalPageCount = await Query.QGetGubunAllSendCoinHisTotalOld(obj, conn);
            } else {
                if (srchGubun == 'CMDT00000000000038') { //판매
                    totalPageCount = await Query.QGetSellSendCoinHisTotOld(obj, conn);
                } else if (srchGubun == 'CMDT00000000000039') { //전환
                    totalPageCount = await Query.QGetTransSendCoinHisTotOld(obj, conn);
                } else if (srchGubun == 'CMDT00000000000043' || srchGubun == 'CMDT00000000000044') { //증감
                    totalPageCount = await Query.QGetIncreseDecreseTotal(obj, conn);
                } else { //판매
                    totalPageCount = await Query.QGetGubunAllSendCoinHisTotal(obj, conn);
                }

            }

            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            console.log(pagination)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;

            let coinList = null;
            if (isNullOrEmpty(srchGubun)) {
                coinList = await Query.QGetGubunAllSendCoinHisOld(obj, conn);
            } else {
                if (srchGubun == 'CMDT00000000000038') { //판매
                    coinList = await Query.QGetSellSendCoinHisOld(obj, conn);
                } else if (srchGubun == 'CMDT00000000000039') { //전환
                    coinList = await Query.QGetTransSendCoinHisOld(obj, conn);
                } else if (srchGubun == 'CMDT00000000000043' || srchGubun == 'CMDT00000000000044') { //증감
                    coinList = await Query.QGetIncreseDecreseList(obj, conn);
                } else {
                    coinList = await Query.QGetGubunAllSendCoinHis(obj, conn);
                }

            }


            let basicInfo = {}
            basicInfo.title = '과거데이터 내역';
            basicInfo.menu = 'MENU00000000000008';
            basicInfo.rtnUrl = 'coin/walletHisOld';
            basicInfo.coinList = coinList;
            basicInfo.search = search;
            basicInfo.pagination = pagination;

            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("walletViewOld", e)
            next(e);
        }
    });
}


exports.walletExcelViewOld = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchGubun, srchText, pageIndex, srtDt, endDt} = req.body;

    if (isNullOrEmpty(srchGubun)) {
        srchGubun = "";
    }


    let search = {};
    search.srchOption = srchOption;
    search.srchGubun = srchGubun;
    if (srchOption == "") search.srchText = "";
    else search.srchText = srchText;

    if (srtDt == "" || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        // srtDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        endDt = moment().format("YYYY/MM/DD")
        srtDt = moment().format("YYYY/MM/DD")
    }

    search.srtDt = srtDt;
    search.endDt = endDt;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    // obj.cs_coin_sell = req.user.cs_coin_sell;
    // obj.cs_coin_trans = req.user.cs_coin_trans;
    // if(srtDt == moment().add(7, 'hours').format("YYYY-MM-DD")) {
    if (srtDt == moment().format("YYYY/MM/DD")) {
        obj.cs_coin_sell = req.user.cs_coin_sell;
        obj.cs_coin_trans = req.user.cs_coin_trans;
    } else {
        obj.cs_coin_sell = 'cs_coin_sell';
        obj.cs_coin_trans = 'cs_coin_trans';
    }

    obj.srchOption = srchOption;
    obj.srchText = srchText;
    obj.gubun = srchGubun;
    obj.srtDt = srtDt;
    obj.endDt = endDt;

    console.log(obj)
    mydb.execute(async conn => {
        try {
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;
            let totalPageCount = 0;
            if (isNullOrEmpty(srchGubun)) {
                totalPageCount = await Query.QGetGubunAllSendCoinHisTotalOld(obj, conn);
            } else {
                if (srchGubun == 'CMDT00000000000038') { //판매
                    totalPageCount = await Query.QGetSellSendCoinHisTotOld(obj, conn);
                } else if (srchGubun == 'CMDT00000000000039') { //전환
                    totalPageCount = await Query.QGetTransSendCoinHisTotOld(obj, conn);
                } else if (srchGubun == 'CMDT00000000000043' || srchGubun == 'CMDT00000000000044') { //증감
                    totalPageCount = await Query.QGetIncreseDecreseTotal(obj, conn);
                } else { //판매
                    totalPageCount = await Query.QGetGubunAllSendCoinHisTotal(obj, conn);
                }

            }

            let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
            console.log(pagination)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = 999999;
            pagination.totalItems = totalPageCount;

            let coinList = null;
            if (isNullOrEmpty(srchGubun)) {
                coinList = await Query.QGetGubunAllSendCoinHisOld(obj, conn);
            } else {
                if (srchGubun == 'CMDT00000000000038') { //판매
                    coinList = await Query.QGetSellSendCoinHisOld(obj, conn);
                } else if (srchGubun == 'CMDT00000000000039') { //전환
                    coinList = await Query.QGetTransSendCoinHisOld(obj, conn);
                } else if (srchGubun == 'CMDT00000000000043' || srchGubun == 'CMDT00000000000044') { //증감
                    coinList = await Query.QGetIncreseDecreseList(obj, conn);
                } else {
                    coinList = await Query.QGetGubunAllSendCoinHis(obj, conn);
                }

            }

            res.json(rtnUtil.successTrue('200', "", {'coinList': coinList}));


            // let basicInfo = {}c
            // basicInfo.title = '지갑 입출금 내역';
            // basicInfo.menu = 'MENU00000000000006';
            // basicInfo.rtnUrl = 'coin/walletHis';
            // basicInfo.coinList = coinList;
            // basicInfo.search = search;
            // basicInfo.pagination = pagination;

            // req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("walletView", e)
            next(e);
        }
    });
}

exports.nftBuyList = async (req, res, next) => {
    let {seq} = req.body;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let obj = {};
    obj.seq = seq;

    mydb.executeTx(async conn => {
        try {
            let buyList = await Query.QGetNftBuyList(obj, conn);

            res.json(rtnUtil.successTrue('200', "", buyList));
        } catch (e) {
            res.json(rtnUtil.successFalse('500', e.message, e, ''))
        }
    });
}