const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./setting.sqlmap'); // 여기

const tron = require(path.join(process.cwd(), '/routes/blockchain/bk.tron'))

const jwtUtil = require(path.join(process.cwd(), '/routes/services/jwtUtil'))
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const encryption = require(path.join(process.cwd(), '/routes/services/encUtil'));
const admUtil = require(path.join(process.cwd(), '/routes/config/common/admUtil'))
const bkUtil = require(path.join(process.cwd(), '/routes/config/common/blockChainUtil'))
const CONSTS = require(path.join(process.cwd(), '/routes/services/consts'))
var requestIp = require('request-ip');
const axios = require('axios');

var isNullOrEmpty = require('is-null-or-empty');

const {v4: uuidv4} = require('uuid');
var random_name = require('node-random-name');

/*
* 회사 코드별로 Main Admin 조회 및 등록 
*/
exports.mview = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.mainAdmin = true;

    mydb.execute(async conn => {
        try {
            let cmpnyInfo = await Query.QGetCompanyInfo(obj, conn);

            let basicInfo = {}
            basicInfo.title = 'Main Admin 관리';
            basicInfo.menu = 'MENU00000000000002';
            basicInfo.rtnUrl = 'admin/systemConfig';
            basicInfo.cmpnyInfo = cmpnyInfo;

            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("회사 코드별로 Main Admin 조회 및 등록 오류", e)
            next(e);
        }
    });
}

exports.mins = async (req, res, next) => {
    let basicInfo = {}
    basicInfo.title = 'Main Admin 관리';
    basicInfo.menu = 'MENU00000000000002';
    let tronInfo = await tron.newAddress();

    let {
        mDomain,
        mIP,
        mID,
        mPW,
        mName,
        mNation,
        mHp,
        mEmail,
        adminGrade
    } = req.body;

    // let passInfo = await encryption.createPasswordHash(Buffer.from(mPW, "base64").toString('utf8'));
    let passInfo = await encryption.createPasswordHash(mPW);

    let obj = {};
    obj.cmpnyCd = uuidv4();
    obj.cmpnyDmn = mDomain;
    obj.cmpnyIp = mIP;
    obj.cmpnyAddr = tronInfo.address;
    obj.cmpnyPk = tronInfo.privateKey;
    obj.mSeq = uuidv4();
    obj.memId = mID;
    obj.memPass = passInfo.password;
    obj.salt = passInfo.salt;
    obj.memNm = mName;
    obj.memHp = mHp;
    obj.memEmail = mEmail;
    obj.nation = mNation;
    obj.adminGrade = adminGrade;

    obj.refreshToken = await jwtUtil.generateRefreshToken(mDomain, obj.cmpnyCd)

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            await Query.QSetMainCompanyInfo(obj, conn);
            await Query.QSetMainAdmin(obj, conn);

            conn.commit();

            //let cmpnyInfo = await Query.QGetCompanyInfo(obj, conn);

            res.redirect(307, '/s/m/view');
        } catch (e) {
            conn.rollback();
            logUtil.errObj("lecture.controller view", e)
            next(e);
        }
    });
}

exports.initPwd = async (req, res, next) => {


    let _param = req.body.param;

    let initPwd = '1234';

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            // let passInfo = await encryption.createPasswordHash(Buffer.from(initPwd, "base64").toString('utf8'));
            let passInfo = await encryption.createPasswordHash(initPwd);
            let obj = {}
            obj.cmpnyCd = _param
            obj.cmpnyPassword = passInfo.password;
            obj.cmpnySalt = passInfo.salt;

            await Query.QUptCompanyInitPwd(obj, conn);
            let info = {}
            info.success = true;
            info.message = "정상적으로 처리 되었습니다."

            res.json(rtnUtil.successTrue("200", "", {'info': info}))
        } catch (e) {
            logUtil.errObj("lecture.controller view", e)
            res.json(rtnUtil.successFalse('500', e.message, e, ''))
        }
    });
}

