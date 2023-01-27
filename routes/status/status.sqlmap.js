var isNullOrEmpty = require('is-null-or-empty');

function fnGetTotalCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ``;
        sql += `select count(1) cnt from `;
        sql += `(select T.*, `;
        sql += `IFNULL((select sum(withdraw_price) from cs_agent_withdraw where DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') = T.create_dt), 0) withdraw_balance `;
        sql += `from( `;
        sql += `select total_balance, sum(balance) total_commission, sum(count) total_count, DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') create_dt `;
        sql += `from cs_agent_deposit cad `;
        sql += `where 1 = 1 `;
        if (param.adminGrade == 'CMDT00000000000002' && !isNullOrEmpty(param.adminSeq)) {
            sql += `and agent_seq = ${param.adminSeq} `;
        }
        if (!isNullOrEmpty(param.srchOption)) sql += `and company_seq = ${param.srchOption} `
        sql += " and DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')";
        sql += `group by agent_seq, DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d')) T `;
        sql += `order by create_dt desc) a `;
        
        console.log('fnGetTotalCnt ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetCompanyListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select cc.seq, cc.cmpny_cd, cc.cmpny_id, cc.cmpny_status, (select tccd.CMM_DTL_NAME from tb_comm_cd_dtl tccd where tccd.CMM_DTL_CD = cc.cmpny_status) cmpny_status_name, company_commission, agent_commission";
        sql += ", ca.agent_id";
        sql += " from cs_company cc";
        sql += " left join cs_agent ca on ca.seq = cc.agent_seq";
        sql += " where 1=1";
        if (param.adminGrade == 'CMDT00000000000002') {
            sql += " and ca.agent_id = '" + param.adminId + "'";
        }
        sql += " order by cc.create_dt desc";

        console.log('fnGetCompanyListTotal ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetTradeInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ``;
        sql += ` select T.*, `;
        sql += `IFNULL((select sum(withdraw_price) from cs_agent_withdraw caw where DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') = T.create_dt and T.agent_seq = caw.agent_seq), 0) withdraw_balance `;
        sql += `from ( `;
        sql += `select sum(total_balance) as total_balance, sum(balance) total_commission, sum(count) total_count, DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') create_dt , `;
        sql += ` cad.agent_seq , (select ca.agent_id from cs_agent ca where ca.seq = cad.agent_seq) as agent_id ` ;
        sql += `from cs_agent_deposit cad `;
        sql += `where 1=1 `;
        if (param.adminGrade == 'CMDT00000000000002' && !isNullOrEmpty(param.adminSeq)) {
             sql += `and agent_seq = ${param.adminSeq} `;
        }
        if (!isNullOrEmpty(param.srchOption)) sql += `and company_seq = ${param.srchOption} `
        sql += " and DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')";
        sql += `group by agent_seq, DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d')) T `;
        sql += `order by create_dt desc `
        sql += `limit ${(param.pageIndex - 1) * param.rowsPerPage}, ${param.rowsPerPage}`;

        console.log('fnGetTradeInfo ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}


function fnGetTradeTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ``;
        sql += ` select T.*, `;
        sql += `IFNULL((select sum(withdraw_price) from cs_agent_withdraw caw where DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') = T.create_dt), 0) withdraw_balance `;
        sql += `from ( `;
        sql += `select IFNULL(sum(total_balance),0) as total_balance, IFNULL(sum(balance),0) total_commission, IFNULL(sum(count),0) total_count, DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') create_dt `;
        sql += `from cs_agent_deposit cad `;
        sql += `where 1=1 `;
        if (param.adminGrade == 'CMDT00000000000002' && !isNullOrEmpty(param.adminSeq)) {
            sql += `and agent_seq = ${param.adminSeq} `;
        }
        if (!isNullOrEmpty(param.srchOption)) sql += `and company_seq = ${param.srchOption} `
        sql += " and DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')) T";

        console.log('fnGetTradeInfo ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

module.exports.QGetTotalCnt = fnGetTotalCnt;
module.exports.QGetCompanyListTotal = fnGetCompanyListTotal;

module.exports.QGetTradeInfo = fnGetTradeInfo;
module.exports.QGetTradeTotal = fnGetTradeTotal;