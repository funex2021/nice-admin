var isNullOrEmpty = require('is-null-or-empty');
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('adm.properties');
const cointable = properties.get('com.coin.cointable');

function fnGetCoinTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT count(1) totSum "
        sql += " FROM cs_member cm inner join cs_company csc ON cm.cmpny_cd = csc.cmpny_cd "
        sql += " inner join "
        sql += " (select ccs.seq ,ccs.m_seq, ccs.buy_num, ccs.pay_num,ccs.send_txid, ccs.sell_sts,ccs.create_dt,ccs.update_dt from " + param.cs_coin_sell + " ccs "
        sql += "   inner join cs_member cm  ON cm.m_seq = ccs.m_seq "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += "   union all "
        sql += "   select cbch.seq ,cbch.m_seq,  '0' buy_num,cbch.balance as pay_num,'' as send_txid, cbch.change_code as sell_sts,cbch.create_dt,cbch.create_dt as update_dt "
        sql += "   from cs_balance_change_his cbch  "
        sql += "  inner join cs_member cm  ON cm.m_seq = cbch.m_seq "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " ) cb ON cm.m_seq = cb.m_seq "
        if (!isNullOrEmpty(param.srchBuySts)) sql += " AND cb.sell_sts = '" + param.srchBuySts + "'"
        sql += " WHERE 1=1 "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " AND cm.admin_grade = 'CMDT00000000000000'"
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND csc.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND csc.cmpny_nm like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND cm.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND cm.mem_nm like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000047') sql += " AND cb.buy_num = '" + param.srchText + "'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(cb.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totSum);
        });
    });
}