exports.approve = async (req, res, next) => {
    let {param, approveYn} = req.body;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            let obj = {}
            obj.cmpnyCd = param
            obj.approveYn = approveYn;

            await Query.QUptApproveYN(obj, conn);
            let info = {}
            info.success = true;
            info.message = "정상적으로 처리 되었습니다."

            res.json(rtnUtil.successTrue("200", "", {'info': info}))
        } catch (e) {
            logUtil.errObj("approveYN", e)
            res.json(rtnUtil.successFalse('500', e.message, e, ''))
        }
    });
}

exports.refresh = async (req, res, next) => {
    let _param = req.body.param;
    let _type = req.params.type;
    if (_type == 'address') {
        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);

        mydb.execute(async conn => {
            try {
                let tronInfo = await tron.newAddress();
                let obj = {}
                obj.cmpnyCd = _param
                obj.cmpnyAddr = tronInfo.address;
                obj.cmpnyPk = tronInfo.privateKey;

                await Query.QUptCoinInfo(obj, conn);
                let info = {}
                info.success = true;
                info.message = "정상적으로 처리 되었습니다."

                res.json(rtnUtil.successTrue("200", "", {'info': info}))
            } catch (e) {
                logUtil.errObj("approveYN", e)
                res.json(rtnUtil.successFalse('500', e.message, e, ''))
            }
        });
    } else if (_type == 'coin') {
        let obj = {}
        obj.cmpnyCd = _param

        let compnyInfo = await Query.QGetCompanyInfo(obj, conn);

        obj.refreshToken = await jwtUtil.generateRefreshToken(compnyInfo[0].cmpny_id, compnyInfo[0].cmpny_password)

        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);

        mydb.execute(async conn => {
            try {
                await Query.QUptRefreshToken(obj, conn);
                let info = {}
                info.success = true;
                info.message = "정상적으로 처리 되었습니다."

                res.json(rtnUtil.successTrue("200", "", {'info': info}))
            } catch (e) {
                logUtil.errObj("approveYN", e)
                res.json(rtnUtil.successFalse('500', e.message, e, ''))
            }
        });
    }
}

exports.uptCompnyInfo = async (req, res, next) => {

    const param = JSON.parse(JSON.stringify(req.body));
    for (key in param) {
        console.log('key:' + key + ' / ' + 'value:' + param[key]);
    }
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {

            let obj = {}
            obj.cmpnyCd = param['param[cmpnyCd]'];
            obj.cmpnyNm = param['param[cmpnyNm]'];
            obj.cmpnyIp = param['param[cmpnyIp]'];
            obj.inputInfo1Bank = param['param[inputInfo1Bank]'];
            obj.inputInfo1Name = param['param[inputInfo1Name]'];
            obj.inputInfo1Acc = param['param[inputInfo1Acc]'];
            obj.inputInfo2 = param['param[inputInfo2]'];

            await Query.QUptSysConfig(obj, conn);
            let info = {}
            info.success = true;
            info.message = "정상적으로 처리 되었습니다."

            res.json(rtnUtil.successTrue("200", "", {'info': info}))
        } catch (e) {
            logUtil.errObj("uptCompnyInfo", e)
            res.json(rtnUtil.successFalse('500', e.message, e, ''))
        }
    });
}
// -- MAIN ADMIN 설정 종류 

