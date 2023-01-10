var isNullOrEmpty = require('is-null-or-empty');
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('adm.properties');
const cointable = properties.get('com.coin.cointable');

function fnGetMemTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT count(1) totSum "
        sql += " FROM cs_member cm inner join cs_company csc ON cm.cmpny_cd = csc.cmpny_cd "
        // sql += " inner join cs_wallet cw ON cm.m_seq = cw.m_seq "
        sql += " inner join cs_bank cb ON cm.m_seq = cb.m_seq "
        sql += " inner join cs_balance_wallet cbw on cm.m_seq = cbw.m_seq "
        sql += " WHERE 1=1 "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "'"
        if (!isNullOrEmpty(param.isCoin) && param.isCoin == 1) sql += " AND cbw.balance > 0 "
        else if (!isNullOrEmpty(param.isCoin) && param.isCoin == 0) sql += " AND cbw.balance = 0 "
        if (!isNullOrEmpty(param.status)) sql += " AND cm.mem_status = '" + param.status + "'"
        sql += " AND cm.admin_grade = 'CMDT00000000000000'"
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND csc.cmpny_id  like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND csc.cmpny_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND cm.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND cm.mem_nm like '%" + param.srchText + "%'"
        }


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

function fnGetMemList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select * from ( SELECT csc.cmpny_cd,csc.cmpny_id, csc.cmpny_nm, cm.m_seq , cm.mem_id, cm.mem_status, cm.mem_pass, cm.salt, cm.mem_nm, cm.mem_hp, cm.mem_email, nation, fn_get_name(cm.nation) nation_name ,cm.admin_grade, fn_get_name(cm.admin_grade) admin_grade_name, DATE_FORMAT(fn_get_time(cm.create_dt), '%Y-%m-%d %H:%i:%s') create_dt "
        // sql += " , cw.coin_addr, cb.bank_info,cb.bank_acc,cb.acc_nm, concat(cb.bank_info,' ',cb.bank_acc,' ',cb.acc_nm) banks , cbw.balance "
        sql += " , cb.bank_info,cb.bank_acc,cb.acc_nm, concat(cb.bank_info,' ',cb.bank_acc,' ',cb.acc_nm) banks , cbw.balance "
        sql += ", concat(cnb.bank_nm,' ',cnb.bank_acc,' ',cnb.acc_nm) nftBanks"
        sql += " FROM cs_member cm inner join cs_company csc ON cm.cmpny_cd = csc.cmpny_cd "
        sql += " left join cs_nft_bank cnb on cm.bank_seq = cnb.seq"
        // sql += " inner join cs_wallet cw ON cm.m_seq = cw.m_seq "
        sql += " inner join cs_bank cb ON cm.m_seq = cb.m_seq "
        sql += " inner join cs_balance_wallet cbw on cm.m_seq = cbw.m_seq "
        sql += " WHERE 1=1 "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "'"
        if (!isNullOrEmpty(param.isCoin) && param.isCoin == 1) sql += " AND cbw.balance > 0 "
        else if (!isNullOrEmpty(param.isCoin) && param.isCoin == 0) sql += " AND cbw.balance = 0 "
        if (!isNullOrEmpty(param.status)) sql += " AND cm.mem_status = '" + param.status + "'"
        sql += " AND cm.admin_grade = 'CMDT00000000000000'"
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND csc.cmpny_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND csc.cmpny_nm like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND cm.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND cm.mem_nm like '%" + param.srchText + "%'"
        }
        sql += " ) t "
        sql += " order by t.balance desc, t.create_dt desc"
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

