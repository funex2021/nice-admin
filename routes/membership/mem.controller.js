const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./mem.sqlmap'); // 여기

const tron = require(path.join(process.cwd(), '/routes/blockchain/bk.tron'))

const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const encryption = require(path.join(process.cwd(), '/routes/services/encUtil'));
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))

const admUtil = require(path.join(process.cwd(), '/routes/config/common/admUtil'))
var requestIp = require('request-ip');

const bkUtil = require(path.join(process.cwd(), '/routes/config/common/blockChainUtil'))

const {v4: uuidv4} = require('uuid');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

/*
* properties
*/
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('adm.properties');
const feeAddr = properties.get('com.send.feeAddr');

exports.mview = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchText, pageIndex, rowsPerPage, isCoin, status} = req.body;

    if (pageIndex == "" || pageIndex == null) {
        pageIndex = 1;
    }
    ;
    if (rowsPerPage == "" || rowsPerPage == null) {
        rowsPerPage = 10;
    }
    ;

    let search = {};
    search.option = srchOption;
    if (srchOption == "") search.srchText = "";
    else {
        search.srchText = srchText;
        //pageIndex = 1;
    }

    let obj = {};

    obj.mainAdmin = false;
    obj.memId = "";
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.srchOption = srchOption;
    obj.srchText = srchText;
    obj.isCoin = isCoin;
    obj.status = status;

    console.log('obj : ' + JSON.stringify(obj))

    mydb.executeTx(async conn => {
        try {
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";

            let totalPageCount = await Query.QGetMemTotal(obj, conn);
            logUtil.logStr("회원관리 totalPageCount", totalPageCount)


            // console.log(pageIndex,totalPageCount)
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)

            // console.log("pagination.rowsPerPage : " + pagination.rowsPerPage);


            obj.pageIndex = parseInt(pageIndex);
            obj.rowsPerPage = parseInt(rowsPerPage);
            let memList = await Query.QGetMemberList(obj, conn);
            //  console.log(pagination)
            let basicInfo = {}
            basicInfo.title = '회원 관리';
            basicInfo.menu = 'MENU00000000000003';
            basicInfo.rtnUrl = 'membership/index';
            basicInfo.memList = memList;
            basicInfo.search = search;
            basicInfo.isCoin = isCoin;
            basicInfo.status = status;
            basicInfo.pagination = pagination;

            // console.log("basicInfo.pagination.rowsPerPage : " + basicInfo.pagination.rowsPerPage);

            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("lecture.controller view", e)
            next(e);
        }
    });


}

exports.mins = async (req, res, next) => {
    let {
        mSeq,
        memId,
        memName,
        memPW1,
        memHp,
        memEmail,
        bankInfo,
        memNation,
        bankAcc,
        accNm
    } = req.body;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.memId = memId;
    obj.memNm = memName;
    obj.memHp = memHp;
    obj.memEmail = memEmail;
    obj.nation = memNation;
    obj.bankInfo = bankInfo;
    obj.bankAcc = bankAcc;
    obj.accNm = accNm;


    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            if (mSeq == '') {
                obj.mSeq = uuidv4();
                // let passInfo = await encryption.createPasswordHash(Buffer.from(memPW1, "base64").toString('utf8'));
                let passInfo = await encryption.createPasswordHash(memPW1);
                obj.memPass = passInfo.password;
                obj.salt = passInfo.salt;

                let tronInfo = await tron.newAddress();
                obj.coinTyp = 'CMDT00000000000018';
                obj.cmpnyAddr = tronInfo.address;
                obj.cmpnyPk = tronInfo.privateKey;

                await Query.QSetMember(obj, conn);
                await Query.QSetWallet(obj, conn);
                await Query.QSetBank(obj, conn);
            } else {
                //update
                obj.mSeq = mSeq;


                await Query.QUptMember(obj, conn);
                await Query.QUptBank(obj, conn);
            }

            conn.commit();


            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = mSeq;
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000055';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '정상적으로 처리 되었습니다.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)

            res.json(rtnUtil.successTrue("200", "", ""));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("회원 등록 mins", e)
            res.json(rtnUtil.successFalse("500", "", ""));
        }
    });
}