function fnGetCoinList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select * from ( SELECT csc.cmpny_id, csc.cmpny_nm, cb.seq buySeq, cm.m_seq , cm.mem_id, cm.mem_pass, cm.salt, cm.mem_nm, cm.mem_hp, cm.mem_email, nation, fn_get_name(cm.nation) nation_name ,cm.admin_grade, fn_get_name(cm.admin_grade) admin_grade_name "
        sql += " , cb.buy_num, cb.pay_num, csc.coin_rate, cb.send_txid,  cb.sell_sts, fn_get_name(cb.sell_sts) sell_sts_name "
        sql += " , concat(ck.bank_info,' ',ck.bank_acc,' ',ck.acc_nm) bank , DATE_FORMAT(fn_get_time(cb.create_dt), '%Y-%m-%d %H:%i:%s') create_dt, DATE_FORMAT(fn_get_time(cb.update_dt), '%Y-%m-%d %H:%i:%s') update_dt"
        sql += " FROM cs_member cm inner join cs_company csc ON cm.cmpny_cd = csc.cmpny_cd "
        sql += " inner join "
        sql += " (select ccs.seq ,ccs.m_seq, ccs.buy_num, ccs.pay_num,ccs.send_txid, ccs.sell_sts,ccs.create_dt,ccs.update_dt from " + param.cs_coin_sell + " ccs "
        sql += "   inner join cs_member cm  ON cm.m_seq = ccs.m_seq "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += "   union all "
        sql += "   select cbch.seq ,cbch.m_seq,  '0' buy_num,cbch.balance as pay_num,'' as send_txid, cbch.change_code as sell_sts,cbch.create_dt,cbch.create_dt as update_dt "
        sql += "   from cs_balance_change_his cbch  "
        sql += "  inner join cs_member cm  ON cm.m_seq = cbch.m_seq "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " ) cb ON cm.m_seq = cb.m_seq "
        sql += " inner join cs_bank ck ON cm.m_seq = ck.m_seq "
        if (!isNullOrEmpty(param.srchBuySts)) sql += " AND cb.sell_sts = '" + param.srchBuySts + "'"
        sql += " WHERE 1=1 "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "'"
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND csc.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND csc.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND cm.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND cm.mem_nm like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000047') sql += " AND cb.buy_num = '" + param.srchText + "'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(cb.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "

        sql += " ) t"

        sql += " order by t.create_dt desc "
        if (isNullOrEmpty(param.isExcel)) {
            sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage
        }
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

function fnGetCoinBuySts(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select ccs.sell_sts, ccs.m_seq, (select mem_id from cs_member cm where cm.m_seq = ccs.m_seq ) mem_id from  " + param.cs_coin_sell + " ccs "
        sql += " WHERE ccs.seq='" + param.buySeq + "' "

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

function fnUptCoinBuySts(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE " + param.cs_coin_sell + " SET  sell_sts='" + param.buySts + "', send_yn='Y', send_txid='" + param.sendTxid + "', update_dt=CURRENT_TIMESTAMP "
        sql += " WHERE seq='" + param.buySeq + "' "

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

function fnGetMasterCoinInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT coin_addr, coin_pk FROM cs_company "
        sql += " WHERE admin_grade='CMDT00000000000001' "

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

function fnGetClientCoinInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT cw.coin_addr, cw.coin_pk, cb.pay_num, cm.mem_id ,cm.cmpny_cd, cm.m_seq  FROM cs_wallet cw "
        sql += " inner join " + param.cs_coin_sell + " cb ON cb.seq = '" + param.buySeq + "' AND cw.m_seq = cb.m_seq "
        sql += " inner join cs_member cm ON cm.m_seq = cb.m_seq "

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetBalance(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select balance"
        sql += " from cs_balance_wallet where  m_seq = '" + param.mSeq + "' "

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnUptBalanceWallet(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " update cs_balance_wallet set  balance = " + param.totBalance + " where m_seq = '" + param.mSeq + "'"

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

function fnGetAlramStatus(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT ccs.seq , DATE_FORMAT(fn_get_time(ccs.create_dt), '%Y-%m-%d %H:%i:%s') alramDt "
        sql += " FROM " + param.cs_coin_sell + " ccs"
        sql += " WHERE 1=1 "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND ccs.m_seq in ( select m_seq from cs_member where cmpny_cd =  '" + param.cmpnyCd + "' )"
        sql += " AND ccs.sell_sts = 'CMDT00000000000024' "
        if (!isNullOrEmpty(param.alramDt)) sql += " AND DATE_FORMAT(fn_get_time(ccs.create_dt), '%Y-%m-%d %H:%i:%s') > '" + param.alramDt + "' "
        sql += " order by ccs.create_dt desc"
        sql += " limit 1"
        //console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnUptAlramStatus(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " update " + param.cs_coin_sell + " ccs set ccs.alram_yn = 'Y' "
        sql += " where 1=1  "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND ccs.m_seq in ( select m_seq from cs_member where cmpny_cd =  '" + param.cmpnyCd + "' )"
        sql += " AND ccs.sell_sts = 'CMDT00000000000024' "
        sql += " AND ccs.alram_yn = 'N'"
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

function fnGetSellSendCoinHisTot(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) toSum from ( "
        sql += " select cc.cmpny_id, cc.cmpny_nm,cm.mem_id , cm.mem_nm , case when sell_sts = 'CMDT00000000000027' then '판매 취소'  else '판매 승인' end sts,  "
        sql += " ccs.buy_num amt, ccs.pay_num coin ,ccs.create_dt  from " + param.cs_coin_sell + " ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += " union all "
        sql += " select cc.cmpny_id, cc.cmpny_nm,cm.mem_id , cm.mem_nm , case when sell_sts = 'CMDT00000000000027' then '판매 취소'  else '판매 승인' end sts,  "
        sql += " ccs.buy_num amt, ccs.pay_num coin ,ccs.create_dt  from cs_coin_sell ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += " ) t WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].toSum);
        });
    });
}