function fnGetExcelMemList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select * from ( SELECT csc.cmpny_cd,csc.cmpny_id, csc.cmpny_nm, cm.m_seq , cm.mem_id, cm.mem_pass, cm.salt, cm.mem_nm, cm.mem_hp, cm.mem_email, nation, fn_get_name(cm.nation) nation_name ,cm.admin_grade, fn_get_name(cm.admin_grade) admin_grade_name, DATE_FORMAT(fn_get_time(cm.create_dt), '%Y-%m-%d') create_dt "
        sql += " , cb.bank_info,cb.bank_acc,cb.acc_nm, concat(cb.bank_info,' ',cb.bank_acc,' ',cb.acc_nm) banks , cbw.balance "
        sql += " FROM cs_member cm inner join cs_company csc ON cm.cmpny_cd = csc.cmpny_cd "
        // sql += " inner join cs_wallet cw ON cm.m_seq = cw.m_seq "
        sql += " inner join cs_bank cb ON cm.m_seq = cb.m_seq "
        sql += " inner join cs_balance_wallet cbw on cm.m_seq = cbw.m_seq "
        sql += " WHERE 1=1 "
        if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cm.cmpny_cd = '" + param.cmpnyCd + "'"
        if (!isNullOrEmpty(param.isCoin) && param.isCoin == 1) sql += " AND cbw.balance > 0 "
        else if (!isNullOrEmpty(param.isCoin) && param.isCoin == 0) sql += " AND cbw.balance = 0 "
        if (!isNullOrEmpty(param.status)) sql += " AND cm.mem_status = '" + param.status + "'"
        sql += " AND cm.admin_grade = 'CMDT00000000000000'"
        if (param.srchOption) {
            if (param.srchOption == 'CMDT00000000000045') sql += " AND csc.cmpny_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000046') sql += " AND csc.cmpny_nm like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000019') sql += " AND cm.mem_id like '%" + param.srchText + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND cm.mem_nm like '%" + param.srchText + "%'"
        }
        sql += " ) t "
        sql += " order by t.balance desc, t.create_dt desc"

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

function fnSetAdminMember(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_member"
        sql += " (m_seq, cmpny_cd, mem_id, mem_pass, salt, mem_nm, mem_hp, mem_email, nation, admin_grade) "
        sql += " VALUES('" + param.mSeq + "', '" + param.cmpnyCd + "', '" + param.memId + "', '" + param.memPass + "', '" + param.salt + "' "
        sql += " , '" + param.memNm + "' , '" + param.memHp + "', '', '" + param.nation + "', 'CMDT00000000000034')  "

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

function fnSetMember(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_member"
        sql += " (m_seq, cmpny_cd, mem_id, mem_pass, salt, mem_nm, mem_hp, mem_email, nation) "
        sql += " VALUES('" + param.mSeq + "', '" + param.cmpnyCd + "', '" + param.memId + "', '" + param.memPass + "', '" + param.salt + "' "
        sql += " , '" + param.memNm + "' , '" + param.memHp + "', '', '" + param.nation + "')  "

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

function fnUptPassMember(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_member SET mem_pass = '" + param.memPass + "' , salt = '" + param.salt + "' "
        sql += " where m_seq = '" + param.mSeq + "'"

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

function fnUptAdminPassMember(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_company SET cmpny_password = '" + param.memPass + "' , cmpny_salt = '" + param.salt + "' "
        sql += " where cmpny_cd = '" + param.cmpnyCd + "'"

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

function fnSetWallet(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_wallet"
        sql += " (m_seq, coin_typ, coin_addr, coin_pk) "
        sql += " VALUES('" + param.mSeq + "', '" + param.coinTyp + "', '" + param.cmpnyAddr + "', '" + param.cmpnyPk + "')  "

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

function fnUptWallet(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_wallet set"
        sql += " coin_addr= '" + param.cmpnyAddr + "', coin_pk ='" + param.cmpnyPk + "' "
        sql += " where seq = '" + param.walletSeq + "'"

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

function fnSetBank(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_bank"
        sql += " (m_seq, bank_info, bank_acc, acc_nm) "
        sql += " VALUES('" + param.mSeq + "', '" + param.bankInfo + "', '" + param.bankAcc + "', '" + param.accNm + "')  "

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

function fnUptMember(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_member SET"
        sql += " update_dt = CURRENT_TIMESTAMP  "
        if (!param.memPass == "") {
            sql += " , mem_pass = '" + param.memPass + "', salt = '" + param.salt + "' "
        }
        sql += " ,mem_nm ='" + param.memNm + "', mem_hp ='" + param.memHp + "',mem_email ='" + param.memEmail + "', nation='" + param.nation + "'"
        sql += " where m_seq = '" + param.mSeq + "'";
        sql += " and cmpny_cd = '" + param.cmpnyCd + "'";

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

function fnUptBank(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_bank SET"
        sql += " bank_info='" + param.bankInfo + "', bank_acc= '" + param.bankAcc + "', acc_nm = '" + param.accNm + "'"
        sql += " where m_seq = '" + param.mSeq + "'";
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

function fnGetWallet(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT seq, coin_typ, fn_get_name(coin_typ) coin_typ_name, coin_addr , coin_pk"
        sql += " FROM cs_wallet "
        sql += " WHERE m_seq = '" + param.mSeq + "'"

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


function fnGetCoinBuyList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT seq, m_seq, buy_num, pay_num, bonus, usd_cost, krw_cost, in_mthd, fn_get_name(in_mthd) in_mthd_name "
        sql += " , sell_sts, fn_get_name(sell_sts) sell_sts_name,  create_dt "
        sql += " FROM " + param.cs_coin_sell
        sql += " WHERE m_seq = '" + param.mSeq + "'"

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

function fnGetBalance(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select balance"
        sql += " from cs_balance_wallet where  m_seq = '" + param.mSeq + "' "

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetTransBalance(param, conn) {
    return new Promise(function (resolve, reject) {
        //ifnull(sum(ccsh.balance), 0)
        var sql = " select ifnull(sum(ccsh.balance), 0) balance from cs_" + cointable + "_send_his ccsh , cs_member cm where ccsh.cmpny_cd = cm.cmpny_cd and ccsh.user_id = cm.mem_id " +
            " and cm.m_seq = '" + param.mSeq + "' and confirm_yn ='N' ";

        console.log(sql)
        conn.query(sql, (err, ret) => {
            console.log(ret);
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnUptBalance(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " update  cs_balance_wallet set balance = '" + param.amt + "'"
        sql += " where  m_seq = '" + param.mSeq + "' "

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

function fnInsBalanceChangeHis(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_balance_change_his "
        sql += "(m_seq, change_code, change_desc, balance) "
        sql += " VALUES('" + param.mSeq + "', '" + param.changeCode + "', '" + param.changeDesc + "', '" + param.coinBalance + "') "


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

function fnInsMeberBalance(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_balance_wallet "
        sql += " (m_seq, balance) "
        sql += " VALUES('" + param.mSeq + "', " + param.balance + ") "

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}


function fnGetMemHistoryTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) totCnt from ( "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') as use_date,  pay_num as amt,m_seq , create_dt from " + param.cs_coin_sell + " ccs where ccs.m_seq ='" + param.mSeq + "' and ccs.sell_sts = 'CMDT00000000000026'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') as use_date,  pay_num as amt,m_seq , create_dt from " + param.cs_coin_sell + " ccs where ccs.m_seq ='" + param.mSeq + "' and ccs.sell_sts = 'CMDT00000000000027'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') as use_date, trans_num as amt, m_seq , create_dt from " + param.cs_coin_trans + " cct where cct.m_seq ='" + param.mSeq + "'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') as use_date,  pay_num as amt,m_seq , create_dt from cs_coin_sell ccs where ccs.m_seq ='" + param.mSeq + "' and ccs.sell_sts = 'CMDT00000000000026'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') as use_date,  pay_num as amt,m_seq , create_dt from cs_coin_sell ccs where ccs.m_seq ='" + param.mSeq + "' and ccs.sell_sts = 'CMDT00000000000027'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') as use_date, trans_num as amt, m_seq , create_dt from cs_coin_trans cct where cct.m_seq ='" + param.mSeq + "'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') as use_date,  ifnull(balance,0) as amt , m_seq , create_dt from cs_balance_change_his cbch where cbch.m_seq ='" + param.mSeq + "' and change_code ='CMDT00000000000043' "
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d') as use_date,  ifnull(balance,0) as amt , m_seq , create_dt from cs_balance_change_his cbch where cbch.m_seq ='" + param.mSeq + "' and change_code ='CMDT00000000000044' "

        sql += " ) T "
        //sql += " where T.use_date =  DATE_FORMAT(fn_get_time(now()), '%Y-%m-%d')"

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totCnt);
        });
    });
}

function fnGetMemHistory(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select * from ( "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d %T') as use_date, '구매' type_info, pay_num as amt,m_seq , create_dt from " + param.cs_coin_sell + " ccs where ccs.m_seq ='" + param.mSeq + "' and ccs.sell_sts = 'CMDT00000000000026'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d %T') as use_date, '취소' type_info, pay_num as amt,m_seq , create_dt from " + param.cs_coin_sell + " ccs where ccs.m_seq ='" + param.mSeq + "' and ccs.sell_sts = 'CMDT00000000000027'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d %T') as use_date, '전환' type_info, trans_num as amt, m_seq , create_dt from " + param.cs_coin_trans + " cct where cct.m_seq ='" + param.mSeq + "'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d %T') as use_date, '구매' type_info, pay_num as amt,m_seq , create_dt from cs_coin_sell ccs where ccs.m_seq ='" + param.mSeq + "' and ccs.sell_sts = 'CMDT00000000000026'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d %T') as use_date, '취소' type_info, pay_num as amt,m_seq , create_dt from cs_coin_sell ccs where ccs.m_seq ='" + param.mSeq + "' and ccs.sell_sts = 'CMDT00000000000027'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d %T') as use_date, '전환' type_info, trans_num as amt, m_seq , create_dt from cs_coin_trans cct where cct.m_seq ='" + param.mSeq + "'"
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d %T') as use_date, '증감' type_info, ifnull(balance,0) as amt , m_seq , create_dt from cs_balance_change_his cbch where cbch.m_seq ='" + param.mSeq + "' and change_code ='CMDT00000000000043' "
        sql += " union all "
        sql += " select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d %T') as use_date, '차감' type_info, ifnull(balance,0) as amt , m_seq , create_dt from cs_balance_change_his cbch where cbch.m_seq ='" + param.mSeq + "' and change_code ='CMDT00000000000044' "

        sql += " ) T "
        // sql += " where T.use_date =  DATE_FORMAT(fn_get_time(now()), '%Y-%m-%d')"
        sql += " order by create_dt desc "
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

function fnSetMemStatus(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " update cs_member set mem_status = '" + param.memStatus + "'"
        sql += " where cmpny_cd = '" + param.cmpnyCd + "' and mem_id = '" + param.memId + "'"

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


function fnGetIpListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        sql = " select count(1) totCnt from cs_ip_list where cmpny_cd ='" + param.cmpnyCd + "' and delete_yn = 'N' "
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totCnt);
        });
    });
}

function fnGetIpList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select * from ( "
        sql += " select seq, admin_ip, DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d %H:%i:%s') create_dt from cs_ip_list where cmpny_cd ='" + param.cmpnyCd + "' and delete_yn = 'N' "
        sql += " ) T "
        sql += " order by create_dt desc "
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

function fnDeleteIp(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " update cs_ip_list set delete_yn = 'Y' "
        sql += " where seq = '" + param.seq + "'"

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

function fnInsAdminIp(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " insert into cs_ip_list (cmpny_cd, admin_ip, delete_yn) values ('" + param.cmpnyCd + "', '" + param.adminIp + "', 'N') "

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

function fnGetUserLogTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = ' select count(*) as totSum  ';
        sql += ' from cs_pay_history cph ';
        sql += " WHERE cph.cmpny_cd = '" + param.cmpnyCd + "' ";
        if (param.srchOption == 'CMDT00000000000019') {
            sql += " AND cph.pay_request like '%" + param.srchText + "%'";
        }
        if (param.srchOption == 'userIP')
            sql += " AND cph.user_ip like '%" + param.srchText + "%'";
        if (param.pay_code != '') {
            sql += " AND cph.pay_code like '%" + param.pay_code + "%'";
        }

        sql += "   AND DATE_FORMAT(fn_get_time(cph.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "
        sql += ' order by create_dt desc ';

        console.log(sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret[0].totSum);
        });
    });
}

function fnGetUserLog(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql =
            " select cph.pay_request, cph.pay_code,cph.pay_response, cph.user_ip, cph.is_success, DATE_FORMAT(cph.create_dt, '%Y-%m-%d %H:%i:%s') as create_dt  ";
        sql += ' from cs_pay_history cph ';
        sql += " WHERE cph.cmpny_cd = '" + param.cmpnyCd + "' ";
        if (param.srchOption == 'CMDT00000000000019') {
            sql += " AND cph.pay_request like '%" + param.srchText + "%'";
        }
        if (param.srchOption == 'userIP')
            sql += " AND cph.user_ip like '%" + param.srchText + "%'";
        if (param.pay_code != '') {
            sql += " AND cph.pay_code like '%" + param.pay_code + "%'";
        }
        sql += "   AND DATE_FORMAT(fn_get_time(cph.create_dt), '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') "
        sql += ' order by create_dt desc ';

        sql +=
            ' limit ' +
            (param.pageIndex - 1) * param.rowsPerPage +
            ',' +
            param.rowsPerPage;

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

function fnGetUserLogExcelMemList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql =
            " select cph.pay_request, cph.pay_code,cph.pay_response, cph.user_ip, cph.is_success, DATE_FORMAT(cph.create_dt, '%Y-%m-%d %H:%i:%s') as create_dt  ";
        sql += ' from cs_pay_history cph ';
        sql += " WHERE cph.cmpny_cd = '" + param.cmpnyCd + "' ";
        if (param.srchOption == 'CMDT00000000000019') {
            sql += " AND cph.pay_request like '%" + param.srchText + "%'";
        }
        if (param.srchOption == 'userIP')
            sql += " AND cph.user_ip like '%" + param.srchText + "%'";

        sql += ' order by create_dt desc ';

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

function fnGetUserIpListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        sql = " select count(1) totCnt from cs_block_ip where cmpny_cd ='" + param.cmpnyCd + "' and delete_yn = 'N' "
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totCnt);
        });
    });
}

function fnGetUserIpList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select * from ( "
        sql += " select seq, user_ip, DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d %H:%i:%s') create_dt from cs_block_ip where cmpny_cd ='" + param.cmpnyCd + "' and delete_yn = 'N' "
        sql += " ) T "
        sql += " order by create_dt desc "
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

function fnDeleteUserIp(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " update cs_block_ip set delete_yn = 'Y' "
        sql += " where seq = '" + param.seq + "'"

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

function fnInsUserIp(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " insert into cs_block_ip (cmpny_cd, user_ip, delete_yn) values ('" + param.cmpnyCd + "', '" + param.userIp + "', 'N') "

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


function fnGetAccListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        sql = " select count(1) totCnt from cs_bank where replace(replace(bank_acc, ' ', ''), '-', '') = replace(replace('" + param.userAcc + "', ' ', ''), '-', '') "

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totCnt);
        });
    });
}

