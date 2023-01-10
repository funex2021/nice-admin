const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const rtnUtil = require('./rtnUtil')
const path = require('path');
const Mydb = require(path.join(process.cwd(),'/routes/config/mydb'))

const logUtil = require('./logUtil')
var isNullOrEmpty = require('is-null-or-empty');

/*
* JWT 토큰 발급과 재발급 로직
* 최초 발급시 Access Token과 Refresh Token 을 발급합니다. 
* 그 후 Access Token으로 API를 사용하다가 만료시간이 지나면 만료시간을 길게 준 Refresh Token을 이용해서 Access Token을 재발급 합니다.
* 클라이언트가 토큰의 만료시간을 알 수 있기 때문에 클라이언트에서 판단하여 만료시간이 넘었으면 토큰 재발급을 요청하거나 TokenExpiredError가 발생했을 때 재발급해주는 것입니다.
*/

var jwtUtil = {};

// const encodedPayload = Buffer.from(JSON.stringify(payload))
//                         .toString('base64')
//                         .replace('=', '');
// 주의: base64로 인코딩을 할 때 dA== 처럼 뒤에 = 문자가 한두개 붙을 때가 있습니다. 이 문자는 base64 인코딩의 padding 문자라고 부릅니다.
// JWT 토큰은 가끔 URL 의 파라미터로 전달 될 때도 있는데요, 이 = 문자는, url-safe 하지 않으므로, 제거되어야 합니다. 
// 패딩이 한개 생길 때도 있고, 두개 생길 때도 있는데, 전부 지워(제거해줘도 디코딩 할 때 전혀 문제가 되지 않습니다)


/**
 * JWT Create RefreshToken
 * @param {any} payload 
 * @param {TB cs_company } cmpny_cd 
 * @returns {string} RefreshToken
 * 시간은 UNIX TIME STAMP
 */
//refreshToken 생성
function generateRefreshToken(cmpnyId, cmpnyCd) {
  return new Promise(async (resolve, reject) => {
    try { 
      var payload = {
        aud:cmpnyId,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365), //365일 
        iss:'OBJECT API'
      };
      resolve(await jwt.sign(payload, cmpnyCd) )
    } catch (err) { 
      reject(err)
    } 
  });
}

//refreshToken 검증
function verifyRefreshToken(refreshToken, cmpnyCd) {
  return new Promise(async (resolve, reject) => {
    try { 
      const payload = await jwt.verify(refreshToken, cmpnyCd) 
      resolve(payload)
    } catch (e) { 
      reject(e);
    } 
  })
}

function generateAccessToken(cmpnyId, refreshToken) {

  logUtil.logObj("generateAccessToken cmpnyId", cmpnyId) 
  return new Promise(async (resolve, reject) => {
    try { 
      var payload = {
        aud:cmpnyId,
        //exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
        exp: Math.floor(Date.now() / 1000) + (60 * 10), // 10 분
        iss:'OBJECT API'
      };
      resolve(await jwt.sign(payload, refreshToken) )
    } catch (err) { 
      reject(err)
    } 
  });
}

var verifyAccessToken = async function (req, res, next) {
  const token = req.headers.authorization;

  let cmpnyId = "";
  try {
    cmpnyId = await fnGetPayload(req);
    if (isNullOrEmpty(cmpnyId)) {
      res.json(rtnUtil.successFalse ('405','accessToken 검증시 실패 하였습니다.','payload Method Not Allowed',''));
      return; 
    }
  } catch (e) {
    console.log(e)
    res.json(rtnUtil.successFalse ('401','accessToken 검증시 실패 하였습니다.',e.message,''));
    return;
  }

  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);

  mydb.execute( async conn => {   
    let companyInfo = await fnSelCompany(cmpnyId,conn);
  
    if (companyInfo.length > 0) {
      try {
        let auth = await jwt.verify(token, companyInfo[0].refresh_token); // If no error, token info is returned
        console.log("====auth verifty====")
        console.log(auth)
        next();
      } catch (err) {
        res.json(rtnUtil.successFalse ('401','accessToken 검증시 실패 하였습니다.',err.message,''));
        //throw new Error(err) // Manage different errors here (Expired, untrusted...)
      }
    } else {
      res.json(rtnUtil.successFalse ('405','accessToken 검증시 실패 하였습니다.','Method Not Allowed',''));
      return; 
    }
  });  
};

function fnGetPayload(req) {
  return new Promise((resolve, reject) => {
    const token = req.headers.authorization;
  
    if(!token) {
      reject('401')
    }
    let payload = jwt.decode(token, {header: true});
    logUtil.logObj("payload", payload) 
    resolve(payload.aud)  
  });
}

function fnSelCompany(_cmpnyId, conn) {
  return new Promise((resolve, reject) => {
    var sql = "SELECT refresh_token "
        sql += " FROM cs_company "
        sql += " WHERE cmpny_id = '"+_cmpnyId+"'" 
       

      conn.query(sql, (err, ret) => {       
          if(err){
              reject(err);
          } else {
              resolve(ret);
          }
      });
  });
}


module.exports.generateRefreshToken =  generateRefreshToken;
module.exports.verifyRefreshToken =  verifyRefreshToken;

module.exports.generateAccessToken = generateAccessToken;
module.exports.verifyAccessToken = verifyAccessToken;

module.exports.getPayloadAud = fnGetPayload

