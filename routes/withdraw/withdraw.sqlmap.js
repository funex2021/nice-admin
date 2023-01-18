var isNullOrEmpty = require('is-null-or-empty');

function fnGetWithdrawListCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += " SELECT count(1) cnt";
        sql += " FROM cs_agent_withdraw ";
        sql += " where 1=1 ";
        sql += " and agent_seq = '" + param.adminSeq + "'";
        sql += " and DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')"

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

function fnGetWithdrawList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += " SELECT ";
        sql += " seq , agent_seq , withdraw_price , withdraw_status , fn_get_name(withdraw_status) as status_nm , ";
        sql += " DATE_FORMAT(create_dt, '%Y-%m-%d %H:%i:%s') create_dt , DATE_FORMAT(update_dt, '%Y-%m-%d %H:%i:%s') update_dt ";
        sql += " FROM cs_agent_withdraw ";
        sql += " where 1=1 ";
        sql += " and agent_seq = '" + param.adminSeq + "'";
        sql += " and DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')"
        sql += " order by create_dt desc";
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

module.exports.QGetWithdrawListCnt = fnGetWithdrawListCnt;
module.exports.QGetWithdrawList = fnGetWithdrawList;