function fnGetAccList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select * from ( "
        sql += " select m_seq, bank_info, bank_acc, acc_nm, (select cmpny_nm from cs_company where cmpny_cd = (select cmpny_cd from cs_member where m_seq = cb.m_seq)) cmpny_nm "
        sql += ", (select mem_id from cs_member where m_seq = cb.m_seq) mem_id, create_dt "
        sql += " from cs_bank cb where replace(replace(bank_acc, ' ', ''), '-', '') = replace(replace('" + param.userAcc + "', ' ', ''), '-', '') "
        sql += " ) T "
        sql += " order by create_dt desc "
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

function fnSetAccBlock(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " update cs_member set mem_status = '" + param.memStatus + "'  "
        sql += " where m_seq in (select m_seq from cs_bank where replace(replace(bank_acc,' ',''),'-','') = replace(replace('" + param.userAcc + "',' ',''),'-','')) "


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

function fnGetSellerListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        sql = " select count(1) totCnt from cs_seller "
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totCnt);
        });
    });
}

function fnGetSellerList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select * from ( "
        sql += " select seller_id, seller_bank, seller_acc, seller_name, eth_addr, create_dt, "
        sql += " (select seller_seq from cs_company cc where cc.seller_seq = cs.seq and cc.cmpny_cd = '" + param.cmpnyCd + "') seller_seq from cs_seller cs "
        sql += " ) T "
        sql += " order by seller_seq desc, create_dt desc "
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

function fnGetUserAddr(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select eth_addr, eth_pk from cs_wallet where m_seq = '" + param.mSeq + "'"

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

function fnSetUserAddr(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " update cs_wallet set eth_addr = '" + param.ethAddr + "', eth_pk = '" + param.ethPk + "' where m_seq = '" + param.mSeq + "'"

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

function fnUptUserNftBank(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "update cs_member set";
        sql += " bank_seq ='"+param.bank_seq+"'";
        sql += " where 1=1";
        sql += " and m_seq = '"+param.mSeq+"'";

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

module.exports.QSetUserAddr = fnSetUserAddr;
module.exports.QGetUserAddr = fnGetUserAddr;
module.exports.QGetSellerListTotal = fnGetSellerListTotal;
module.exports.QGetSellerList = fnGetSellerList;
module.exports.QSetAccBlock = fnSetAccBlock;
module.exports.QGetAccListTotal = fnGetAccListTotal;
module.exports.QGetAccList = fnGetAccList;
module.exports.QDeleteUserIp = fnDeleteUserIp;
module.exports.QInsUserIp = fnInsUserIp;
module.exports.QGetUserIpListTotal = fnGetUserIpListTotal;
module.exports.QGetUserIpList = fnGetUserIpList;
module.exports.QGetUserLog = fnGetUserLog;
module.exports.QGetUserLogTotal = fnGetUserLogTotal;
module.exports.QGetUserLogExcelMemList = fnGetUserLogExcelMemList;
module.exports.QDeleteIp = fnDeleteIp;
module.exports.QInsAdminIp = fnInsAdminIp;
module.exports.QGetIpListTotal = fnGetIpListTotal;
module.exports.QGetIpList = fnGetIpList;
module.exports.QGetMemTotal = fnGetMemTotal;
module.exports.QGetMemberList = fnGetMemList;
module.exports.QSetMember = fnSetMember;
module.exports.QSetWallet = fnSetWallet;
module.exports.QSetBank = fnSetBank;
module.exports.QUptMember = fnUptMember;
module.exports.QUptBank = fnUptBank;
module.exports.QGetWallet = fnGetWallet;
module.exports.QUptWallet = fnUptWallet;
module.exports.QGetCoinBuyList = fnGetCoinBuyList;
module.exports.QGetBalance = fnGetBalance;
module.exports.QInsMeberBalance = fnInsMeberBalance;
module.exports.QUptBalance = fnUptBalance;
module.exports.QInsBalanceChangeHis = fnInsBalanceChangeHis;
module.exports.QGetMemHistory = fnGetMemHistory;
module.exports.QGetMemHistoryTotal = fnGetMemHistoryTotal;
module.exports.QUptPassMember = fnUptPassMember;
module.exports.QGetExcelMemList = fnGetExcelMemList;
module.exports.QSetMemStatus = fnSetMemStatus;
module.exports.QGetTransBalance = fnGetTransBalance;
module.exports.QUptAdminPassMember = fnUptAdminPassMember;
module.exports.QSetAdminMember = fnSetAdminMember;
module.exports.QUptUserNftBank = fnUptUserNftBank;