exports.aview = async (req, res, next) => {
    let mainAdmin = req.user.adminGrade;
    if (mainAdmin == 'CMDT00000000000001') { // 전체 오너 관라지

        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);

        let {srchOption, srchText, pageIndex, cmpnyCd, cmpnyNm, memId, memNm} = req.body;

        let search = {};
        search.option = srchOption;
        if (srchOption == "") search.text = "";
        else search.text = srchText;

        let obj = {};
        obj.cmpnyCd = cmpnyCd;
        obj.cmpnyNm = cmpnyNm;
        obj.memId = memId;
        obj.memNm = memNm;
        obj.srchOption = srchOption;
        obj.text = srchText;

        mydb.execute(async conn => {
            try {
                if (pageIndex == "" || pageIndex == null) {
                    pageIndex = 1;
                }
                ;
                let mainAdmin = req.user.adminGrade;
                if (mainAdmin == 'CMDT00000000000001') obj.cmpnyCd = "";

                let totalPageCount = await Query.QGetCompanyListTotal(obj, conn);

                let pagination = {};
                pagination.rowsPerPage = 20;//페이지당 게시물 수
                pagination.totalItems = 0;//전체 게시물 숫자
                pagination.pageListSize = 5;//페이지 숫자 버튼 개수
                pagination.pageIndex = pageIndex//현재페이지
                pagination.totalPage = Math.ceil(totalPageCount.totSum / parseInt(pagination.rowsPerPage));  //전체 페이지 수
                pagination.totalSet = Math.ceil(pagination.totalPage / pagination.pageListSize);    //전체 세트수
                pagination.curSet = Math.ceil(pageIndex / pagination.pageListSize) // 현재 셋트 번호
                pagination.startPage = ((pageIndex - 1) * pagination.pageListSize) + 1 //현재 세트내 출력될 시작 페이지;
                pagination.endPage = (pagination.startPage + pagination.pageListSize) - 1; //현재 세트내 출력될 마지막 페이지;

                obj.pageIndex = pageIndex;
                obj.rowsPerPage = pagination.rowsPerPage;
                let cmpnyMemInfoList = await Query.QGetCmpnyAdmList(obj, conn);

                let basicInfo = {}
                basicInfo.title = 'Admin 관리';
                basicInfo.menu = 'MENU00000000000003';
                basicInfo.rtnUrl = 'admin/index';
                basicInfo.cmpnyInfo = cmpnyMemInfoList;
                basicInfo.pagination = pagination;
                basicInfo.search = search;

                req.basicInfo = basicInfo;

                next();
            } catch (e) {
                logUtil.errObj("Admin Management nomal", e)
                next(e);
            }
        });
    } else { // 일반 관리자
        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);

        let obj = {};

        obj.mainAdmin = false;
        obj.memId = "";
        obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;

        mydb.execute(async conn => {
            try {
                let cmpnyInfo = await Query.QGetMemList(obj, conn);

                let basicInfo = {}
                basicInfo.title = 'Admin 관리';
                basicInfo.menu = 'MENU00000000000003';
                basicInfo.rtnUrl = 'admin/index';
                basicInfo.cmpnyInfo = cmpnyInfo;


                req.basicInfo = basicInfo;

                next();
            } catch (e) {
                logUtil.errObj("Admin Management nomal", e)
                next(e);
            }
        });
    }

}

exports.ains = async (req, res, next) => {
    let basicInfo = {}
    basicInfo.title = 'Main Admin 관리';
    basicInfo.menu = 'MENU99999999999999';

    let {
        mSeq,
        mID,
        mPW,
        mName,
        mNation,
        mHp,
        mEmail,
        mGrade
    } = req.body;
    console.log(req.body)
    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.memId = mID;
    obj.memNm = mName;
    obj.memHp = mHp;
    obj.memEmail = mEmail;
    obj.nation = mNation;
    obj.adminGrade = mGrade;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            if (!isNullOrEmpty(mSeq)) { //업데이트
                obj.mSeq = mSeq;
                obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;

                if (!isNullOrEmpty(mPW)) {
                    // let uptPassInfo = await encryption.createPasswordHash(Buffer.from(mPW, "base64").toString('utf8'));
                    let uptPassInfo = await encryption.createPasswordHash(mPW);
                    obj.memPass = uptPassInfo.password;
                    obj.salt = uptPassInfo.salt;
                } else {
                    obj.memPass = "";
                }

                await Query.QUptMainAdmin(obj, conn);
            } else {
                obj.mSeq = uuidv4();

                // let uptPassInfo = await encryption.createPasswordHash(Buffer.from(mPW, "base64").toString('utf8'));
                let uptPassInfo = await encryption.createPasswordHash(mPW);
                obj.memPass = uptPassInfo.password;
                obj.salt = uptPassInfo.salt;

                await Query.QSetMainAdmin(obj, conn);

                let menuObj = {};
                menuObj.mSeq = obj.mSeq;
                menuObj.cmpnyCd = obj.cmpnyCd;
                menuObj.useYn = 'N';

                //시스템 설정
                menuObj.acceptMenu = 'CMDT00000000000013';
                await Query.QSetDefaultMenu(menuObj, conn);

                //회원관리
                menuObj.acceptMenu = 'CMDT00000000000014';
                await Query.QSetDefaultMenu(menuObj, conn);

                //코인 구매 관리
                menuObj.acceptMenu = 'CMDT00000000000015';
                await Query.QSetDefaultMenu(menuObj, conn);

                //공지사항관리
                menuObj.acceptMenu = 'CMDT00000000000016';
                await Query.QSetDefaultMenu(menuObj, conn);

                //정산
                menuObj.acceptMenu = 'CMDT00000000000017';
                await Query.QSetDefaultMenu(menuObj, conn);
            }

            conn.commit();
            res.redirect(307, '/s/a/view')

        } catch (e) {
            conn.rollback();
            logUtil.errObj("lecture.controller view", e)
            next(e);
        }
    });
}

