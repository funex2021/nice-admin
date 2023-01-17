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

module.exports.QGetMemberTotalCnt = fnGetMemberTotalCnt;
module.exports.QGetCompanyTotalCnt = fnGetCompanyTotalCnt;
module.exports.QGetSellTotalCnt = fnGetSellTotalCnt;
module.exports.QGetSellTotal = fnGetSellTotal;