function fnGetSellSendCoinHis(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select *, DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d %H:%i:%s') use_dt from ( "
        sql += " select ccs.seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , case when sell_sts = 'CMDT00000000000027' then '판매 취소'  else '판매 승인' end sts,  "
        sql += " ccs.buy_num amt, ccs.pay_num coin , ccs.create_dt from " + param.cs_coin_sell + " ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += " union all "
        sql += " select ccs.seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , case when sell_sts = 'CMDT00000000000027' then '판매 취소'  else '판매 승인' end sts,  "
        sql += " ccs.buy_num amt, ccs.pay_num coin , ccs.create_dt from cs_coin_sell ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }

        sql += " ) t WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "
        sql += " order by t.create_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage

        console.log(sql);

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetTransSendCoinHisTot(param, conn) {
    return new Promise(function (resolve, reject) {

        var sql = " select count(1) tot_cnt from ( "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , '전환 승인' sts,   0 amt, cct.trans_num  coin , cct.create_dt from " + param.cs_coin_trans + " cct  "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' "
        sql += " union all "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , '전환 승인' sts,   0 amt, cct.trans_num  coin , cct.create_dt from cs_coin_trans cct  "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' "
        sql += " ) t "
        sql += "  WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "

        console.log(sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].tot_cnt);
        });
    });
}


function fnGetTransSendCoinHis(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select *, DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d %H:%i:%s') use_dt "
        sql += "from ( select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , '전환 승인' sts,   0 amt, cct.trans_num  coin , cct.create_dt from " + param.cs_coin_trans + " cct  "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' "
        sql += " union all "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , '전환 승인' sts,   0 amt, cct.trans_num  coin , cct.create_dt from cs_coin_trans cct  "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' "
        sql += " ) t WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "
        sql += " order by t.create_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage

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

function fnGetGubunAllSendCoinHisTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) totSum from ( "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id ,cm.mem_nm , ccs.create_dt from " + param.cs_coin_sell + " ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += " AND ccs.sell_sts IN ('CMDT00000000000026', 'CMDT00000000000027') "
        sql += "union all "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id ,cm.mem_nm ,cct.create_dt from " + param.cs_coin_trans + " cct "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' "

        sql += "union all "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id ,cm.mem_nm , ccs.create_dt from cs_coin_sell ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += " AND ccs.sell_sts IN ('CMDT00000000000026', 'CMDT00000000000027') "
        sql += "union all "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id ,cm.mem_nm ,cct.create_dt from cs_coin_trans cct "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' "

        sql += "union all "

        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm "
        sql += ",cbch.create_dt  "
        sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " where 1 = 1"
        sql += " and cbch.change_code = 'CMDT00000000000043'"
        sql += " and cbch.balance > 0 "

        sql += "union all "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm "
        sql += ", cbch.create_dt  "
        sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " where 1 = 1"
        sql += " and cbch.change_code = 'CMDT00000000000044'"
        sql += " and cbch.balance > 0 "

        sql += " ) t "

        sql += " WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totSum);
        });
    });
}