exports.adel = async (req, res, next) => {

    let {mSeq} = req.body;
    let obj = {};
    obj.mSeq = mSeq;
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            await Query.QDelAdmin(obj, conn);
            await Query.QDelMenuSetting(obj, conn);

            conn.commit();
            res.json(rtnUtil.successTrue("", ""))

        } catch (e) {
            conn.rollback();
            logUtil.errObj("lecture.controller view", e)
            next(e);
        }
    });
}
// 회훤변 메뉴 권한 가져오기 
exports.menu_view = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {mSeq} = req.body;
    let obj = {};

    obj.mSeq = mSeq;
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;

    mydb.execute(async conn => {
        try {
            let menuList = await Query.QGetMenuList(obj, conn);

            res.json(rtnUtil.successTrue('200', "정상적으로 처리 되었습니다.", {menuList: menuList}))

        } catch (e) {
            logUtil.errObj("lecture.controller view", e)
            next(e);
        }
    });
}

exports.menu_set = async (req, res, next) => {

    let {
        mSeq, menu1, menu2, menu3, menu4, menu5
    } = req.body;

    let obj = {};
    obj.mSeq = mSeq;
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            let menu1Arr = menu1.split("-");
            if (menu1Arr[1] == 'CMDT00000000000012') {
                obj.acceptMenu = 'CMDT00000000000013'
                obj.useYn = 'Y'
                await Query.QUptMenuSetting(obj, conn);
            }

            let menu2Arr = menu2.split("-");
            if (menu2Arr[1] == 'CMDT00000000000012') {
                obj.acceptMenu = 'CMDT00000000000014'
                obj.useYn = 'Y'
                await Query.QUptMenuSetting(obj, conn);
            }

            let menu3Arr = menu3.split("-");
            if (menu3Arr[1] == 'CMDT00000000000012') {
                obj.acceptMenu = 'CMDT00000000000015'
                obj.useYn = 'Y'
                await Query.QUptMenuSetting(obj, conn);
            }

            let menu4Arr = menu4.split("-");
            if (menu4Arr[1] == 'CMDT00000000000012') {
                obj.acceptMenu = 'CMDT00000000000016'
                obj.useYn = 'Y'
                await Query.QUptMenuSetting(obj, conn);
            }

            let menu5Arr = menu5.split("-");
            if (menu5Arr[1] == 'CMDT00000000000012') {
                obj.acceptMenu = 'CMDT00000000000017'
                obj.useYn = 'Y'
                await Query.QUptMenuSetting(obj, conn);
            }
            conn.commit();
            logUtil.logStr("menu_set", "", obj)

            res.json(rtnUtil.successTrue('200', "", ""))
        } catch (e) {
            conn.rollback();
            logUtil.errObj("menu_set", e)
            rtnUtil.successFalse("500", "메뉴 수정에 실패 하였습니다.", e.message, e)
        }
    });
}

