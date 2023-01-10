

var isNullOrEmpty = require('is-null-or-empty');
/*
* properties
*/
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('adm.properties');
const cointable = properties.get('com.coin.cointable');

function fnGetTotSaleCacl(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select sum(cs.buy_num) tot_buy_num "
    sql += "  , sum( cs.pay_num) tot_pay_num     "    
    sql += "  from "+param.cs_coin_sell+" cs "    
    sql += "   where 1=1  "
    
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " and m_seq in (select m_seq from cs_member cm where cmpny_cd = '"+param.cmpnyCd+"') "   
    // if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND (select cmpny_cd from cs_member cm where cm.m_seq = cs.m_seq) = '"+param.cmpnyCd+"'"     
    sql += "  and cs.sell_sts = 'CMDT00000000000026'  "  //입금완료 
    sql += "  and DATE_FORMAT(fn_get_time(cs.update_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d') "
    
   
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

function fnGetTotTransCacl(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select sum(trans_num)  tot_trans_num "
    sql += "  from "+param.cs_coin_trans+" cct inner join cs_" + cointable + "_send_his cch on cct.trans_seq = cch.txid and cch.confirm_yn = 'Y'"
    sql += "   where 1=1  "  
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cct.cmpny_cd = '"+param.cmpnyCd+"'"  
    // if (!isNullOrEmpty(param.cmpnyCd)) sql += " and m_seq in (select m_seq from cs_member cm where cmpny_cd = '"+param.cmpnyCd+"') "     
    // if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND (select cmpny_cd from cs_member cm where cm.m_seq = cct.m_seq) = '"+param.cmpnyCd+"'"     
    sql += "   and DATE_FORMAT(fn_get_time(cct.create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')  "
  
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

function fnGetSaleCaclTotal(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select count(1) totSum from "
    sql += " ( select cs.m_seq, sum(cs.buy_num) buy_num "
    sql += "  , sum( cs.pay_num) obj     "    
    sql += "  from "+param.cs_coin_sell+" cs "
    
    sql += "   where 1=1  "
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " and m_seq in (select m_seq from cs_member cm where cmpny_cd = '"+param.cmpnyCd+"') "   
    // if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND (select cmpny_cd from cs_member cm where cm.m_seq = cs.m_seq) = '"+param.cmpnyCd+"'"  
    
    sql += "  and cs.sell_sts = 'CMDT00000000000026'  "  //입금완료 
    sql += "   and DATE_FORMAT(fn_get_time(cs.update_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d') "
    sql += "  group by cs.m_seq  ) t inner join cs_member cm on cm.m_seq = t.m_seq "
   
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

function fnGetSaleCaclList(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select cm.mem_id, cm.mem_nm "
    sql += " ,(select cmpny_id from cs_company cc where cm.cmpny_cd = cc.cmpny_cd ) cmpny_id "
    sql += " ,(select cmpny_nm from cs_company cc where cm.cmpny_cd = cc.cmpny_cd ) cmpny_nm "
    sql += " , t.buy_num, t.send_num from  "
    sql += " ( select cs.m_seq, sum(cs.buy_num) buy_num "
    sql += "  , sum( cs.pay_num) send_num     "    
    sql += "  from "+param.cs_coin_sell+" cs "
    
    sql += "   where 1=1  "
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " and m_seq in (select m_seq from cs_member cm where cmpny_cd = '"+param.cmpnyCd+"') "   
    // if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND (select cmpny_cd from cs_member cm where cm.m_seq = cs.m_seq) = '"+param.cmpnyCd+"'"     
    
    sql += "  and cs.sell_sts = 'CMDT00000000000026'  "  //입금완료 
    sql += "   and DATE_FORMAT(fn_get_time(cs.update_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')  "
    sql += "  group by cs.m_seq  ) t inner join cs_member cm on cm.m_seq = t.m_seq "
    sql += " order by cm.mem_nm asc "
    sql += " limit "+(param.pageIndex-1)*param.rowsPerPage +","+param.rowsPerPage

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

function fnGetTransCaclTotal(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select count(1) totSum "
    sql += " ,(select mem_id from cs_member cm where t.m_seq = cm.m_seq ) mem_id "
    sql += " ,(select mem_nm from cs_member cm where t.m_seq = cm.m_seq ) mem_nm "
    sql += " ,(select cmpny_id from cs_company cc where t.cmpny_cd = cc.cmpny_cd ) cmpny_id "
    sql += " ,(select cmpny_nm from cs_company cc where t.cmpny_cd = cc.cmpny_cd ) cmpny_nm " 
    sql += " from ( select cct.cmpny_cd , cct.m_seq, sum(cct.trans_num) trans_num "   
    sql += "  from "+param.cs_coin_trans+" cct "
    sql += "   where 1=1  "  
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cct.cmpny_cd = '"+param.cmpnyCd+"'"  
    // if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND (select cmpny_cd from cs_member cm where cm.m_seq = cct.m_seq) = '"+param.cmpnyCd+"'"    
    sql += "   and DATE_FORMAT(fn_get_time(cct.create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d') "
    sql += "  group by cct.cmpny_cd , cct.m_seq  ) t  "

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

function fnGetTransCaclList(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = "select * from ( select t.trans_num as send_num, (t.trans_num*10000) as buy_num  "
    sql += " ,(select mem_id from cs_member cm where t.m_seq = cm.m_seq ) mem_id "
    sql += " ,(select mem_nm from cs_member cm where t.m_seq = cm.m_seq ) mem_nm "
    sql += " ,(select cmpny_id from cs_company cc where t.cmpny_cd = cc.cmpny_cd ) cmpny_id "
    sql += " ,(select cmpny_nm from cs_company cc where t.cmpny_cd = cc.cmpny_cd ) cmpny_nm " 
    sql += " from ( select cct.cmpny_cd , cct.m_seq, sum(cct.trans_num) trans_num "   
    sql += "  from "+param.cs_coin_trans+" cct "
    sql += "   where 1=1  "  
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND cct.cmpny_cd = '"+param.cmpnyCd+"'"  
    // if (!isNullOrEmpty(param.cmpnyCd)) sql += " AND (select cmpny_cd from cs_member cm where cm.m_seq = cct.m_seq) = '"+param.cmpnyCd+"'"    
    sql += "   and DATE_FORMAT(fn_get_time(cct.create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')  "
    sql += "  group by cct.cmpny_cd , cct.m_seq  ) t  ) tt "
    sql += " order by tt.mem_nm asc"
    sql += " limit "+(param.pageIndex-1)*param.rowsPerPage +","+param.rowsPerPage

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

function fnGetTotBalance(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select ifnull(sum(cbw.balance),0) tot_pay_num from cs_balance_wallet cbw "
    sql += " where 1=1 ";
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " and m_seq in (select m_seq from cs_member cm where cmpny_cd = '"+param.cmpnyCd+"') "   
    // if (!isNullOrEmpty(param.cmpnyCd ) )sql += " and  (select cmpny_cd from cs_member cm where cm.m_seq  = cbw.m_seq ) = '"+param.cmpnyCd+"'"
    sql += " and cbw.balance > 0 "
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


function fnGetTotHisBalance(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select ifnull(sum(balance),0) tot_pay_num from cs_balance_wallet_his cct   "
    sql += " where 1=1";
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " and m_seq in (select m_seq from cs_member cm where cmpny_cd = '"+param.cmpnyCd+"') "   
    // if (!isNullOrEmpty(param.cmpnyCd ) )sql += " and  (select cmpny_cd from cs_member cm2 where cm2.m_seq  = cct.m_seq ) = '"+param.cmpnyCd+"'"
    sql += "   and DATE_FORMAT(fn_get_time(cct.create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')  "
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

//CMDT00000000000043 증감
function fnGetInDecreaseChangeTotBalance(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select ifnull(sum(balance),0) as tot_balance from cs_balance_change_his cbch "
    sql += " inner join cs_member cm2 on cm2.m_seq  = cbch.m_seq  and admin_grade = 'CMDT00000000000000' "
    if (!isNullOrEmpty(param.cmpnyCd ) ) sql += "and cm2.cmpny_cd = '"+param.cmpnyCd+"'    "
    sql += " where change_code ='"+param.changeCd+"' "
    sql += "   and DATE_FORMAT(fn_get_time(cbch.create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d')  "

    console.log(sql)
    conn.query(sql, (err, ret) => {
      if (err) {
        console.log(err)
        reject(err)
      }
      resolve(ret[0].tot_balance);
    });
  });
}

// 증감 차감 
function fnGetIncreseDecreseTotal(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select count(1) totSum from ("
    sql += " select cm.mem_id "
    sql += " ,cm.mem_nm "
    sql += " ,cc.cmpny_id "
    sql += " ,cc.cmpny_nm " 
    sql += " ,cbch.balance "
    sql += " , sum(balance) send_num "
    sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
    sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '"+param.cmpnyCd+"'"    
    sql += " where 1 = 1"
    // 차감 
    if (param.gubun == 'D') {
      sql += " and cbch.change_code = 'CMDT00000000000044'"
    } else if (param.gubun == 'I') { //증감 
      sql += " and cbch.change_code = 'CMDT00000000000043'"
    }
    sql += "   and DATE_FORMAT(fn_get_time(cbch.create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d') "
    sql += " group by cmpny_id, cmpny_nm, mem_id, mem_nm ) t "

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

function fnGetIncreseDecreseList(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select '0' buy_num, send_num, cmpny_id, cmpny_nm, mem_id, mem_nm from ("
    sql += " select cm.mem_id "
    sql += " ,cm.mem_nm "
    sql += " ,cc.cmpny_id "
    sql += " ,cc.cmpny_nm " 
    sql += " ,cbch.balance "
    sql += " , sum(balance) send_num "
    sql += " from cs_balance_change_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
    sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '"+param.cmpnyCd+"'"    
    sql += " where 1 = 1"
    // 차감 
    if (param.gubun == 'D') {
      sql += " and cbch.change_code = 'CMDT00000000000044'"
    } else if (param.gubun == 'I') { //증감 
      sql += " and cbch.change_code = 'CMDT00000000000043'"
    }
    sql += "   and DATE_FORMAT(fn_get_time(cbch.create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d') "
    sql += " group by cmpny_id, cmpny_nm, mem_id, mem_nm ) t "
    

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


// 미전환 금액 
function fnGetRemainBalanceTotal(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select count(1) totSum from ("
    sql += " select cm.mem_id "
    sql += " ,cm.mem_nm "
    sql += " ,cc.cmpny_id "
    sql += " ,cc.cmpny_nm " 
    sql += " ,cbch.balance "
    sql += " , sum(balance) send_num "
    sql += " from cs_balance_wallet_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
    sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '"+param.cmpnyCd+"'"    
    sql += " where 1 = 1"
    sql += "   and DATE_FORMAT(fn_get_time(cbch.create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d') "
    sql += " group by cmpny_id, cmpny_nm, mem_id, mem_nm ) t "

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

function fnGetRemainBalanceList(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql = " select '0' buy_num, send_num, cmpny_id, cmpny_nm, mem_id, mem_nm from ("
    sql += " select cm.mem_id "
    sql += " ,cm.mem_nm "
    sql += " ,cc.cmpny_id "
    sql += " ,cc.cmpny_nm " 
    sql += " ,cbch.balance "
    sql += " , sum(balance) send_num "
    sql += " from cs_balance_wallet_his cbch inner join cs_member cm on cm.m_seq = cbch.m_seq  "
    sql += " inner join cs_company cc on cc.cmpny_cd = cm.cmpny_cd "
    if (!isNullOrEmpty(param.cmpnyCd)) sql += " and cc.cmpny_cd = '"+param.cmpnyCd+"'"    
    sql += " where 1 = 1"
  
    sql += "   and DATE_FORMAT(fn_get_time(cbch.create_dt), '%Y-%m-%d') between DATE_FORMAT('"+param.srtDt+"', '%Y-%m-%d') and DATE_FORMAT('"+param.endDt+"', '%Y-%m-%d') "
    sql += " group by cmpny_id, cmpny_nm, mem_id, mem_nm ) t "
    

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
module.exports.QGetSaleCaclTotal = fnGetSaleCaclTotal;
module.exports.QGetSaleCaclList = fnGetSaleCaclList;


module.exports.QGetTransCaclTotal = fnGetTransCaclTotal;
module.exports.QGetTransCaclList = fnGetTransCaclList;

module.exports.QGetTotSaleCacl = fnGetTotSaleCacl;
module.exports.QGetTotTransCacl = fnGetTotTransCacl;
module.exports.QGetTotBalance = fnGetTotBalance;
module.exports.QGetTotHisBalance = fnGetTotHisBalance;


module.exports.QGetInDecreaseChangeTotBalance = fnGetInDecreaseChangeTotBalance;

module.exports.QGetIncreseDecreseTotal = fnGetIncreseDecreseTotal;
module.exports.QGetIncreseDecreseList = fnGetIncreseDecreseList;

module.exports.QGetRemainBalanceTotal = fnGetRemainBalanceTotal;
module.exports.QGetRemainBalanceList = fnGetRemainBalanceList;













