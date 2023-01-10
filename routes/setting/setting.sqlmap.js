var isNullOrEmpty = require('is-null-or-empty');

function fnGetCompanyListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT count(1) totSum "
        sql += " FROM cs_company cc  "
        sql += " WHERE cc.admin_grade != 'CMDT00000000000001'"
        sql += " order by cc.create_dt desc"
        if (param.text) {
            if (param.srchOption == 'CMDT00000000000019') sql += " AND cc.cmpny_id like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND cc.cmpny_nm like '%" + param.text + "%'"
        }

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

function fnGetCompanyList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT cc.cmpny_cd, cc.cmpny_id, cc.cmpny_nm, cc.cmpny_password, cc.cmpny_ip, cc.coin_addr, cc.admin_grade, fn_get_name(cc.admin_grade) admin_grade_name, DATE_FORMAT(fn_get_time(cc.create_dt), '%Y-%m-%d %H:%i:%s') create_dt "
        sql += " , ifnull(cc.input_info1_bank,'') input_info1_bank, cc.input_info1_acc, cc.input_info1_name, cc.input_info2,cc.refresh_token, cc.approved_yn "
        sql += " FROM cs_company cc  "
        sql += " WHERE cc.admin_grade != 'CMDT00000000000001'"
        if (param.text) {
            if (param.srchOption == 'CMDT00000000000019') sql += " AND cc.cmpny_id like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND cc.cmpny_nm like '%" + param.text + "%'"
        }
        sql += " order by cc.create_dt desc"
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage

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

function fnGetCompanyInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT cc.cmpny_id, cc.cmpny_nm, cc.cmpny_password, cc.cmpny_salt, cc.cmpny_ip, cc.coin_addr, cc.admin_grade, fn_get_name(cc.admin_grade) admin_grade_name, DATE_FORMAT(fn_get_time(cc.create_dt), '%Y-%m-%d %H:%i:%s') create_dt "
        sql += " , cc.coin_rate, ifnull(cc.input_info1_bank,'') input_info1_bank, cc.input_info1_acc, cc.input_info1_name, cc.input_info2 , cc.refresh_token , cc.point_view_yn , cc.sign_yn "
        sql += " , cp.max_amt, cp.min_amt, cp.is_captcha, cp.is_pause, cp.login_text, cp.pwd_text, cp.is_admin_ip_block, cp.suspension_day, cp.is_auto_suspension, cp.suspension_min, cp.is_auto_suspension_view, cp.coin_alarm "
        sql += " FROM cs_company cc, cs_pay_config cp  "
        sql += " WHERE cc.cmpny_cd = cp.cmpny_cd AND cc.cmpny_cd = '" + param.cmpnyCd + "'"

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

function fnGetCmpnyAdmListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT count(1) totSum "
        sql += " FROM cs_company csc  inner join cs_member csm ON csc.cmpny_cd = csm.cmpny_cd"
        if (!isNullOrEmpty(param.memId)) {
            sql += " AND csm.mem_id = '" + param.memId + "'"
        }
        if (!isNullOrEmpty(param.memNm)) {
            sql += " AND csm.mem_nm = '" + param.memNm + "'"
        }
        sql += " AND csm.admin_grade != 'CMDT00000000000000'"
        sql += " WHERE 1=1 "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND csc.cmpny_cd = '" + param.cmpnyCd + "'"
        }
        if (!isNullOrEmpty(param.cmpnyNm)) {
            sql += " AND csc.cmpny_nm = '" + param.cmpnyNm + "'"
        }
        sql += " AND csc.admin_grade != 'CMDT00000000000001'"

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetCmpnyAdmList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT csc.cmpny_id, csc.cmpny_nm, csm.m_seq, csm.cmpny_cd, csm.mem_id, csm.mem_nm, csm.mem_hp, csm.mem_email, csm.nation, fn_get_name(csm.nation) nation_name "
        sql += " , csm.admin_grade, fn_get_name(csm.admin_grade) admin_grade_name, csm.mem_status, DATE_FORMAT(fn_get_time(csm.create_dt), '%Y-%m-%d %H:%i:%s') create_dt, csm.update_dt "
        sql += " FROM cs_company csc  inner join cs_member csm ON csc.cmpny_cd = csm.cmpny_cd"
        if (!isNullOrEmpty(param.memId)) {
            sql += " AND csm.mem_id = '" + param.memId + "'"
        }
        if (!isNullOrEmpty(param.memNm)) {
            sql += " AND csm.mem_nm = '" + param.memNm + "'"
        }
        sql += " AND csm.admin_grade != 'CMDT00000000000000'"
        sql += " WHERE 1=1 "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND csc.cmpny_cd = '" + param.cmpnyCd + "'"
        }
        if (!isNullOrEmpty(param.cmpnyNm)) {
            sql += " AND csc.cmpny_nm = '" + param.cmpnyNm + "'"
        }
        sql += " AND csc.admin_grade != 'CMDT00000000000001'"

        sql += " order by csc.create_dt desc, csm.create_dt desc"
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage
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