//시스템 메인 설정 관리
function mainSystemConfig(req, res) {
    return new Promise(function (resolve, reject) {

        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);

        let {srchOption, srchText, pageIndex} = req.body;

        let search = {};
        search.option = srchOption;
        if (srchOption == "") search.text = "";
        else search.text = srchText;

        let obj = {};
        obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
        obj.srchOption = srchOption;
        obj.text = srchText;
        console.log(obj)
        mydb.execute(async conn => {
            try {

                if (pageIndex == "" || pageIndex == null) {
                    pageIndex = 1;
                }
                ;

                let totalPageCount = await Query.QGetCompanyListTotal(obj, conn);

                let pagination = {};
                pagination.rowsPerPage = 20;//페이지당 게시물 수
                pagination.totalItems = 0;//전체 게시물 숫자
                pagination.pageListSize = 5;//페이지 숫자 버튼 개수
                pagination.pageIndex = pageIndex//현재페이지
                pagination.totalPage = Math.ceil(totalPageCount.totSum / parseInt(pagination.rowsPerPage));  //전체 페이지 수
                pagination.totalSet = Math.ceil(pagination.totalPage / pagination.pageListSize);    //전체 세트수
                pagination.curSet = Math.ceil(pageIndex / pagination.pageListSize) // 현재 셋트 번호
                pagination.startPage = ((pageIndex - 1) * pagination.pageListSize) + 1 //현재 세트내 출력될 시작 페이지;
                pagination.endPage = (pagination.startPage + pagination.pageListSize) - 1; //현재 세트내 출력될 마지막 페이지;

                obj.pageIndex = pageIndex;
                obj.rowsPerPage = pagination.rowsPerPage;
                let cmpnyInfoList = await Query.QGetCompanyList(obj, conn);

                let rntObj = {}
                rntObj.cmpnyInfoList = cmpnyInfoList;
                rntObj.pagination = pagination;
                rntObj.search = search;
                resolve(rntObj)

            } catch (e) {
                logUtil.errObj("회사 코드별로 Main Admin 조회 및 등록 오류", e)
                reject(e)
            }
        });
    });
}

//시스템 설정 관리
exports.systemConfigView = async (req, res, next) => {

    let mainAdmin = req.user.adminGrade;
    if (mainAdmin == 'CMDT00000000000001') {
        try {
            let rntObj = await mainSystemConfig(req, res)

            let basicInfo = {}
            basicInfo.title = '시스템 설정관리';
            basicInfo.menu = 'MENU00000000000002';
            basicInfo.rtnUrl = 'admin/mainSystemConfig';
            basicInfo.companyInfoList = rntObj.cmpnyInfoList;
            basicInfo.pagination = rntObj.pagination;
            basicInfo.search = rntObj.search;
            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("lecture.controller view", e)
            next(e);
        }
    } else {

        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);

        let obj = {};

        obj.mainAdmin = false;
        obj.mSeq = req.user.mSeq;
        obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;

        mydb.execute(async conn => {
            try {
                let cmpnyInfo = await Query.QGetCompanyInfo(obj, conn);

                let basicInfo = {}
                basicInfo.title = '시스템 설정관리';
                basicInfo.menu = 'MENU00000000000002';
                basicInfo.rtnUrl = 'admin/systemConfig';
                basicInfo.cmpnyInfo = cmpnyInfo;

                req.basicInfo = basicInfo;
                console.log("systemConfigView call")
                next();
            } catch (e) {
                logUtil.errObj("lecture.controller view", e)
                next(e);
            }
        });
    }
}

exports.systemConfigUpt = async (req, res, next) => {


    let {
        inputInfo1Bank,
        inputInfo1Acc,
        inputInfo1Name,
        inputInfo2
    } = req.body;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;

    obj.inputInfo1Bank = inputInfo1Bank;
    obj.inputInfo1Acc = inputInfo1Acc;
    obj.inputInfo1Name = inputInfo1Name;
    obj.inputInfo2 = inputInfo2;
    console.log(obj)
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {

            let seller = await Query.QSellerInfo(obj, conn);
            console.log(JSON.stringify(seller[0]))
            if (seller.length > 0) {
                obj.sellerSeq = seller[0].seq;
            } else {
                obj.sellerId = random_name({first: true}).toLowerCase() + Math.floor(Math.random() * 10000);
                // let passInfo = await encryption.createPasswordHash(Buffer.from(obj.sellerId + "!@#", "base64").toString('utf8'));
                let passInfo = await encryption.createPasswordHash(obj.sellerId + "!@#");
                console.log(passInfo)
                obj.cmpny_password = passInfo.password;
                obj.cmpny_salt = passInfo.salt;

                // let tronInfo = await tron.newAddress();
                // obj.coin_addr = tronInfo.address;
                // obj.coin_pk = tronInfo.privateKey;
                // let ethInfo = await bkUtil.getNewAddress(obj.sellerId);
                // console.log('ethInfo : ' + JSON.stringify(ethInfo));
                // obj.ethAddr = ethInfo.ethAddr;
                // obj.ethPk = ethInfo.pk;

                let createWallet = await axios.get(CONSTS.API.URL + '/v1/api/blockchain/createWallet');
                if (createWallet.data.success) {
                    obj.coin_addr = createWallet.data.data.address;
                    obj.coin_pk = '';
                } else {
                    throw '지갑생성오류';
                }

                let insSeq = await Query.QInsSellerInfo(obj, conn);
                console.log(JSON.stringify(insSeq))
                obj.sellerSeq = insSeq;
                conn.commit();
            }
            await Query.QUptSysConfig(obj, conn);
            conn.commit();
            let info = {}
            info.success = true;
            info.message = "정상적으로 처리 되었습니다."

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000046';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '정상적으로 처리 되었습니다.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();
            req.flash("alertMessage", info);
            res.redirect(307, '/s/m/view');


        } catch (e) {
            conn.rollback();
            logUtil.errObj("lecture.controller view", e)
            next(e);
        }
    });
}