function fnGetGubunAllSendCoinHis(param, conn) {
    return new Promise(function (resolve, reject) {

        var sql = "select *, DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d %H:%i:%s') use_dt FROM  ( "
        sql += " select ccs.seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , case when sell_sts = 'CMDT00000000000027' then '판매 취소'  else '판매 승인' end sts,  "
        sql += " ccs.buy_num amt, ccs.pay_num coin ,ccs.create_dt  from " + param.cs_coin_sell + " ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += " AND ccs.sell_sts IN ('CMDT00000000000026', 'CMDT00000000000027') "
        sql += "union all "
        sql += " select '' seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , '전환 승인' sts,   0 amt, cct.trans_num  coin ,cct.create_dt from " + param.cs_coin_trans + " cct  "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' "

        sql += "union all "
        sql += " select ccs.seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , case when sell_sts = 'CMDT00000000000027' then '판매 취소'  else '판매 승인' end sts,  "
        sql += " ccs.buy_num amt, ccs.pay_num coin ,ccs.create_dt  from cs_coin_sell ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += " AND ccs.sell_sts IN ('CMDT00000000000026', 'CMDT00000000000027') "
        sql += "union all "
        sql += " select '' seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , '전환 승인' sts,   0 amt, cct.trans_num  coin ,cct.create_dt from cs_coin_trans cct  "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' "

        sql += "union all "
        sql += " select '' seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm "
        sql += ", '지급' sts "
        sql += ",  0 amt, cbch.balance   coin , cbch.create_dt "
        sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " where 1 = 1"
        sql += " and cbch.change_code = 'CMDT00000000000043'"
        sql += " and cbch.balance > 0 "

        sql += "union all "
        sql += " select '' seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm "
        sql += ", '차감' sts "
        sql += ",  0 amt, cbch.balance   coin , cbch.create_dt  "
        sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " where 1 = 1"
        sql += " and cbch.change_code = 'CMDT00000000000044'"
        sql += " and cbch.balance > 0 "

        sql += " ) t "

        sql += " WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "
        sql += " order by t.create_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage


        console.log(sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}


function fnGetCsSendSell(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select m_seq, pay_num, buy_num from " + param.cs_coin_sell + " where seq = '" + param.buySeq + "'   "


        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetIncreseDecreseTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = " select count(1) totSum from ( select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm "
        if (param.gubun == 'CMDT00000000000043') sql += ", '지급' sts "
        else if (param.gubun == 'CMDT00000000000044') sql += ", '차감' sts "
        sql += ",  0 amt, cbch.balance   coin ,cbch.create_dt  "
        sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " where 1 = 1"
        // 차감
        if (param.gubun == 'CMDT00000000000044') {
            sql += " and cbch.change_code = 'CMDT00000000000044'"
        } else if (param.gubun == 'CMDT00000000000043') { //지급
            sql += " and cbch.change_code = 'CMDT00000000000043'"
        }
        sql += " and cbch.balance > 0 "
        sql += " ) t "
        sql += "  WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }

        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "
        sql += " order by t.create_dt desc "


        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totSum);
        });
    });
}

function fnGetIncreseDecreseList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = " select * , DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') use_dt from ( select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm "
        if (param.gubun == 'CMDT00000000000043') sql += ", '지급' sts "
        else if (param.gubun == 'CMDT00000000000044') sql += ", '차감' sts "
        sql += ",  0 amt, cbch.balance   coin ,cbch.create_dt  "
        sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " where 1 = 1"
        // 차감
        if (param.gubun == 'CMDT00000000000044') {
            sql += " and cbch.change_code = 'CMDT00000000000044'"
        } else if (param.gubun == 'CMDT00000000000043') { //지급
            sql += " and cbch.change_code = 'CMDT00000000000043'"
        }

        sql += " and cbch.balance > 0 "
        sql += " ) t "
        sql += "  WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }

        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "
        sql += " order by t.create_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage


        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}


function fnSetCoinSendHis(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_" + cointable + "_send_his "
        sql += " (txid, coin_info, tx_desc, user_id, confirm_yn ,to_address, from_address, balance, cmpny_cd, member_yn,refrence_code) "
        sql += " VALUES ('" + param.txid + "'"
        sql += " ,'" + param.coinInfo + "'"
        sql += " ,'" + param.output + "','" + param.userId + "','Y', '" + param.toAddress + "','" + param.fromAddress + "','" + param.balance + "','" + param.cmpnyCd + "','" + param.memberYN + "'"
        sql += " ,'" + param.refrenceCode + "'"
        sql += ")"

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


function fnGetGubunAllSendCoinHisTotalOld(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) totSum from ( "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id ,cm.mem_nm , ccs.create_dt from cs_coin_sell_log ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += " AND ccs.sell_sts IN ('CMDT00000000000026', 'CMDT00000000000027') "

        sql += "union all "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id ,cm.mem_nm , ccs.create_dt from "+param.cs_coin_sell+" ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += " AND ccs.sell_sts IN ('CMDT00000000000026', 'CMDT00000000000027') "

        sql += "union all "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id ,cm.mem_nm ,cct.create_dt from cs_coin_trans_log cct "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' "

        sql += "union all "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm "
        sql += ",cbch.create_dt  "
        sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " where 1 = 1"
        sql += " and cbch.change_code = 'CMDT00000000000043'"
        sql += " and cbch.balance > 0 "

        sql += "union all "
        sql += " select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm "
        sql += ", cbch.create_dt  "
        sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " where 1 = 1"
        sql += " and cbch.change_code = 'CMDT00000000000044'"
        sql += " and cbch.balance > 0 "

        sql += " ) t "

        sql += " WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totSum);
        });
    });
}

