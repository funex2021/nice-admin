var isNullOrEmpty = require('is-null-or-empty');
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('adm.properties');
const cointable = properties.get('com.coin.cointable');

function fnUptCoinBuy(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql =" UPDATE "+param.cs_coin_sell+" SET  update_dt = CURRENT_TIMESTAMP  "
    sql += " ,sell_sts = 'CMDT00000000000026'" 
    sql += " WHERE 1=1"
    sql += " AND seq = '"+param.buySeq+"'"
    
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

function fnUptCoinReturn(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql =" UPDATE "+param.cs_coin_sell+" SET  update_dt = CURRENT_TIMESTAMP  "
    if (!isNullOrEmpty(param.sendTxid)) sql += " ,send_txid = '"+param.sendTxid+"'" 
    if (!isNullOrEmpty(param.objectTxid)) sql += " ,sell_sts = 'CMDT00000000000044'" 
    sql += " WHERE 1=1"
    if (!isNullOrEmpty(param.buyKey)) sql += " AND seq = '"+param.buyKey+"'"
    if (!isNullOrEmpty(param.objectTxid)) sql += " AND send_txid = '"+param.objectTxid+"'"
    
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

function fnSetCoinSendHis(param, conn) {
  return new Promise(function (resolve, reject) {    
    var sql =" INSERT INTO cs_" + cointable + "_send_his "
    sql += " (txid, coin_info, tx_desc, user_id, confirm_yn ,to_address, from_address, balance, cmpny_cd, member_yn,refrence_code) "  
    sql += " VALUES ('"+param.sendTxid+"'"
    sql += " ,'"+param.coinInfo+"'"
    sql += " ,'"+param.output+"','"+param.userId+"','Y', '"+param.toAddress+"','"+param.fromAddress+"','"+param.balance+"','"+param.cmpnyCd+"','"+param.memberYN+"'"
    sql += " ,'"+param.refrenceCode+"'"
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

module.exports.QUptCoinBuy = fnUptCoinBuy;
module.exports.QSetCoinSendHis = fnSetCoinSendHis;
module.exports.QUptCoinReturn = fnUptCoinReturn;
