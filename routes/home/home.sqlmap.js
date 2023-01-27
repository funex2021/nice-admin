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
        sql += "select count(1) cnt from ("
        sql += " select ccsl.seq, cc.agent_seq, date_format(ccsl.create_dt, '%Y-%m-%d') create_dt from cs_coin_sell_log ccsl";
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " where 1=1";
        sql += " and ccsl.sell_sts = 'CMDT00000000000026'";
        sql += " union all";
        sql += " select ccst.seq, cc.agent_seq , date_format(ccst.create_dt, '%Y-%m-%d') create_dt from cs_coin_sell_today ccst";
        sql += " left join cs_member cm on cm.m_seq = ccst.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " and ccst.sell_sts = 'CMDT00000000000026'";
        sql += " ) t";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and t.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and t.create_dt between date_format(now(), '%Y-%m-01') and date_format(now(), '%Y-%m-%d')";

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
        sql += "select ifnull(sum(t.buy_num), 0) cnt from ("
        sql += " select ccsl.seq, cc.agent_seq,  date_format(ccsl.create_dt, '%Y-%m-%d') create_dt, ccsl.buy_num from cs_coin_sell_log ccsl";
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " where 1=1";
        sql += " and ccsl.sell_sts = 'CMDT00000000000026'";
        sql += " union all";
        sql += " select ccst.seq, cc.agent_seq, date_format(ccst.create_dt, '%Y-%m-%d') create_dt, ccst.buy_num from cs_coin_sell_today ccst";
        sql += " left join cs_member cm on cm.m_seq = ccst.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " and ccst.sell_sts = 'CMDT00000000000026'";
        sql += " ) t";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and t.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and t.create_dt between date_format(now(), '%Y-%m-01') and date_format(now(), '%Y-%m-%d')";

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

function fnGetTodaySellTotalCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select count(1) cnt from cs_coin_sell_today ccst";
        sql += " left join cs_member cm on cm.m_seq = ccst.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " where 1=1";
        sql += " and ccst.sell_sts = 'CMDT00000000000026'";
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

function fnGetTodaySellTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(ccst.buy_num), 0) cnt from cs_coin_sell_today ccst";
        sql += " left join cs_member cm on cm.m_seq = ccst.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " where 1=1";
        sql += " and ccst.sell_sts = 'CMDT00000000000026'";
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

function fnGetRevenueTotalCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(cad.balance), 0) cnt from cs_agent_deposit cad";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cad.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and cad.create_dt between date_format(now(), '%Y-%m-01 00:00:00') and date_format(now(), '%Y-%m-%d 23:59:59')"

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

function fnGetTodayRevenueTotalCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(cad.balance), 0) cnt from cs_agent_deposit cad";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cad.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and cad.create_dt between date_format(now(), '%Y-%m-%d 00:00:00') and date_format(now(), '%Y-%m-%d 23:59:59')"

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

function fnGetCompanyMonthPrice(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(ccd.balance), 0) cnt from cs_company_deposit ccd";
        sql += " where 1=1";
        sql += " and ccd.create_dt between date_format(now(), '%Y-%m-01 00:00:00') and date_format(now(), '%Y-%m-%d 23:59:59')"

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



function fnGetCompanyTodayPrice(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(ccd.balance), 0) cnt from cs_company_deposit ccd";
        sql += " where 1=1";
        sql += " and ccd.create_dt between date_format(now(), '%Y-%m-%d 00:00:00') and date_format(now(), '%Y-%m-%d 23:59:59')"

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



module.exports.QGetMemberTotalCnt = fnGetMemberTotalCnt;
module.exports.QGetCompanyTotalCnt = fnGetCompanyTotalCnt;
module.exports.QGetSellTotalCnt = fnGetSellTotalCnt;
module.exports.QGetSellTotal = fnGetSellTotal;
module.exports.QGetWithdrawPrice = fnGetWithdrawPrice;

module.exports.QGetTodaySellTotalCnt = fnGetTodaySellTotalCnt;
module.exports.QGetTodaySellTotal = fnGetTodaySellTotal;

module.exports.QGetRevenueTotalCnt = fnGetRevenueTotalCnt;
module.exports.QGetTodayRevenueTotalCnt = fnGetTodayRevenueTotalCnt;
module.exports.QGetAgentInfo = fnGetAgentInfo;
module.exports.QUptAgentPassword = fnUptAgentPassword;

module.exports.QGetCompanyMonthPrice = fnGetCompanyMonthPrice;
module.exports.QGetCompanyTodayPrice = fnGetCompanyTodayPrice;

