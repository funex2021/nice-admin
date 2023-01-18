var isNullOrEmpty = require('is-null-or-empty');

function fnGetMemberTotalCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select count(1) cnt from cs_member cm";
        sql += " left join cs_company cc on cc.cmpny_cd = cm.cmpny_cd";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetCompanyTotalCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select count(1) cnt from cs_company cc";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetSellTotalCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select count(1) cnt from cs_coin_sell_log ccsl";
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " where 1=1";
        sql += " and sell_sts = 'CMDT00000000000026'";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and ccsl.create_dt between date_format(now(), '%Y-%m-01') and date_format(now(), '%Y-%m-%d');"

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetSellTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(ccsl.buy_num), 0) cnt from cs_coin_sell_log ccsl";
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " where 1=1";
        sql += " and sell_sts = 'CMDT00000000000026'";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and ccsl.create_dt between date_format(now(), '%Y-%m-01') and date_format(now(), '%Y-%m-%d');"

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetWithdrawPrice(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ca.balance from cs_agent ca";
        sql += " where 1=1";
        sql += " and ca.seq = '" + param.adminSeq + "'";

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].balance);
        });
    });
}

function fnGetYesterdaySellTotalCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(ccsl.buy_num), 0) cnt from cs_coin_sell_log ccsl";
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " where 1=1";
        sql += " and sell_sts = 'CMDT00000000000026'";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and ccsl.create_dt between date_format(date_add(now(), interval -1 day), '%Y-%m-%d') and date_format(now(), '%Y-%m-%d');"

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetYesterdaySellTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(ccsl.buy_num), 0) cnt from cs_coin_sell_log ccsl";
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " where 1=1";
        sql += " and sell_sts = 'CMDT00000000000026'";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and ccsl.create_dt between date_format(date_add(now(), interval -1 day), '%Y-%m-%d') and date_format(now(), '%Y-%m-%d');"

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetRevenueTotalCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(cad.balance), 0) cnt from cs_agent_deposit cad";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cad.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and cad.create_dt between date_format(now(), '%Y-%m-01') and date_format(now(), '%Y-%m-%d');"

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetYesterdayRevenueTotalCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(cad.balance), 0) cnt from cs_agent_deposit cad";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cad.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and cad.create_dt between date_format(date_add(now(), interval -1 day), '%Y-%m-%d') and date_format(now(), '%Y-%m-%d');"

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetAgentInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select seq, agent_id, agent_pw, agent_salt, admin_grade, create_dt from cs_agent";
        sql += " where 1=1";
        sql += " and seq = '" + param.adminSeq + "'";

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


function fnUptAgentPassword(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = `update cs_agent set agent_pw = '${param.memPass}', agent_salt = '${param.salt}' `;
        sql += " where 1=1";
        sql += " and seq = '" + param.adminSeq + "'";

        console.log("fnUptPassword :>> ", sql);
        console.log(sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}


module.exports.QGetMemberTotalCnt = fnGetMemberTotalCnt;
module.exports.QGetCompanyTotalCnt = fnGetCompanyTotalCnt;
module.exports.QGetSellTotalCnt = fnGetSellTotalCnt;
module.exports.QGetSellTotal = fnGetSellTotal;
module.exports.QGetWithdrawPrice = fnGetWithdrawPrice;
module.exports.QGetYesterdaySellTotalCnt = fnGetYesterdaySellTotalCnt;
module.exports.QGetYesterdaySellTotal = fnGetYesterdaySellTotal;
module.exports.QGetRevenueTotalCnt = fnGetRevenueTotalCnt;
module.exports.QGetYesterdayRevenueTotalCnt = fnGetYesterdayRevenueTotalCnt;
module.exports.QGetAgentInfo = fnGetAgentInfo;
module.exports.QUptAgentPassword = fnUptAgentPassword;