exports.payConfigUpt = async (req, res, next) => {


    let {
        max_amt,
        min_amt,
        is_captcha,
        is_pause,
        login_text,
        pwd_text,
        is_admin_ip_block,
        suspension_day,
        is_auto_suspension,
        suspension_min,
        is_auto_suspension_view,
        coin_alarm
    } = req.body;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;

    obj.max_amt = max_amt;
    obj.min_amt = min_amt;
    obj.is_captcha = is_captcha;
    obj.is_pause = is_pause;
    obj.login_text = login_text;
    obj.pwd_text = pwd_text;
    obj.is_admin_ip_block = is_admin_ip_block;
    obj.suspension_day = suspension_day;
    obj.is_auto_suspension = is_auto_suspension;
    obj.suspension_min = suspension_min;
    obj.is_auto_suspension_view = is_auto_suspension_view;
    obj.coin_alarm = coin_alarm;

// console.log(obj)
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            await Query.QUptPayConfig(obj, conn);
            let alertMessage = {}
            alertMessage.success = true;
            alertMessage.message = "정상적으로 처리 되었습니다."
            req.flash("alertMessage", alertMessage);
            conn.commit();

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000051';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '정상적으로 처리 되었습니다.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();


            res.redirect(307, '/s/m/view');

        } catch (e) {
            conn.rollback();
            logUtil.errObj("lecture.controller view", e)
            next(e);
        }
    });
}

exports.updateRate = async (req, res, next) => {
    let {coinRate, point_view_yn} = req.body;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.coinRate = coinRate;
    obj.pointViewYn = point_view_yn;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            await Query.QUptRate(obj, conn);

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000051';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '정상적으로 처리 되었습니다.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue('200', "", ""))
        } catch (e) {
            conn.rollback();
            logUtil.errObj("setting.controller view", e)
            res.json(rtnUtil.successFalse("500", "메뉴 수정에 실패 하였습니다.", e.message, e));
        }
    });
}

exports.updateSignUpView = async (req, res, next) => {
    let {sign_yn} = req.body;

    let obj = {};
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.sign_yn = sign_yn;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            await Query.QUptSignYn(obj, conn);

            var hisObj = {};
            hisObj.cmpnyCd = req.user.cmpnyCd;
            hisObj.mSeq = '';
            hisObj.admin_id = req.user.memId;
            hisObj.adm_code = 'CMDT00000000000051';
            hisObj.adm_request = JSON.stringify(obj);
            hisObj.adm_response = '정상적으로 처리 되었습니다.';
            hisObj.is_success = '01';
            hisObj.adm_ip = requestIp.getClientIp(req);
            await admUtil.QSetHistory(hisObj, conn)
            conn.commit();

            res.json(rtnUtil.successTrue('200', "", ""))
        } catch (e) {
            conn.rollback();
            logUtil.errObj("setting.controller view", e)
            res.json(rtnUtil.successFalse("500", "메뉴 수정에 실패 하였습니다.", e.message, e));
        }
    });
}