exports.changePassword = async (req, res, next) => {
    let {
        mSeq, pass
    } = req.body;

    let obj = {};
    obj.mSeq = mSeq;
    obj.pass = pass;


    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            // let passInfo = await encryption.createPasswordHash(Buffer.from(pass, "base64").toString('utf8'));
            let passInfo = await encryption.createPasswordHash(pass);
            obj.memPass = passInfo.password;
            obj.salt = passInfo.salt;

            await Query.QUptPassMember(obj, conn);
            conn.commit();

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = mSeq;
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000056';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '정상적으로 처리 되었습니다.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue("200", "", ""));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("회원 등록 mins", e)
            res.json(rtnUtil.successFalse("500", "", ""));
        }
    });
}

exports.coinInfo = async (req, res, next) => {
    let {mSeq} = req.body;

    let obj = {};
    obj.mSeq = mSeq;
    obj.cmpnyCd = req.user.cmpnyCd;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            let coinInfo = await Query.QGetWallet(obj, conn);

            if (coinInfo[0].coin_addr == 'undefined') {
                let tronInfo = await tron.newAddress();
                obj.walletSeq = coinInfo[0].seq;
                obj.cmpnyAddr = tronInfo.address;
                obj.cmpnyPk = tronInfo.privateKey;

                coinInfo[0].coin_addr = tronInfo.address
                await Query.QUptWallet(obj, conn);
            }

            let unitCoinInfo = {};
            unitCoinInfo.address = coinInfo[0].coin_addr;
            let start = new Date().getTime();

            try {
                let blance = await Query.QGetBalance(obj, conn);
                unitCoinInfo.coin = 0;
                unitCoinInfo.token = blance[0].blance;
            } catch (e) {
                let tronInfo = await tron.tronBalance(coinInfo[0].coin_addr);
                console.log(coinInfo[0].coin_addr)
                console.log(tronInfo)
                unitCoinInfo.coin = 0;
                unitCoinInfo.token = tronInfo.token;

                obj.balance = tronInfo.token;
                await Query.QInsMeberBalance(obj, conn);

            }

            let elapsed = new Date().getTime() - start;
            console.log("coin 시간 측정 ::::", elapsed)
            let coinHistory = await Query.QGetCoinBuyList(obj, conn);

            res.json(rtnUtil.successTrue('200', "", {'coinInfo': unitCoinInfo, 'coinHistory': coinHistory}));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("회원 등록", e)
            res.json(rtnUtil.successFalse("", ""));
        }
    });
}

exports.balance = async (req, res, next) => {
    let {mSeq} = req.body;

    let obj = {};

    obj.mSeq = mSeq;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {

            let balance = await Query.QGetBalance(obj, conn);
            console.log(balance)
            res.json(rtnUtil.successTrue('200', "", {'balance': balance[0].balance}));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("회원 등록", e)
            res.json(rtnUtil.successFalse("", ""));
        }
    });
}

