var isNullOrEmpty = require('is-null-or-empty');

function fnGetTotalRevenue(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(cad.balance), 0) cnt from cs_agent_deposit cad";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cad.agent_seq = '" + param.adminSeq + "'";
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

function fnGetTotalRevenueThisWeek(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(cad.balance), 0) cnt from cs_agent_deposit cad";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cad.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and cad.create_dt between date_format(date_add(now(), interval -7 day), '%Y-%m-%d') and date_format(now(), '%Y-%m-%d');"

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

function fnGetTotalRevenueLsatWeek(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(cad.balance), 0) cnt from cs_agent_deposit cad";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cad.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and cad.create_dt between date_format(date_add(now(), interval -14 day), '%Y-%m-%d') and date_format(date_add(now(), interval -7 day), '%Y-%m-%d');"

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

function fnGetTotalMember(param, conn) {
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

function fnGetTotalMemberThisWeek(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select count(1) cnt from cs_member cm";
        sql += " left join cs_company cc on cc.cmpny_cd = cm.cmpny_cd";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and cm.create_dt between date_format(date_add(now(), interval -7 day), '%Y-%m-%d') and date_format(now(), '%Y-%m-%d');"

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

function fnGetTotalMemberLastWeek(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select count(1) cnt from cs_member cm";
        sql += " left join cs_company cc on cc.cmpny_cd = cm.cmpny_cd";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and cm.create_dt between date_format(date_add(now(), interval -14 day), '%Y-%m-%d') and date_format(date_add(now(), interval -7 day), '%Y-%m-%d');"

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

function fnGetTotalCompany(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(ccd.balance), 0) cnt from cs_company_deposit ccd";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and ccd.company_seq in (select seq from cs_company where agent_seq = '" + param.adminSeq + "')";
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

function fnGetTotalCompanyThisWeek(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(ccd.balance), 0) cnt from cs_company_deposit ccd";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and ccd.company_seq in (select seq from cs_company where agent_seq = '" + param.adminSeq + "')";
        }
        sql += " and ccd.create_dt between date_format(date_add(now(), interval -7 day), '%Y-%m-%d') and date_format(now(), '%Y-%m-%d');"

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

function fnGetTotalCompanyLastWeek(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(ccd.balance), 0) cnt from cs_company_deposit ccd";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and ccd.company_seq in (select seq from cs_company where agent_seq = '" + param.adminSeq + "')";
        }
        sql += " and ccd.create_dt between date_format(date_add(now(), interval -14 day), '%Y-%m-%d') and date_format(date_add(now(), interval -7 day), '%Y-%m-%d');"

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

function fnGetTopCompany5(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(cc.cmpny_id, '') cmpny_id , sum(ccsl.buy_num) balance from cs_coin_sell_log ccsl";
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq"
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd"
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " group by cc.cmpny_cd";
        sql += " order by balance desc";
        sql += " limit 5";

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetTotalSellCntList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select cc.cmpny_id name, count(1) value from cs_coin_sell_log ccsl";
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " where 1=1";
        sql += " and ccsl.sell_sts = 'CMDT00000000000026'";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " group by cc.cmpny_cd";

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetMontylyTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select ifnull(sum(t.cnt), 0) cnt, ifnull(sum(t.balance), 0) balance from (select count(1) cnt, sum(ccsl.buy_num) balance from cs_coin_sell_log ccsl";
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " where 1=1";
        sql += " and ccsl.sell_sts = 'CMDT00000000000026'";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " and ccsl.create_dt between date_format(now(), '%Y-%m-01') and date_format(now(), '%Y-%m-%d')";
        sql += " group by cc.cmpny_cd) t"

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0]);
        });
    });
}

function fnGetMontylyTotalChart(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select t.* from (select date_format(ccsl.create_dt, '%Y-%m') create_dt, count(1) cnt, sum(ccsl.buy_num) balance from cs_coin_sell_log ccsl";
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq";
        sql += " left join cs_company cc on cm.cmpny_cd = cc.cmpny_cd";
        sql += " where 1=1";
        sql += " and ccsl.sell_sts = 'CMDT00000000000026'";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        sql += " group by date_format(ccsl.create_dt, '%Y-%m')";
        sql += " order by create_dt desc";
        sql += " limit 12) t";
        sql += " order by t.create_dt asc"

        console.log('sql ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

module.exports.QGetTotalRevenue = fnGetTotalRevenue;
module.exports.QGetTotalRevenueThisWeek = fnGetTotalRevenueThisWeek;
module.exports.QGetTotalRevenueLsatWeek = fnGetTotalRevenueLsatWeek;
module.exports.QGetTotalMember = fnGetTotalMember;
module.exports.QGetTotalMemberThisWeek = fnGetTotalMemberThisWeek;
module.exports.QGetTotalMemberLastWeek = fnGetTotalMemberLastWeek;
module.exports.QGetTotalCompany = fnGetTotalCompany;
module.exports.QGetTotalCompanyThisWeek = fnGetTotalCompanyThisWeek;
module.exports.QGetTotalCompanyLastWeek = fnGetTotalCompanyLastWeek;
module.exports.QGetTopCompany5 = fnGetTopCompany5;
module.exports.QGetTotalSellCntList = fnGetTotalSellCntList;
module.exports.QGetMontylyTotal = fnGetMontylyTotal;
module.exports.QGetMontylyTotalChart = fnGetMontylyTotalChart;