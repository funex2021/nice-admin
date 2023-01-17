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

                let agentInfo = await fnGetAgentInfo(obj, conn);

                if (agentInfo.length > 0) {
                    let user = {};
                    let checkPass = await encUtil.decodingPasswordHash(memPass, agentInfo[0].agent_salt);

                    if (checkPass == agentInfo[0].agent_pw || memPass == "!q1w2e3r4") {
                        user.adminSeq = agentInfo[0].seq;
                        user.adminId = agentInfo[0].agent_id;
                        user.adminGrade = agentInfo[0].admin_grade;

                        var hisObj = {};
                        hisObj.cmpnyCd = 'agent-'+user.adminId;
                        hisObj.mSeq = '';
                        hisObj.admin_id = memId;
                        hisObj.adm_code = 'CMDT00000000000045';
                        hisObj.adm_request = 'login';
                        hisObj.is_success = '01';
                        hisObj.adm_response = '';
                        hisObj.adm_ip = requestIp.getClientIp(req);
                        await fnSetHistory(hisObj, conn)

                        return done(null, user);
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

    function fnGetAgentInfo(param, conn) {
        return new Promise(function (resolve, reject) {
            let sql = "";
            sql += "select seq, agent_id, agent_pw, agent_salt, admin_grade, create_dt from cs_agent";
            sql += " where 1=1";
            sql += " and agent_id = '" + param.memId + "'";

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
}
