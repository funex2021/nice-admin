var isNullOrEmpty = require('is-null-or-empty');

function fnGetWithdrawListCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += " SELECT count(1) cnt";
        sql += " FROM cs_agent_withdraw ";
        sql += " where 1=1 ";
        sql += " and agent_seq = '" + param.adminSeq + "'";
        if (!isNullOrEmpty(param.srtDt) && !isNullOrEmpty(param.endDt)) {
            sql += " and DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d')"
        }
        if (!isNullOrEmpty(param.srchOption)) {
            sql += " and withdraw_status = '" + param.srchOption + "'";
        }

        console.log('fnGetWithdrawListCnt ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetWithdrawList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += " SELECT ";
        sql += " seq , agent_seq , withdraw_price , withdraw_status , fn_get_name(withdraw_status) as status_nm , bank_acc , ";
        sql += " DATE_FORMAT(create_dt, '%Y-%m-%d %H:%i:%s') create_dt , DATE_FORMAT(update_dt, '%Y-%m-%d %H:%i:%s') update_dt ";
        sql += " FROM cs_agent_withdraw ";
        sql += " where 1=1 ";
        sql += " and agent_seq = '" + param.adminSeq + "'";
        if (!isNullOrEmpty(param.srtDt) && !isNullOrEmpty(param.endDt)) {
            sql += " and DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d')"
        }
        if (!isNullOrEmpty(param.srchOption)) {
            sql += " and withdraw_status = '" + param.srchOption + "'";
        }
        sql += " order by create_dt desc";
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage;

        console.log('fnGetWithdrawList ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}


function fnSetWithdraw(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = " INSERT INTO  cs_agent_withdraw";
        sql += " (agent_seq , withdraw_price , bank_acc , bank_nm , acc_nm, create_dt ) "
        sql += " VALUES('" + param.adminSeq + "', '" + param.price +"', '" + param.bank_acc +"', '" + param.bank_nm +"', '" + param.acc_nm + "', now())  ";

        console.log("fnSetWithdraw :>> ", sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}



function fnGetAgentInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select seq, balance, bank_nm , bank_acc , acc_nm , create_dt from cs_agent";
        sql += " where 1=1";
        sql += " and seq = '" + param.adminSeq + "'";

        console.log("fnGetAgentInfo :>> ", sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetAgentWithdrawListCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select count(1) cnt from cs_agent_withdraw caw";
        sql += " left join cs_agent ca on ca.seq = caw.agent_seq";
        sql += " where 1=1";
        if (!isNullOrEmpty(param.srchOption)) {
            sql += " and caw.agent_seq = '" + param.srchOption + "'";
        }
        if (!isNullOrEmpty(param.srtDt) && !isNullOrEmpty(param.endDt)) {
            sql += " and DATE_FORMAT(fn_get_time(caw.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d')"
        }
        sql += " order by caw.create_dt desc";

        console.log("sql :>> ", sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetAgentWithdrawList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select caw.seq, caw.withdraw_price, caw.withdraw_status, (select tccd.CMM_DTL_NAME from tb_comm_cd_dtl tccd where tccd.CMM_DTL_CD = caw.withdraw_status) withdraw_status_name, DATE_FORMAT(caw.create_dt, '%Y-%m-%d %H:%i:%s') create_dt, caw.bank_acc, caw.acc_nm, caw.bank_nm";
        sql += ", ca.agent_id";
        sql += " from cs_agent_withdraw caw";
        sql += " left join cs_agent ca on ca.seq = caw.agent_seq";
        sql += " where 1=1";
        if (!isNullOrEmpty(param.srchOption)) {
            sql += " and caw.agent_seq = '" + param.srchOption + "'";
        }
        if (!isNullOrEmpty(param.srtDt) && !isNullOrEmpty(param.endDt)) {
            sql += " and DATE_FORMAT(fn_get_time(caw.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d')"
        }
        sql += " order by caw.create_dt desc";
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage;

        console.log("sql :>> ", sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetAgentList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ca.seq, ca.agent_id from cs_agent ca";
        sql += " where 1=1";
        sql += " and ca.admin_grade != 'CMDT00000000000001'";

        console.log("sql :>> ", sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnUptWithdrawStatus(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "update cs_agent_withdraw set";
        sql += " update_dt = NOW()";
        sql += ", withdraw_status = '" +param.status + "'";
        sql += " where 1=1";
        sql += " and seq = '" + param.seq + "'";

        console.log("sql :>> ", sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

module.exports.QGetWithdrawListCnt = fnGetWithdrawListCnt;
module.exports.QGetWithdrawList = fnGetWithdrawList;
module.exports.QSetWithdraw = fnSetWithdraw;
module.exports.QGetAgentInfo = fnGetAgentInfo;
module.exports.QGetAgentWithdrawListCnt = fnGetAgentWithdrawListCnt;
module.exports.QGetAgentWithdrawList = fnGetAgentWithdrawList;
module.exports.QGetAgentList = fnGetAgentList;
module.exports.QUptWithdrawStatus = fnUptWithdrawStatus;