exports.changeBalance = async (req, res, next) => {
    let {mSeq, changeDesc, coinBalance, changeCode} = req.body;

    let obj = {};

    obj.mSeq = mSeq;
    obj.coinBalance = coinBalance;
    obj.changeDesc = changeDesc;
    obj.changeCode = changeCode;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {

            let trnsBalance = await Query.QGetTransBalance(obj, conn);
            let balance = await Query.QGetBalance(obj, conn);
            if (changeCode == 'CMDT00000000000044') { //차감

                console.log("parseInt(balance[0].balance) : " + parseInt(balance[0].balance))
                console.log("parseInt(trnsBalance[0].balance) : " + parseInt(trnsBalance[0].balance))

                if (parseInt(balance[0].balance) > 0 && parseInt(coinBalance) <= parseInt(balance[0].balance)) {
                    if (parseInt(coinBalance) <= parseInt(balance[0].balance) - parseInt(trnsBalance[0].balance)) {
                        obj.amt = parseInt(balance[0].balance) - parseInt(coinBalance);

                        // let userAddr = await Query.QGetUserAddr(obj, conn);
                        // // (fromPk, toAddress, balance)
                        // if (userAddr.length > 0 && userAddr[0].eth_pk != null) {
                        //     await bkUtil.delegateSendToken(userAddr[0].eth_pk, req.user.ethAddr, coinBalance, "0x" + feeAddr);
                        // } else {
                        //     let ethInfo = await bkUtil.getNewAddress(mSeq);
                        //     obj.ethAddr = ethInfo.ethAddr;
                        //     obj.ethPk = ethInfo.pk;
                        //     await Query.QSetUserAddr(obj, conn);
                        //     await bkUtil.delegateSendToken(ethInfo.pk, req.user.ethAddr, coinBalance, "0x" + feeAddr);
                        // }

                        await Query.QInsBalanceChangeHis(obj, conn);
                        await Query.QUptBalance(obj, conn);
                        conn.commit();

                        var hisObj = {};
                        hisObj.cmpnyCd = req.user.cmpnyCd;
                        hisObj.mSeq = mSeq;
                        hisObj.admin_id = req.user.memId;
                        hisObj.adm_code = 'CMDT00000000000053';
                        hisObj.adm_request = JSON.stringify(obj);
                        hisObj.adm_response = '차감 성공';
                        hisObj.is_success = '01';
                        hisObj.adm_ip = requestIp.getClientIp(req);
                        await admUtil.QSetHistory(hisObj, conn)
                        conn.commit();

                        res.json(rtnUtil.successTrue('200', "", {'balance': obj.amt}));
                    } else {
                        conn.rollback();
                        res.json(rtnUtil.successFalse('400', '전환 진행중인 잔액이 있어서 현재 잔액이 부족합니다.', '', ''));
                    }

                } else {
                    conn.rollback();
                    res.json(rtnUtil.successFalse('400', '잔액이 부족합니다.', '', ''));
                }
            } else if (changeCode == 'CMDT00000000000043') {
                obj.amt = parseInt(balance[0].balance) + parseInt(coinBalance);

                // let userAddr = await Query.QGetUserAddr(obj, conn);
                // console.log('userAddr : ', userAddr);
                //
                // if (userAddr.length > 0 && userAddr[0].eth_addr != null) {
                //     await bkUtil.delegateSendToken(req.user.ethPk, userAddr[0].eth_addr, coinBalance, "0x" + feeAddr);
                // } else {
                //     let ethInfo = await bkUtil.getNewAddress(mSeq);
                //     obj.ethAddr = ethInfo.ethAddr;
                //     obj.ethPk = ethInfo.pk;
                //     await Query.QSetUserAddr(obj, conn);
                //     await bkUtil.delegateSendToken(req.user.ethPk, ethInfo.ethAddr, coinBalance, "0x" + feeAddr);
                // }

                await Query.QInsBalanceChangeHis(obj, conn);
                await Query.QUptBalance(obj, conn);
                conn.commit();
                var hisObj = {};
                hisObj.cmpnyCd = req.user.cmpnyCd;
                hisObj.mSeq = mSeq;
                hisObj.admin_id = req.user.memId;
                hisObj.adm_code = 'CMDT00000000000053';
                hisObj.adm_request = JSON.stringify(obj);
                hisObj.adm_response = '증감 성공';
                hisObj.is_success = '01';
                hisObj.adm_ip = requestIp.getClientIp(req);
                await admUtil.QSetHistory(hisObj, conn)
                conn.commit();

                res.json(rtnUtil.successTrue('200', "", {'balance': obj.amt}));
            } else {
                conn.rollback();
                throw "상태코드가 없습니다."
            }
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse('500', e.message, '', ''));
        }
    });
}

exports.history = async (req, res, next) => {
    let {mSeq, pageIndex} = req.body;

    let obj = {};

    obj.mSeq = mSeq;
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.cs_coin_sell = req.user.cs_coin_sell;
    obj.cs_coin_trans = req.user.cs_coin_trans;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;
            obj.pageIndex = pageIndex;
            let totalPageCount = await Query.QGetMemHistoryTotal(obj, conn);
            console.log(totalPageCount)
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, 10)

            obj.pageIndex = parseInt(pageIndex);
            obj.rowsPerPage = pagination.rowsPerPage;
            let history = await Query.QGetMemHistory(obj, conn);
            res.json(rtnUtil.successTrue('200', "", {
                'history': history,
                'pagination': pagination,
                'pageIndex': pageIndex
            }));
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse('500', e.message, '', ''));
        }
    });
}

