var isNullOrEmpty = require('is-null-or-empty');

function fnGetMemberListCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select count(1) cnt from cs_member cm";
        sql += " left join cs_company cc on cc.cmpny_cd = cm.cmpny_cd";
        sql += " left join cs_balance_wallet cbw on cbw.m_seq = cm.m_seq";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        if (!isNullOrEmpty(param.srchOption)) {
            sql += " and cc.cmpny_cd = '" + param.srchOption + "'";
            if (!isNullOrEmpty(param.srchText)) {
                sql += " and cm.mem_id like '%" + param.srchText + "%'"
            }
        } else {
            if (!isNullOrEmpty(param.srchText)) {
                sql += " and cm.mem_id like '%" + param.srchText + "%'"
            }
        }
        sql += " order by cc.create_dt desc";

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

function fnGetMemberList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select cm.mem_id, cm.mem_status, (select tccd.CMM_DTL_NAME from tb_comm_cd_dtl tccd where tccd.CMM_DTL_CD = cm.mem_status) mem_status_name";
        sql += ", cc.cmpny_id";
        sql += ", ifnull(cbw.balance,0) balance";
        sql += " from cs_member cm";
        sql += " left join cs_company cc on cc.cmpny_cd = cm.cmpny_cd";
        sql += " left join cs_balance_wallet cbw on cbw.m_seq = cm.m_seq";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and cc.agent_seq = '" + param.adminSeq + "'";
        }
        if (!isNullOrEmpty(param.srchOption)) {
            sql += " and cc.cmpny_cd = '" + param.srchOption + "'";
            if (!isNullOrEmpty(param.srchText)) {
                sql += " and cm.mem_id like '%" + param.srchText + "%'"
            }
        } else {
            if (!isNullOrEmpty(param.srchText)) {
                sql += " and cm.mem_id like '%" + param.srchText + "%'"
            }
        }
        sql += " order by cc.create_dt desc";
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage;

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

function fnGetCompanyListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select cc.cmpny_cd, cc.cmpny_id, cc.cmpny_status, (select tccd.CMM_DTL_NAME from tb_comm_cd_dtl tccd where tccd.CMM_DTL_CD = cc.cmpny_status) cmpny_status_name, company_commission, agent_commission";
        sql += ", ca.agent_id";
        sql += " from cs_company cc";
        sql += " left join cs_agent ca on ca.seq = cc.agent_seq";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and ca.agent_id = '" + param.adminId + "'";
        }
        sql += " order by cc.create_dt desc";

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

module.exports.QGetMemberListCnt = fnGetMemberListCnt;
module.exports.QGetMemberList = fnGetMemberList;
module.exports.QGetCompanyListTotal = fnGetCompanyListTotal;