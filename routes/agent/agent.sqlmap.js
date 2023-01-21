var isNullOrEmpty = require('is-null-or-empty');
function fnGetAgentInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select agent_id , seq, balance, bank_nm , bank_acc , acc_nm , create_dt from cs_agent";
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

function fnGetAgentWithdrawListCnt(param, conn) {QGetAgentInfo
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

function fnGetAgentSelectList(param, conn) {
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

function fnGetAgentListCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += " select count(1) as cnt ";
        sql += " from cs_agent "
        sql += " where 1=1 "
        sql += " and admin_grade != 'CMDT00000000000001'";
        if (!isNullOrEmpty(param.srchOption)) {
            if (!isNullOrEmpty(param.srchText)) {
                if (param.srchOption == '01') {
                    sql += " and agent_id like '%" + param.srchText + "%'"
                }else{
                    sql += " and acc_nm like '%" + param.srchText + "%'"
                }
            }
        }

        console.log("fnGetAgentListCnt :>> ", sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}


function fnGetAgentList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += " select "
        sql += " seq , agent_id , agent_pw , agent_salt , admin_grade , balance , bank_nm ,bank_acc , "
        sql += " acc_nm , date_format(create_dt, '%Y-%m-%d %H:%i:%s') as create_dt , date_format(update_dt, '%Y-%m-%d %H:%i:%s') as update_dt "
        sql += " from cs_agent "
        sql += " where 1=1 "
        sql += " and admin_grade != 'CMDT00000000000001'";
        if (!isNullOrEmpty(param.srchOption)) {
            if (!isNullOrEmpty(param.srchText)) {
                if (param.srchOption == '01') {
                    sql += " and agent_id like '%" + param.srchText + "%'"
                }else{
                    sql += " and acc_nm like '%" + param.srchText + "%'"
                }
            }
        }
        sql += " order by create_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage;

        console.log("fnGetAgentList :>> ", sql);

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}


function fnInsAgent(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = " INSERT INTO  cs_agent";
        sql += " ( agent_id , agent_pw , agent_salt , admin_grade  , bank_nm , bank_acc , acc_nm , create_dt ) "
        sql += " VALUES('" + param.agent_id + "', '" + param.agent_pw +"', '" + param.agent_salt +"', '" + param.admin_grade +"', '" + param.bank_nm +"', '" + param.bank_acc +"', '" + param.acc_nm + "', now())  ";

        console.log("fnUptAgent :>> ", sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}


function fnUptAgent(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += " update cs_agent set";
        sql += " update_dt = NOW()";
        sql += " , bank_nm = '" +param.bank_nm + "'";
        sql += " , acc_nm = '" +param.acc_nm + "'";
        sql += " , bank_acc = '" +param.bank_acc + "'";
        sql += " where 1=1";
        sql += " and seq = '" + param.seq + "'";

        console.log("fnUptAgent :>> ", sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

module.exports.QGetAgentInfo = fnGetAgentInfo;
module.exports.QGetAgentWithdrawListCnt = fnGetAgentWithdrawListCnt;
module.exports.QGetAgentWithdrawList = fnGetAgentWithdrawList;
module.exports.QGetAgentSelectList = fnGetAgentSelectList;
module.exports.QUptWithdrawStatus = fnUptWithdrawStatus;
module.exports.QGetAgentListCnt = fnGetAgentListCnt;
module.exports.QGetAgentList = fnGetAgentList;

module.exports.QInsAgent = fnInsAgent;
module.exports.QUptAgent = fnUptAgent;