exports.excelView = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchText, isCoin, status} = req.body;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.srchOption = srchOption;
    obj.srchText = srchText;
    obj.isCoin = isCoin;
    obj.status = status;

    mydb.execute(async conn => {
        try {
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";

            let memList = await Query.QGetExcelMemList(obj, conn);

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

            res.json(rtnUtil.successTrue('200', "", {'memList': memList}));

        } catch (e) {
            res.json(rtnUtil.successFalse('500', e.message, '', ''));
        }
    });


}

exports.mCngStatus = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {memId, memStatus} = req.body;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.memId = memId;
    obj.memStatus = memStatus;

    mydb.execute(async conn => {
        try {
            let mainAdmin = req.user.adminGrade;
            if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";

            await Query.QSetMemStatus(obj, conn);

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000054';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '정상적으로 처리 되었습니다.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue('200', "", ""));

        } catch (e) {
            res.json(rtnUtil.successFalse('500', e.message, '', ''));
        }
    });

}

exports.changeAdminPassword = async (req, res, next) => {
    let {
        pass
    } = req.body;

    let obj = {};
    obj.pass = pass;
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            // let passInfo = await encryption.createPasswordHash(Buffer.from(pass, "base64").toString('utf8'));
            let passInfo = await encryption.createPasswordHash(pass);
            obj.memPass = passInfo.password;
            obj.salt = passInfo.salt;

            await Query.QUptAdminPassMember(obj, conn);
            conn.commit();

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000048';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '정상적으로 처리 되었습니다.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue("200", "", ""));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("변경 실패 mins", e)
            res.json(rtnUtil.successFalse("500", "", ""));
        }
    });
}

exports.viewAdminIns = async (req, res, next) => {
    let {
        memId,
        memPass
    } = req.body;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.memId = memId;
    obj.memNm = req.user.companyName;
    obj.memHp = '';
    obj.memEmail = '';
    obj.nation = '';
    obj.bankInfo = '';
    obj.bankAcc = '';
    obj.accNm = '';


    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            obj.mSeq = uuidv4();
            // let passInfo = await encryption.createPasswordHash(Buffer.from(memPass, "base64").toString('utf8'));
            let passInfo = await encryption.createPasswordHash(memPass);
            obj.memPass = passInfo.password;
            obj.salt = passInfo.salt;

            let tronInfo = await tron.newAddress();
            obj.coinTyp = 'CMDT00000000000018';
            obj.cmpnyAddr = tronInfo.address;
            obj.cmpnyPk = tronInfo.privateKey;

            await Query.QSetAdminMember(obj, conn);
            conn.commit();
            await Query.QSetWallet(obj, conn);
            conn.commit();
            await Query.QSetBank(obj, conn);
            conn.commit();

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000047';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '정상적으로 처리 되었습니다.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue("200", "", ""));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("admin 등록 mins", e)
            res.json(rtnUtil.successFalse("500", "", ""));
        }
    });
}
exports.getIpList = async (req, res, next) => {
    let {pageIndex} = req.body;

    let obj = {};

    obj.cmpnyCd = req.user.cmpnyCd;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;
            obj.pageIndex = pageIndex;
            let totalPageCount = await Query.QGetIpListTotal(obj, conn);
            console.log(totalPageCount)
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, 10)

            obj.pageIndex = parseInt(pageIndex);
            obj.rowsPerPage = pagination.rowsPerPage;
            let ipList = await Query.QGetIpList(obj, conn);
            res.json(rtnUtil.successTrue('200', "", {
                'ipList': ipList,
                'pagination': pagination,
                'pageIndex': pageIndex
            }));
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse('500', e.message, '', ''));
        }
    });
}

exports.deleteIp = async (req, res, next) => {
    let {seq} = req.body;

    let obj = {};
    obj.seq = seq;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            await Query.QDeleteIp(obj, conn);

            conn.commit();

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000049';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = 'admin 허용 ip 삭제 성공.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue("200", "", ""));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("ip 삭제 실패", e)
            res.json(rtnUtil.successFalse("500", "", ""));
        }
    });
}