function fnGetSellSendCoinHisTotOld(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) toSum from ( select cc.cmpny_id, cc.cmpny_nm,cm.mem_id , cm.mem_nm , case when sell_sts = 'CMDT00000000000027' then '판매 취소'  else '판매 승인' end sts,  "
        sql += " ccs.buy_num amt, ccs.pay_num coin ,ccs.create_dt  from cs_coin_sell_log ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += " ) t WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].toSum);
        });
    });
}

function fnGetTransSendCoinHisTotOld(param, conn) {
    return new Promise(function (resolve, reject) {

        var sql = " select count(1) tot_cnt "
        sql += "from ( select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , '전환 승인' sts,   0 amt, cct.trans_num  coin , cct.create_dt from cs_coin_trans_log cct  "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' ) t "
        sql += "  WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "

        console.log(sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].tot_cnt);
        });
    });
}


function fnGetGubunAllSendCoinHisOld(param, conn) {
    return new Promise(function (resolve, reject) {

        var sql = "select *, DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d %H:%i:%s') use_dt FROM  ( "
        sql += " select ccs.seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , case when sell_sts = 'CMDT00000000000027' then '판매 취소'  else '판매 승인' end sts,  "
        sql += " ccs.buy_num amt, ccs.pay_num coin ,ccs.create_dt  from cs_coin_sell_log ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += " AND ccs.sell_sts IN ('CMDT00000000000026', 'CMDT00000000000027') "

        sql += "union all "
        sql += " select ccs.seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , case when sell_sts = 'CMDT00000000000027' then '판매 취소'  else '판매 승인' end sts,  "
        sql += " ccs.buy_num amt, ccs.pay_num coin ,ccs.create_dt  from "+ param.cs_coin_sell+" ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '"+param.cmpnyCd+"' "
        }
        sql += " AND ccs.sell_sts IN ('CMDT00000000000026', 'CMDT00000000000027') "

        sql += "union all "
        sql += " select '' seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , '전환 승인' sts,   0 amt, cct.trans_num  coin ,cct.create_dt from cs_coin_trans_log cct  "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' "

        sql += "union all "
        sql += " select '' seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , '전환 승인' sts,   0 amt, cct.trans_num  coin ,cct.create_dt from "+param.cs_coin_trans+" cct  "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on  cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' "

        sql += "union all "
        sql += " select '' seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm "
        sql += ", '지급' sts "
        sql += ",  0 amt, cbch.balance   coin , cbch.create_dt "
        sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " where 1 = 1"
        sql += " and cbch.change_code = 'CMDT00000000000043'"
        sql += " and cbch.balance > 0 "

        sql += "union all "
        sql += " select '' seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm "
        sql += ", '차감' sts "
        sql += ",  0 amt, cbch.balance   coin , cbch.create_dt  "
        sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " where 1 = 1"
        sql += " and cbch.change_code = 'CMDT00000000000044'"
        sql += " and cbch.balance > 0 "

        sql += " ) t "

        sql += " WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "
        sql += " order by t.create_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage


        console.log(sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetSellSendCoinHisOld(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select *, DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d %H:%i:%s') use_dt "
        sql += " from ( select ccs.seq, cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , case when sell_sts = 'CMDT00000000000027' then '판매 취소'  else '판매 승인' end sts,  "
        sql += " ccs.buy_num amt, ccs.pay_num coin , ccs.create_dt from cs_coin_sell_log ccs "
        sql += " inner join cs_member cm on cm.m_seq = ccs.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }

        sql += " ) t WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "
        sql += " order by t.create_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage

        console.log(sql);

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetTransSendCoinHisOld(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select *, DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d %H:%i:%s') use_dt "
        sql += "from ( select cc.cmpny_id, cc.cmpny_nm, cm.mem_id , cm.mem_nm , '전환 승인' sts,   0 amt, cct.trans_num  coin , cct.create_dt from cs_coin_trans_log cct  "
        sql += " inner join cs_member cm on  cm.m_seq = cct.m_seq "
        sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
        if (!isNullOrEmpty(param.cmpnyCd)) {
            sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "' "
        }
        sql += "  where cct.trans_yn ='Y' ) t "
        sql += "  WHERE 1=1 "
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND t.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND t.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND t.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND t.mem_nm like '%" + param.srchText + "%'"
        }
        sql += "   and DATE_FORMAT(fn_get_time(t.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "
        sql += " order by t.create_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage

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

function fnUptNftBuy(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "update cs_nft_buy set";
        sql += " buy_status = '"+param.buyStatus+"'";
        sql += " where 1=1";
        sql += " and coin_sell_seq = '"+param.coinSellSeq+"'";

        console.log('sql:' +sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetNftBuyList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select cns.nft_img, cns.nft_nm, cnb.buy_amount, cns.sell_price from cs_nft_buy cnb";
        sql += " left join cs_nft_sell cns on cns.sell_seq = cnb.sell_seq"
        sql += " where 1=1";
        sql += " and cnb.coin_sell_seq = '"+param.seq+"'";

        console.log('sql:' +sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

module.exports.QGetTransSendCoinHisOld = fnGetTransSendCoinHisOld
module.exports.QGetSellSendCoinHisOld = fnGetSellSendCoinHisOld
module.exports.QGetGubunAllSendCoinHisOld = fnGetGubunAllSendCoinHisOld;
module.exports.QGetTransSendCoinHisTotOld = fnGetTransSendCoinHisTotOld;
module.exports.QGetSellSendCoinHisTotOld = fnGetSellSendCoinHisTotOld;
module.exports.QGetGubunAllSendCoinHisTotalOld = fnGetGubunAllSendCoinHisTotalOld;


module.exports.QGetCoinTotal = fnGetCoinTotal;
module.exports.QGetCoinList = fnGetCoinList;

module.exports.QUptCoinBuySts = fnUptCoinBuySts;
module.exports.QGetMasterCoinInfo = fnGetMasterCoinInfo;
module.exports.QGetClientCoinInfo = fnGetClientCoinInfo;

module.exports.QGetAlramStatus = fnGetAlramStatus;

module.exports.QGetSellSendCoinHisTot = fnGetSellSendCoinHisTot;
module.exports.QGetSellSendCoinHis = fnGetSellSendCoinHis;
module.exports.QGetTransSendCoinHisTot = fnGetTransSendCoinHisTot;
module.exports.QGetTransSendCoinHis = fnGetTransSendCoinHis;

module.exports.QGetBalance = fnGetBalance;
module.exports.QUptBalanceWallet = fnUptBalanceWallet;
module.exports.QGetCsSendSell = fnGetCsSendSell;

module.exports.QUptAlramStatus = fnUptAlramStatus;

module.exports.QGetGubunAllSendCoinHis = fnGetGubunAllSendCoinHis;
module.exports.QGetGubunAllSendCoinHisTotal = fnGetGubunAllSendCoinHisTotal;

module.exports.QGetIncreseDecreseTotal = fnGetIncreseDecreseTotal;
module.exports.QGetIncreseDecreseList = fnGetIncreseDecreseList;

module.exports.QGetCoinBuySts = fnGetCoinBuySts;
module.exports.QSetCoinSendHis = fnSetCoinSendHis;
module.exports.QUptNftBuy = fnUptNftBuy;
module.exports.QGetNftBuyList = fnGetNftBuyList;