function fnGetMemList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT m_seq, cmpny_cd, mem_id, mem_pass, salt, mem_nm, mem_hp, mem_email, nation, admin_grade, fn_get_name(cc.admin_grade) admin_grade_name, mem_status, DATE_FORMAT(fn_get_time(cc.create_dt), '%Y-%m-%d %H:%i:%s') create_dt, update_dt "
        sql += " FROM cs_member cc  "
        sql += " WHERE cc.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += "AND cc.admin_grade != 'CMDT00000000000000'"

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


function fnUptSysConfig(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_company"
        sql += " SET input_info1_bank = '" + param.inputInfo1Bank + "' "
        sql += ", input_info1_acc = '" + param.inputInfo1Acc + "', input_info1_name = '" + param.inputInfo1Name + "' "
        sql += ", input_info2 = '" + param.inputInfo2 + "', seller_seq = '" + param.sellerSeq + "' "
        if (!isNullOrEmpty(param.cmpnyNm)) {
            sql += ", cmpny_nm = '" + param.cmpnyNm + "'"
        }
        if (!isNullOrEmpty(param.cmpnyIp)) {
            sql += ", cmpny_ip = '" + param.cmpnyIp + "'"
        }
        sql += " WHERE cmpny_cd = '" + param.cmpnyCd + "'"

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

function fnUptApproveYN(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_company SET approved_yn = IF(approved_yn='N', 'Y', 'N')  "
        sql += " WHERE cmpny_cd = '" + param.cmpnyCd + "'"

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

function fnUptCoinInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_company SET coin_addr = '" + param.cmpnyAddr + "', coin_pk = '" + param.cmpnyPk + "'"
        sql += " WHERE cmpny_cd = '" + param.cmpnyCd + "'"

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

function fnUptRefreshToken(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_company SET refresh_token = '" + param.refreshToken + "'"
        sql += " WHERE cmpny_cd = '" + param.cmpnyCd + "'"

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

function fnUptCompanyInitPwd(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_company SET cmpny_password = '" + param.cmpnyPassword + "',cmpny_salt = '" + param.cmpnySalt + "'"
        sql += " WHERE cmpny_cd = '" + param.cmpnyCd + "'"

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
* Main Company Insert
*/
function fnSetMainCompanyInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_company"
        sql += " (cmpny_cd, cmpny_dmn, cmpny_ip, coin_addr, coin_pk, refresh_token) "
        sql += " VALUES('" + param.cmpnyCd + "', '" + param.cmpnyDmn + "', '" + param.cmpnyIp + "', '" + param.cmpnyAddr + "', '" + param.cmpnyPk + "', '" + param.refreshToken + "') "

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

function fnSetMainAdmin(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_member"
        sql += " (m_seq, cmpny_cd, mem_id, mem_pass, salt, mem_nm, mem_hp, mem_email, nation, admin_grade) "
        sql += " VALUES('" + param.mSeq + "', '" + param.cmpnyCd + "', '" + param.memId + "', '" + param.memPass + "', '" + param.salt + "' "
        sql += " , '" + param.memNm + "' , '" + param.memHp + "', '" + param.memEmail + "', '" + param.nation + "', '" + param.adminGrade + "')  "

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

function fnUptMainAdmin(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_member "
        sql += " SET update_dt = CURRENT_TIMESTAMP  "

        if (!isNullOrEmpty(param.memPass)) {
            sql += " , mem_pass = '" + param.memPass + "', salt = '" + param.salt + "' "
        }

        sql += ", mem_nm = '" + param.memNm + "', mem_hp = '" + param.memHp + "' "
        sql += ", mem_email = '" + param.memEmail + "', admin_grade = '" + param.adminGrade + "'"
        sql += ", nation = '" + param.nation + "'"
        sql += " WHERE m_seq = '" + param.mSeq + "' AND cmpny_cd = '" + param.cmpnyCd + "'"

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

function fnDelAdmin(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " DELETE FROM cs_member "
        sql += " WHERE m_seq ='" + param.mSeq + "' AND cmpny_cd = '" + param.cmpnyCd + "'  "
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
 * 회원별 메뉴 권한 
 */
function fnGetMenuList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT accept_menu "
        sql += " FROM cs_admin_menu "
        sql += " WHERE cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " AND m_seq = '" + param.mSeq + "'"
        sql += " AND use_yn = 'Y'"

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

function fnSetDefaultMenu(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_admin_menu"
        sql += " (cmpny_cd, m_seq, accept_menu, use_yn) "
        sql += " VALUES('" + param.cmpnyCd + "', '" + param.mSeq + "', '" + param.acceptMenu + "', '" + param.useYn + "')  "

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

function fnUptMenuSetting(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_admin_menu"
        sql += " SET use_yn = '" + param.useYn + "' "
        sql += " WHERE cmpny_cd ='" + param.cmpnyCd + "' AND m_seq = '" + param.mSeq + "' AND accept_menu = '" + param.acceptMenu + "'"

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

function fnDelMenuSetting(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " DELETE FROM cs_admin_menu"
        sql += " WHERE cmpny_cd ='" + param.cmpnyCd + "' AND m_seq = '" + param.mSeq + "'"

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

function fnUptPayConfig(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_pay_config"
        sql += " SET max_amt = '" + param.max_amt + "', suspension_day = '" + param.suspension_day + "', coin_alarm = '" + param.coin_alarm + "' "
        sql += ", min_amt = '" + param.min_amt + "', is_captcha = '" + param.is_captcha + "', suspension_min = '" + param.suspension_min + "' "
        sql += ", is_pause = '" + param.is_pause + "', is_admin_ip_block = '" + param.is_admin_ip_block + "', is_auto_suspension_view = '" + param.is_auto_suspension_view + "' "
        sql += ", login_text = '" + param.login_text + "', pwd_text = '" + param.pwd_text + "' , is_auto_suspension = '" + param.is_auto_suspension + "' "
        sql += " WHERE cmpny_cd = '" + param.cmpnyCd + "'"

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


function fnInsSellerInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_seller "
        sql += " (seller_id, seller_password, seller_salt, seller_addr, seller_pk, seller_bank, seller_acc, seller_name, seller_info, create_dt, eth_addr, eth_pk) "
        sql += " VALUES ('" + param.sellerId + "', '" + param.cmpny_password + "', '" + param.cmpny_salt + "', '" + param.coin_addr + "', '" + param.coin_pk + "', '" + param.inputInfo1Bank + "', '" + param.inputInfo1Acc + "', '" + param.inputInfo1Name + "', '" + param.inputInfo2 + "', now(), '" + param.ethAddr + "', '" + param.ethPk + "');"
        sql += " SELECT seq FROM cs_seller WHERE seller_id = '" + param.sellerId + "'; "

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].insertId);
        });
    });
}

function fnSellerInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT seq, seller_id, seller_bank, seller_acc, seller_name "
        sql += " FROM cs_seller "
        sql += " WHERE REPLACE(seller_acc, '-', '') = REPLACE('" + param.inputInfo1Acc + "', '-', '')"
        sql += " AND seller_name = '" + param.inputInfo1Name + "'"

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

function fnUptRate(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "update cs_company set";
        sql += " coin_rate = '"+param.coinRate+"'";
        sql += " ,point_view_yn = '"+param.pointViewYn+"'";
        sql += " where 1=1";
        sql += " and cmpny_cd = '"+param.cmpnyCd+"'";

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

function fnUptSignYn(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "update cs_company set";
        sql += " sign_yn = '"+param.sign_yn+"'";
        sql += " where 1=1";
        sql += " and cmpny_cd = '"+param.cmpnyCd+"'";

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

module.exports.QSellerInfo = fnSellerInfo;
module.exports.QInsSellerInfo = fnInsSellerInfo
module.exports.QUptPayConfig = fnUptPayConfig;
module.exports.QGetCompanyListTotal = fnGetCompanyListTotal;
module.exports.QGetCompanyList = fnGetCompanyList;
module.exports.QGetCompanyInfo = fnGetCompanyInfo;
module.exports.QUptSysConfig = fnUptSysConfig;
module.exports.QSetMainCompanyInfo = fnSetMainCompanyInfo;
module.exports.QSetMainAdmin = fnSetMainAdmin;
module.exports.QUptMainAdmin = fnUptMainAdmin;
module.exports.QDelAdmin = fnDelAdmin;
module.exports.QGetCmpnyAdmListTotal = fnGetCmpnyAdmListTotal;
module.exports.QGetCmpnyAdmList = fnGetCmpnyAdmList;
module.exports.QGetMemList = fnGetMemList;
module.exports.QGetMenuList = fnGetMenuList;
module.exports.QSetDefaultMenu = fnSetDefaultMenu;
module.exports.QUptMenuSetting = fnUptMenuSetting;
module.exports.QDelMenuSetting = fnDelMenuSetting;
module.exports.QUptApproveYN = fnUptApproveYN;
module.exports.QUptCoinInfo = fnUptCoinInfo;
module.exports.QUptRefreshToken = fnUptRefreshToken;
module.exports.QUptCompanyInitPwd = fnUptCompanyInitPwd;
module.exports.QUptRate = fnUptRate;
module.exports.QUptSignYn = fnUptSignYn;