var isNullOrEmpty = require('is-null-or-empty');

function fnGetSellListCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select count(1) cnt from ("
        sql += " select ccsl.buy_num, ccsl.sell_sts, (select tccd.CMM_DTL_NAME from tb_comm_cd_dtl tccd where tccd.CMM_DTL_CD = ccsl.sell_sts) sell_sts_name, DATE_FORMAT(ccsl.create_dt, '%Y-%m-%d %H:%i:%s') create_dt, DATE_FORMAT(ccsl.update_dt, '%Y-%m-%d %H:%i:%s') update_dt";
        sql += ", cc.agent_seq, cc.cmpny_id";
        sql += ", cm.mem_id";
        sql += " from cs_coin_sell_log ccsl"
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq";
        sql += " left join cs_company cc on cc.cmpny_cd = cm.cmpny_cd";
        sql += " union all";
        sql += " select ccst.buy_num, ccst.sell_sts, (select tccd.CMM_DTL_NAME from tb_comm_cd_dtl tccd where tccd.CMM_DTL_CD = ccst.sell_sts) sell_sts_name, DATE_FORMAT(ccst.create_dt, '%Y-%m-%d %H:%i:%s') create_dt, DATE_FORMAT(ccst.update_dt, '%Y-%m-%d %H:%i:%s') update_dt";
        sql += ", cc.agent_seq, cc.cmpny_id";
        sql += ", cm.mem_id";
        sql += " from cs_coin_sell_today ccst"
        sql += " left join cs_member cm on cm.m_seq = ccst.m_seq";
        sql += " left join cs_company cc on cc.cmpny_cd = cm.cmpny_cd) t";

        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and t.agent_seq = '" + param.adminSeq + "'";
        }
        if (!isNullOrEmpty(param.srchOption)) {
            sql += " and t.cmpny_cd = '" + param.srchOption + "'";
            if (!isNullOrEmpty(param.srchText)) {
                sql += " and t.mem_id like '%" + param.srchText + "%'"
            }
        } else {
            if (!isNullOrEmpty(param.srchText)) {
                sql += " and t.mem_id like '%" + param.srchText + "%'"
            }
        }
        sql += " and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')"
        sql += " order by t.create_dt desc";

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

function fnGetSellList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select t.* from ("
        sql += " select ccsl.buy_num, ccsl.sell_sts, (select tccd.CMM_DTL_NAME from tb_comm_cd_dtl tccd where tccd.CMM_DTL_CD = ccsl.sell_sts) sell_sts_name, DATE_FORMAT(ccsl.create_dt, '%Y-%m-%d %H:%i:%s') create_dt, DATE_FORMAT(ccsl.update_dt, '%Y-%m-%d %H:%i:%s') update_dt";
        sql += ", cc.agent_seq, cc.cmpny_id";
        sql += ", cm.mem_id";
        sql += " from cs_coin_sell_log ccsl"
        sql += " left join cs_member cm on cm.m_seq = ccsl.m_seq";
        sql += " left join cs_company cc on cc.cmpny_cd = cm.cmpny_cd";
        sql += " union all";
        sql += " select ccst.buy_num, ccst.sell_sts, (select tccd.CMM_DTL_NAME from tb_comm_cd_dtl tccd where tccd.CMM_DTL_CD = ccst.sell_sts) sell_sts_name, DATE_FORMAT(ccst.create_dt, '%Y-%m-%d %H:%i:%s') create_dt, DATE_FORMAT(ccst.update_dt, '%Y-%m-%d %H:%i:%s') update_dt";
        sql += ", cc.agent_seq, cc.cmpny_id";
        sql += ", cm.mem_id";
        sql += " from cs_coin_sell_today ccst"
        sql += " left join cs_member cm on cm.m_seq = ccst.m_seq";
        sql += " left join cs_company cc on cc.cmpny_cd = cm.cmpny_cd) t";

        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and t.agent_seq = '" + param.adminSeq + "'";
        }
        if (!isNullOrEmpty(param.srchOption)) {
            sql += " and t.cmpny_cd = '" + param.srchOption + "'";
            if (!isNullOrEmpty(param.srchText)) {
                sql += " and t.mem_id like '%" + param.srchText + "%'"
            }
        } else {
            if (!isNullOrEmpty(param.srchText)) {
                sql += " and t.mem_id like '%" + param.srchText + "%'"
            }
        }
        sql += " and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')"
        sql += " order by t.create_dt desc";
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

module.exports.QGetSellListCnt = fnGetSellListCnt;
module.exports.QGetSellList = fnGetSellList;
module.exports.QGetCompanyListTotal = fnGetCompanyListTotal;