exports.insertIp = async (req, res, next) => {
    let {admin_ip} = req.body;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.adminIp = admin_ip.trim();

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            await Query.QInsAdminIp(obj, conn);
            conn.commit();

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000049';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = 'admin 허용 ip 등록 성공.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue("200", "", ""));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("admin ip 등록 실패", e)
            res.json(rtnUtil.successFalse("500", "", ""));
        }
    });
}

exports.logView = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchText, pageIndex, rowsPerPage, srtDt, endDt, pay_code} = req.body;

    if (pageIndex == '' || pageIndex == null) {
        pageIndex = 1;
    }
    if (rowsPerPage == '' || rowsPerPage == null) {
        rowsPerPage = 10;
    }
    if (pay_code == '' || pay_code == null) {
        pay_code = '';
    }

    if (srtDt == undefined || srtDt == "" || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        // srtDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        srtDt = moment().format("YYYY/MM/DD")
        endDt = moment().format("YYYY/MM/DD")
    }
    let search = {};
    search.option = srchOption;
    if (srchOption == '') search.srchText = '';
    else {
        search.srchText = srchText;
        //pageIndex = 1;
    }
    search.srtDt = srtDt;
    search.endDt = endDt;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.srchOption = srchOption;
    obj.srchText = srchText;
    obj.srtDt = srtDt;
    obj.endDt = endDt;
    obj.pay_code = pay_code;

    // obj.mainAdmin = false;
    // obj.memId = "";
    // obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    // obj.srchOption = srchOption;
    // obj.srchText = srchText;
    // obj.isCoin = isCoin;


    mydb.executeTx(async (conn) => {
        try {
            let totalPageCount = await Query.QGetUserLogTotal(obj, conn);
            logUtil.logStr('회원관리 totalPageCount', totalPageCount);

            console.log(pageIndex, totalPageCount);
            let pagination = await pagingUtil.getDynamicPagination(
                pageIndex,
                totalPageCount,
                rowsPerPage
            );

            console.log('pagination.rowsPerPage : ' + pagination.rowsPerPage);

            obj.pageIndex = parseInt(pageIndex);
            obj.rowsPerPage = parseInt(rowsPerPage);
            let memList = await Query.QGetUserLog(obj, conn);
            console.log(pagination);
            let basicInfo = {};
            basicInfo.title = '유저 로그';
            basicInfo.menu = 'MENU00000000000004';
            basicInfo.rtnUrl = 'userLog/index';
            basicInfo.memList = memList;
            basicInfo.search = search;
            basicInfo.pagination = pagination;
            basicInfo.pay_code = pay_code;
            console.log(
                'basicInfo.pagination.rowsPerPage : ' + basicInfo.pagination.rowsPerPage
            );

            req.basicInfo = basicInfo;

            //console.log(basicInfo);

            next();
        } catch (e) {
            logUtil.errObj('lecture.controller view', e);
            next(e);
        }
    });
};


exports.userLogExcel = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchText, pay_code, srtDt, endDt} = req.body;

    if (srtDt == undefined || srtDt == "" || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        // srtDt = moment().add(7, 'hours').format("YYYY/MM/DD")
        srtDt = moment().format("YYYY/MM/DD")
        endDt = moment().format("YYYY/MM/DD")
    }
    if (pay_code == '' || pay_code == null) {
        pay_code = '';
    }
    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.srchOption = srchOption;
    obj.srchText = srchText;
    obj.pageIndex = 1;
    obj.rowsPerPage = 999999;
    obj.pay_code = pay_code;
    obj.srtDt = srtDt;
    obj.endDt = endDt;
    mydb.execute(async conn => {
        try {

            let memList = await Query.QGetUserLog(obj, conn);

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

            res.json(rtnUtil.successTrue('200', "", {'memList': memList}));

        } catch (e) {
            res.json(rtnUtil.successFalse('500', e.message, '', ''));
        }
    });


}


