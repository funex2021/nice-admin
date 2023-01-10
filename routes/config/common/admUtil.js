const moment = require('moment');
require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");
const path = require('path');
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const Mydb = require(path.join(process.cwd(),'/routes/config/mydb'))
const bkUtil = require(path.join(process.cwd(),'/routes/config/common/blockChainUtil'))

var verifyTime = async function (req, res, next) {

  console.log('moment().format("YYYY-MM-DD HH:mm:ss") : ' + moment().format("YYYY-MM-DD HH:mm:ss"));

  let now = moment();//.format("HH:mm:ss");
  let stop = moment("00:00:00", "HH:mm:ss");//.format("HH:mm:ss");

  //현재 시간과 점검시간의 시간차
  let diff = moment(stop).diff(now, "second");

  //음수일 경우 86400초를 더함
  diff = diff < 0 ? diff + 86400 : diff;

  //300보다 작으면 00시05분 이하
  //86400 - 300 보다 크면 23시 55분 이상
  if(300 < diff && diff < 86400 - 300) {
    next();
  } else {
    res.json(rtnUtil.successFalse ('405','23시55분 ~ 00시 05분 까지는 점검시간입니다.','',''));
    return;
  }

};

var getSellerAmt = async function (req, res, next) {
/*  if(req.user) {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    var obj = {};
    obj.cmpnyCd = req.user.cmpnyCd;
    try {  
      mydb.execute(async conn => {
        let addr = await fnGetSellerAddr(obj, conn);
        if(addr.length > 0) {
          console.log('addr : ' + JSON.stringify(addr))
          let sellerBalance;
          try {  
            sellerBalance = await bkUtil.getBalance(addr[0].eth_addr);
            console.log('sellerBalance : ' +  JSON.stringify(sellerBalance))
            let coinAlarm = await fnGetCoinAlarm(obj, conn);
            console.log('coinAlarm : ' +  JSON.stringify(coinAlarm))
            if(coinAlarm.length > 0 && coinAlarm[0].coin_alarm) {
              if(parseInt(sellerBalance.token) < coinAlarm[0].coin_alarm) {
                let alertMessage = {}
                alertMessage.success = false;
                alertMessage.message = "셀러 수량이 " + sellerBalance.token + "개 남았습니다. 충전해주세요.";
                req.flash("alertMessage", alertMessage);
              }
            }
            next();
          } catch (e) {
            console.log("getSellerAmt > getBalance error : " + e.message);
            next();
          }
        } else {
          next();
        }
      });
    } catch (e) {
      console.log("getSellerAmt error : " + e.message);
      next();
    }
  } else {
    next();
  }
*/
next();
};
  

function fnGetCoinAlarm(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql =" select coin_alarm from cs_pay_config "
    sql += " where cmpny_cd = '"+param.cmpnyCd+"' "

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

function fnGetSellerAddr(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql =" select eth_addr from cs_seller "
    sql += " where seq = (select seller_seq from cs_company where cmpny_cd = '"+param.cmpnyCd+"') "

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

function fnSetHistory(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql =" INSERT INTO cs_adm_history"
    sql += " (cmpny_cd, m_seq, admin_id, adm_code, adm_request, is_success, adm_ip, adm_response) "
    sql += " VALUES('"+param.cmpnyCd+"', '"+param.mSeq+"', '"+param.admin_id+"', '"+param.adm_code+"', '"+param.adm_request+"', '"+param.is_success+"', '"+param.adm_ip+"', '"+param.adm_response+"')  "

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
module.exports.getSellerAmt = getSellerAmt
module.exports.QSetHistory = fnSetHistory;
module.exports.verifyTime =  verifyTime;
