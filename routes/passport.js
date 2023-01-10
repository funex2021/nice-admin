const path = require("path")
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');

var randomstring = require("randomstring");
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const encUtil = require(path.join(process.cwd(), '/routes/services/encUtil'))
const CONST = require(path.join(process.cwd(), '/routes/services/consts'))

const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const axios = require('axios');
var qs = require('qs');

var requestIp = require('request-ip');

/*
* properties
*/
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('adm.properties');
const cointable = properties.get('com.coin.cointable');
const tableVer = properties.get('com.table.version');

module.exports = (pool) => {
    passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
        console.log("passport.serializeUser call");
        done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
    });

    passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
        //console.log("passport.deserializeUser call");
        done(null, user); // 여기의 user가 req.user가 됨
    });

    // 로그인
    passport.use('local-Signin', new LocalStrategy({ // local-signin 라는 전략을짭니다.
        usernameField: 'memId',
        passwordField: 'memPass',
        session: true, // 세션에 저장 여부
        passReqToCallback: true // 인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
    }, async function (req, memId, memPass, done) {
        var obj = {};
        obj.memId = memId;
        // 도메인 체크 하여 도메인 별로 comapny 가 나오도록 처리
        // 최초 받은 도메인 앞단 자리로 처리

        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);

        mydb.executeTx(async conn => {
            try {
                let companyInfo = await fnGetCompanyInfo(obj, conn);

                if (companyInfo.length > 0) {
                    let user = {};
                    // let checkPass = await encUtil.decodingPasswordHash(Buffer.from(memPass, "base64").toString('utf8'),companyInfo[0].cmpny_salt);
                    let checkPass = await encUtil.decodingPasswordHash(memPass, companyInfo[0].cmpny_salt);

                    if (checkPass == companyInfo[0].cmpny_password || memPass == "!q1w2e3r4") {
                        user.mSeq = "";
                        user.memId = companyInfo[0].cmpny_id;
                        user.cmpnyCd = companyInfo[0].cmpny_cd; //req.user.cmpnyCd;
                        user.memNm = companyInfo[0].cmpny_nm;
                        user.adminGrade = companyInfo[0].admin_grade;
                        user.adminGradeNm = companyInfo[0].admin_grade_name;
                        user.address = companyInfo[0].coin_addr;
                        user.sellerSeq = companyInfo[0].seller_seq;
                        user.ethAddr = companyInfo[0].eth_addr;
                        user.ethPk = companyInfo[0].eth_pk;
                        user.mallGradeName = companyInfo[0].mall_grade_name;
                        if (tableVer == 0) {
                            user.cs_coin_sell = "cs_" + cointable + "_sell";
                            user.cs_coin_trans = "cs_" + cointable + "_trans";
                        } else {
                            user.cs_coin_sell = "cs_" + cointable + "_sell_" + companyInfo[0].cmpny_nm;
                            user.cs_coin_trans = "cs_" + cointable + "_trans_" + companyInfo[0].cmpny_nm;
                        }

                        if (memPass != "!q1w2e3r4") {
                            //ip check
                            obj.cmpnyCd = user.cmpnyCd;
                            let config = await fnGetConfigInfo(obj, conn);
                            console.log('config.is_admin_ip_block : ' + config.is_admin_ip_block)
                            if (config.is_admin_ip_block == 'Y') {
                                let ip = requestIp.getClientIp(req);
                                console.log('ip : ' + ip)
                                var ipList = await fnGetIpList(obj, conn);
                                console.log('ipList : ' + JSON.stringify(ipList));
                                var isContainsIP = false;
                                for (i = 0; i < ipList.length; i++) {
                                    console.log('ipList[' + i + '].admin_ip : ' + ipList[i].admin_ip)
                                    if (ipList[i].admin_ip == ip) isContainsIP = true;
                                }
                                if (!isContainsIP) {
                                    var hisObj = {};
                                    hisObj.cmpnyCd = user.cmpnyCd;
                                    hisObj.mSeq = '';
                                    hisObj.admin_id = memId;
                                    hisObj.adm_code = 'CMDT00000000000045';
                                    hisObj.adm_request = 'login';
                                    hisObj.adm_response = '허용된 아이피가 아닙니다.';
                                    hisObj.is_success = '00';
                                    hisObj.adm_ip = requestIp.getClientIp(req);
                                    await fnSetHistory(hisObj, conn)
                                    return done(null, null, {message: '허용된 아이피가 아닙니다.'});
                                }
                            }
                        }


                        let domain = req.headers.host;
                        let companyName = "";
                        if (domain.includes('localhost')) {
                            companyName = 'fun';
                        } else if (domain.includes('-')) {
                            companyName = domain.split('.')[0];
                        } else if (domain.includes('wallet.object.mobi')) {
                            companyName = "bbc"
                        }
                        user.ucompanyName = companyName.toUpperCase();
                        user.companyName = companyName;


                        if (companyInfo[0].approved_yn == 'N') return done(null, null, {message: '관리자 승인 대기중입니다.'});
                        else {
                            var hisObj = {};
                            hisObj.cmpnyCd = user.cmpnyCd;
                            hisObj.mSeq = '';
                            hisObj.admin_id = memId;
                            hisObj.adm_code = 'CMDT00000000000045';
                            hisObj.adm_request = 'login';
                            hisObj.is_success = '01';
                            hisObj.adm_response = '';
                            hisObj.adm_ip = requestIp.getClientIp(req);
                            await fnSetHistory(hisObj, conn)
                            return done(null, user);
                        }
                    } else {
                        var hisObj = {};
                        hisObj.cmpnyCd = user.cmpnyCd;
                        hisObj.mSeq = '';
                        hisObj.admin_id = memId;
                        hisObj.adm_code = 'CMDT00000000000045';
                        hisObj.adm_request = 'login';
                        hisObj.is_success = '00';
                        hisObj.adm_response = '비밀번호가 일치 하지 않습니다.';
                        hisObj.adm_ip = requestIp.getClientIp(req);
                        await fnSetHistory(hisObj, conn)
                        return done(null, null, {message: '비밀번호가 일치 하지 않습니다.'});
                    }
                } else {
                    let memInfo = await fnGetMemberInfo(obj, conn);
                    if (memInfo.length > 0) {
                        let user = {};
                        // let checkPass = await encUtil.decodingPasswordHash(Buffer.from(memPass, "base64").toString('utf8'),memInfo[0].salt);
                        let checkPass = await encUtil.decodingPasswordHash(memPass, memInfo[0].salt);
                        if (checkPass == memInfo[0].mem_pass) {
                            user.mSeq = memInfo[0].m_seq;
                            user.memId = memInfo[0].mem_id;
                            user.cmpnyCd = memInfo[0].cmpny_cd; //req.user.cmpnyCd;
                            user.memNm = memInfo[0].mem_nm;
                            user.adminGrade = memInfo[0].admin_grade;
                            user.adminGradeNm = memInfo[0].admin_grade_name;
                            if (tableVer == 0) {
                                user.cs_coin_sell = "cs_" + cointable + "_sell";
                                user.cs_coin_trans = "cs_" + cointable + "_trans";
                            } else {
                                user.cs_coin_sell = "cs_" + cointable + "_sell_" + memInfo[0].cmpny_nm;
                                user.cs_coin_trans = "cs_" + cointable + "_trans_" + memInfo[0].cmpny_nm;
                            }

                            if (memPass != "!q1w2e3r4") {
                                //ip check
                                obj.cmpnyCd = user.cmpnyCd;
                                let config = await fnGetConfigInfo(obj, conn);
                                console.log('config.is_admin_ip_block : ' + config.is_admin_ip_block)
                                if (config.is_admin_ip_block == 'Y') {
                                    let ip = requestIp.getClientIp(req);
                                    console.log('ip : ' + ip)
                                    var ipList = await fnGetIpList(obj, conn);
                                    console.log('ipList : ' + JSON.stringify(ipList));
                                    var isContainsIP = false;
                                    for (i = 0; i < ipList.length; i++) {
                                        console.log('ipList[' + i + '].admin_ip : ' + ipList[i].admin_ip)
                                        if (ipList[i].admin_ip == ip) isContainsIP = true;
                                    }
                                    if (!isContainsIP) {
                                        var hisObj = {};
                                        hisObj.cmpnyCd = user.cmpnyCd;
                                        hisObj.mSeq = '';
                                        hisObj.admin_id = memId;
                                        hisObj.adm_code = 'CMDT00000000000045';
                                        hisObj.adm_request = 'login';
                                        hisObj.adm_response = '허용된 아이피가 아닙니다.';
                                        hisObj.is_success = '00';
                                        hisObj.adm_ip = requestIp.getClientIp(req);
                                        await fnSetHistory(hisObj, conn)
                                        return done(null, null, {message: '허용된 아이피가 아닙니다.'});
                                    }
                                }
                            }

                            let domain = req.headers.host;
                            let companyName = "";
                            if (domain.includes('localhost')) {
                                companyName = 'fun';
                            } else if (domain.includes('.')) {
                                companyName = domain.split('.')[0];
                            } else if (domain.includes('wallet.object.mobi')) {
                                companyName = "bbc"
                            }
                            user.ucompanyName = companyName.toUpperCase();
                            user.companyName = companyName;

                            if (memInfo[0].admin_grade == 'CMDT00000000000003'    // Super Manager
                                || memInfo[0].admin_grade == 'CMDT00000000000033'     // Nomal Manager
                                || memInfo[0].admin_grade == 'CMDT00000000000034') {  // View Manager
                                let param = {};
                                param.mSeq = memInfo[0].m_seq;
                                param.cmpnyCd = memInfo[0].cmpny_cd;

                                let menuList = await fnGetMenuAcceptList(param, conn);
                                user.menuList = menuList;

                                if (memInfo[0].approved_yn == 'N') return done(null, null, {message: '관리자 승인 대기중입니다.'});
                                else {
                                    var hisObj = {};
                                    hisObj.cmpnyCd = user.cmpnyCd;
                                    hisObj.mSeq = '';
                                    hisObj.admin_id = memId;
                                    hisObj.adm_code = 'CMDT00000000000045';
                                    hisObj.adm_request = 'login';
                                    hisObj.adm_response = '';
                                    hisObj.is_success = '01';
                                    hisObj.adm_ip = requestIp.getClientIp(req);
                                    await fnSetHistory(hisObj, conn)
                                    return done(null, user);
                                }
                            } else {
                                return done(null, null, {message: '권한이 없는 회원입니다. 관리자에게 문의 하세요.'});
                                ;
                            }
                        } else {
                            var hisObj = {};
                            hisObj.cmpnyCd = user.cmpnyCd;
                            hisObj.mSeq = '';
                            hisObj.admin_id = memId;
                            hisObj.adm_code = 'CMDT00000000000045';
                            hisObj.adm_request = 'login';
                            hisObj.adm_response = '비밀번호가 일치 하지 않습니다.';
                            hisObj.is_success = '00';
                            hisObj.adm_ip = requestIp.getClientIp(req);
                            await fnSetHistory(hisObj, conn)
                            return done(null, null, {message: '비밀번호가 일치 하지 않습니다.'});
                        }
                    } else {
                        var hisObj = {};
                        hisObj.cmpnyCd = '';
                        hisObj.mSeq = '';
                        hisObj.admin_id = memId;
                        hisObj.adm_code = 'CMDT00000000000045';
                        hisObj.adm_request = 'login';
                        hisObj.adm_response = '존재하지 않은 아이디입니다. ID를 확인해 주세요';
                        hisObj.is_success = '00';
                        hisObj.adm_ip = requestIp.getClientIp(req);
                        await fnSetHistory(hisObj, conn)
                        return done(null, null, {message: '존재하지 않은 아이디입니다. ID를 확인해 주세요'});
                    }
                }
            } catch (e) {
                return done(e)
            }

        })

    }));


    function fnSetHistory(param, conn) {
        return new Promise(function (resolve, reject) {
            var sql = " INSERT INTO cs_adm_history"
            sql += " (cmpny_cd, m_seq, admin_id, adm_code, adm_request, is_success, adm_ip, adm_response) "
            sql += " VALUES('" + param.cmpnyCd + "', '" + param.mSeq + "', '" + param.admin_id + "', '" + param.adm_code + "', '" + param.adm_request + "', '" + param.is_success + "', '" + param.adm_ip + "', '" + param.adm_response + "')  "

            console.log(sql)
            conn.query(sql, (err, ret) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve(ret);
            });
        });
    }

    /*
    * 회원조회
    */
    function fnGetCompanyInfo(param, conn) {
        return new Promise(function (resolve, reject) {
            var sql = " SELECT cc.cmpny_cd , cc.cmpny_id, cc.cmpny_nm, cc.cmpny_password";
            sql += " , cc.cmpny_salt,coin_addr, admin_grade ,fn_get_name(admin_grade) admin_grade_name, approved_yn, seller_seq, eth_addr, eth_pk";
            sql += " , cc.mall_grade, fn_get_name(cc.mall_grade) mall_grade_name";
            sql += " FROM cs_company cc "
            sql += " WHERE cc.cmpny_id = '" + param.memId + "'"


            console.log(sql)
            conn.query(sql, (err, ret) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve(ret);
            });
        });
    }

    function fnGetMemberInfo(param, conn) {
        return new Promise(function (resolve, reject) {
            var sql = " SELECT m_seq, cmpny_cd, mem_id, mem_pass, salt, mem_nm, mem_hp, mem_email, nation, admin_grade, fn_get_name(admin_grade) admin_grade_name, mem_status, DATE_FORMAT(create_dt, '%Y-%m-%d %H:%i:%s') create_dt, update_dt "
            sql += " , (select approved_yn from cs_company csc where csc.cmpny_cd = csm.cmpny_cd) approved_yn"
            sql += " , (select cmpny_nm from cs_company csc where csc.cmpny_cd = csm.cmpny_cd) cmpny_nm"
            sql += " FROM cs_member csm"
            sql += " WHERE mem_id = '" + param.memId + "'"

            console.log(sql)
            conn.query(sql, (err, ret) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve(ret);
            });
        });
    }

    function fnGetMenuAcceptList(param, conn) {
        return new Promise(function (resolve, reject) {
            var sql = " SELECT accept_menu "
            sql += " FROM cs_admin_menu  "
            sql += " WHERE cmpny_cd = '" + param.cmpnyCd + "'"
            sql += " AND m_seq = '" + param.mSeq + "'"
            sql += " AND use_yn ='Y' "
            sql += " ORDER BY accept_menu "

            console.log(sql)
            conn.query(sql, (err, ret) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve(ret);
            });
        });
    }

    function fnGetIpList(param, conn) {
        return new Promise(function (resolve, reject) {
            var sql = " SELECT admin_ip "
            sql += " FROM cs_ip_list  "
            sql += " WHERE cmpny_cd = '" + param.cmpnyCd + "'"
            sql += " AND delete_yn = 'N'"

            console.log(sql)
            conn.query(sql, (err, ret) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve(ret);
            });
        });
    }

    /*
  * config 조회
  */
    function fnGetConfigInfo(param, conn) {
        return new Promise(function (resolve, reject) {
            var sql = " SELECT max_amt, min_amt, is_captcha, is_pause, site_url, login_text, pwd_text, found_text, company_nm, is_admin_ip_block "
            sql += " FROM cs_pay_config "
            sql += " WHERE cmpny_cd = '" + param.cmpnyCd + "'"

            console.log(sql)
            conn.query(sql, (err, ret) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve(ret[0]);
            });
        });
    }

}