exports.getUserIpList = async (req, res, next) => {
    let {pageIndex} = req.body;

    let obj = {};

    obj.cmpnyCd = req.user.cmpnyCd;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;
            obj.pageIndex = pageIndex;
            let totalPageCount = await Query.QGetUserIpListTotal(obj, conn);
            console.log(totalPageCount)
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, 10)

            obj.pageIndex = parseInt(pageIndex);
            obj.rowsPerPage = pagination.rowsPerPage;
            let ipList = await Query.QGetUserIpList(obj, conn);
            res.json(rtnUtil.successTrue('200', "", {
                'ipList': ipList,
                'pagination': pagination,
                'pageIndex': pageIndex
            }));
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse('500', e.message, '', ''));
        }
    });
}

exports.deleteUserIp = async (req, res, next) => {
    let {seq} = req.body;

    let obj = {};
    obj.seq = seq;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            await Query.QDeleteUserIp(obj, conn);

            conn.commit();

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000052';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '고객 차단 ip 삭제 성공';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue("200", "", ""));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("user ip 삭제 실패", e)
            res.json(rtnUtil.successFalse("500", "", ""));
        }
    });
}

exports.insertUserIp = async (req, res, next) => {
    let {user_ip} = req.body;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.userIp = user_ip.trim();

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            await Query.QInsUserIp(obj, conn);
            conn.commit();

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000052';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '고객 차단 ip 등록 성공';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue("200", "", ""));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("user ip 등록 실패", e)
            res.json(rtnUtil.successFalse("500", "", ""));
        }
    });
}


exports.getUserAccList = async (req, res, next) => {
    let {pageIndex, userAcc} = req.body;

    let obj = {};
    obj.userAcc = userAcc;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;
            obj.pageIndex = pageIndex;
            let totalPageCount = await Query.QGetAccListTotal(obj, conn);
            console.log(totalPageCount)
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, 10)

            obj.pageIndex = parseInt(pageIndex);
            obj.rowsPerPage = pagination.rowsPerPage;
            console.log(JSON.stringify(obj))
            let accList = await Query.QGetAccList(obj, conn);
            res.json(rtnUtil.successTrue('200', "", {
                'accList': accList,
                'pagination': pagination,
                'pageIndex': pageIndex
            }));
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse('500', e.message, '', ''));
        }
    });
}


exports.setAccBlock = async (req, res, next) => {
    let {user_acc, mem_status} = req.body;

    let obj = {};
    obj.userAcc = user_acc;
    obj.memStatus = mem_status;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            await Query.QSetAccBlock(obj, conn);
            conn.commit();

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000060';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '사용자 계좌 일괄 차단';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue("200", "", ""));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("사용자 계좌 일괄 차단 실패", e)
            res.json(rtnUtil.successFalse("500", "", ""));
        }
    });
}


exports.getSellerList = async (req, res, next) => {
    let {pageIndex} = req.body;

    let obj = {};

    obj.cmpnyCd = req.user.cmpnyCd;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;
            obj.pageIndex = pageIndex;
            let totalPageCount = await Query.QGetSellerListTotal(obj, conn);
            console.log(totalPageCount)
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, 10)

            obj.pageIndex = parseInt(pageIndex);
            obj.rowsPerPage = pagination.rowsPerPage;
            let sellerList = await Query.QGetSellerList(obj, conn);
            res.json(rtnUtil.successTrue('200', "", {
                'sellerList': sellerList,
                'pagination': pagination,
                'pageIndex': pageIndex
            }));
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse('500', e.message, '', ''));
        }
    });
}


exports.getSellerBalance = async (req, res, next) => {
    let {ethAddr} = req.body;

    let sellerBalance = await bkUtil.getBalance(ethAddr);

    res.json(rtnUtil.successTrue('200', "", {'sellerBalance': sellerBalance}));
}


exports.sellerCoinSend = async (req, res, next) => {
    let {toAddress, balance} = req.body;

    let sellerBalance = await bkUtil.sellerSendToken(toAddress, balance);
    console.log('sellerCoinSend :', {toAddress, balance});

    res.json(rtnUtil.successTrue('200', "", {'sellerBalance': sellerBalance}));
}

exports.nftBankCancel = async (req, res, next) => {
    let {mSeq} = req.body;

    let obj = {};
    obj.mSeq = mSeq;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            obj.bank_seq = '';
            await Query.QUptUserNftBank(obj, conn);

            conn.commit();
            res.json(rtnUtil.successTrue('200', ""));
        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse('500', e.message, '', ''));
        }
    });
}