var isNullOrEmpty = require('is-null-or-empty');

function fnGetMemberCount(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) memCnt "
        sql += " from cs_member where admin_grade = 'CMDT00000000000000'"
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cmpny_cd = '" + param.cmpnyCd + "'"

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].memCnt);
        });
    });
}

function fnGetMonthMemberCount(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) monthCnt "
        sql += " from cs_member  cm where admin_grade = 'CMDT00000000000000'"
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " and DATE_FORMAT(cm.create_dt , '%Y-%m-%d') between "
        sql += " (SELECT LAST_DAY(NOW() - interval 1 month) + interval 1 DAY  FROM DUAL) "
        sql += " and (SELECT LAST_DAY(NOW())  FROM DUAL)  "

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].monthCnt);
        });
    });
}


function fnGetMonthMemberCount(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) monthCnt "
        sql += " from cs_member  cm where admin_grade = 'CMDT00000000000000'"
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " and DATE_FORMAT(cm.create_dt , '%Y-%m-%d') between "
        sql += " (SELECT LAST_DAY(NOW() - interval 1 month) + interval 1 DAY  FROM DUAL) "
        sql += " and (SELECT LAST_DAY(NOW())  FROM DUAL)  "

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].monthCnt);
        });
    });
}


function fnGetTotSuccessCoinSell(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select ifnull(sum(pay_num),0) tot_pay_num from " + param.cs_coin_sell + " ccs "
        sql += " where 1=1";
        //if (!isNullOrEmpty(param.cmpnyCd ) )sql += " and  (select cmpny_cd from cs_member cm2 where cm2.m_seq  = ccs.m_seq ) = '"+param.cmpnyCd+"'"
        sql += " and ccs.sell_sts = 'CMDT00000000000026' "
        sql += " and DATE_FORMAT(fn_get_time(ccs.create_dt), '%Y-%m-%d') = DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') "

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].tot_pay_num);
        });
    });
}

function fnGetTotCancelCoinSell(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select ifnull(sum(pay_num),0) tot_pay_num from " + param.cs_coin_sell + " ccs "
        sql += " where 1=1";
        //if (!isNullOrEmpty(param.cmpnyCd ) )sql += " and  (select cmpny_cd from cs_member cm2 where cm2.m_seq  = ccs.m_seq ) = '"+param.cmpnyCd+"'"
        sql += " and ccs.sell_sts = 'CMDT00000000000027' "
        sql += " and DATE_FORMAT(fn_get_time(ccs.create_dt), '%Y-%m-%d') = DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') "


        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].tot_pay_num);
        });
    });
}

function fnGetTotCoinTrans(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select ifnull(sum(trans_num),0) tot_pay_num from " + param.cs_coin_trans + "  cct   "
        sql += " where 1=1";
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and  cct.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " and cct.trans_yn = 'Y' "
        sql += " and DATE_FORMAT(fn_get_time(cct.create_dt), '%Y-%m-%d') = DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') "


        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].tot_pay_num);
        });
    });
}

function fnGetTotBalance(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select ifnull(sum(balance),0) tot_pay_num from cs_balance_wallet cct   "
        sql += " where 1=1";
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and  (select cmpny_cd from cs_member cm2 where cm2.m_seq  = cct.m_seq ) = '" + param.cmpnyCd + "'"

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].tot_pay_num);
        });
    });
}

function fnGetSubNoticeListCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select count(1) cnt from cs_notice_sub";
        sql += " where 1=1";
        sql += " and cmpny_cd = '"+param.cmpnyCd+"'";
        sql += " and use_yn = 'Y'"
        sql += " and DATE_FORMAT(create_dt, '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') ";
        sql += " order by create_dt desc";

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetSubNoticeList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select seq, title, content, use_yn, DATE_FORMAT(create_dt, '%Y-%m-%d') create_dt from cs_notice_sub";
        sql += " where 1=1";
        sql += " and cmpny_cd = '"+param.cmpnyCd+"'";
        sql += " and DATE_FORMAT(create_dt, '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') ";
        sql += " order by create_dt desc";
        sql += " limit " + (param.pageIndex - 1) * 10 + "," + param.rowsPerPage;

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

function fnGetSubNoticeDetail(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select seq, title, content, use_yn, DATE_FORMAT(create_dt, '%Y-%m-%d') create_dt from cs_notice_sub";
        sql += " where 1=1";
        sql += " and seq ='"+param.seq+"'";

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0]);
        });
    });
}

function fnInsSubNotice(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "insert into cs_notice_sub (cmpny_cd, title, content, use_yn) values";
        sql += " ('"+param.cmpnyCd+"','"+param.title+"','"+param.content+"','"+param.use_yn+"')"

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

function fnUptSubNotice(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "update cs_notice_sub set";
        sql += " title = '"+param.title+"'";
        sql += " ,content = '"+param.content+"'";
        sql += " ,use_yn = '"+param.use_yn+"'";
        sql += " where 1=1";
        sql += " and seq = '"+param.seq+"'";

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

module.exports.QGetMemberCount = fnGetMemberCount;
module.exports.QGetMonthMemberCount = fnGetMonthMemberCount;
module.exports.QGetTotSuccessCoinSell = fnGetTotSuccessCoinSell;
module.exports.QGetTotCancelCoinSell = fnGetTotCancelCoinSell;
module.exports.QGetTotCoinTrans = fnGetTotCoinTrans;
module.exports.QGetTotBalance = fnGetTotBalance;
module.exports.QGetSubNoticeListCnt = fnGetSubNoticeListCnt;
module.exports.QGetSubNoticeList = fnGetSubNoticeList;
module.exports.QGetSubNoticeDetail = fnGetSubNoticeDetail;
module.exports.QInsSubNotice = fnInsSubNotice;
module.exports.QUptSubNotice = fnUptSubNotice;