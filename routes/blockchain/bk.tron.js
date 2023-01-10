const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./bk.sqlmap'); // 여기

const hdWallet = require('tron-wallet-hd');
const utils = hdWallet.utils;

const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))

const CONSTS = require(path.join(process.cwd(),'/routes/services/consts'))
const TronWeb = require('tronweb')
const objectTokenID      = CONSTS.TRON.tokenID;
const privateKey   = CONSTS.TRON.privateKey;
const tronWeb = new TronWeb({
  fullHost: CONSTS.TRON.api_trongrid_io,
  headers: { "TRON-PRO-API-KEY": CONSTS.TRON.apiKey },
  privateKey: CONSTS.TRON.privateKey
})

const jwt = require('jsonwebtoken')
var isNullOrEmpty = require('is-null-or-empty');

const {
  v4: uuidv4
} = require('uuid');

//입금완료 이벤트 
function fnSendBuyCoinComplete(param,conn) {
  return new Promise(async function (resolve, reject) {
      let txid = "";
      console.log(param)
      console.log("objectTokenID",objectTokenID)
      try {

        let coinBalance = await fnTronBalance(param.toAddress);
        logUtil.logStr('fnSendBuyCoinComplete','coinBalance',coinBalance)
        let coinInfo = '' //TRC10 Object Coin
             
        coinInfo = 'CMDT00000000000036'     
        let obj = {};
        obj.buyKey = param.buySeq;
        obj.sendTxid = param.txid;
        
        param.balance = parseInt(param.balance) / 1000000;
        // 구매 요청 건에 대한 txid update
        await Query.QUptCoinBuy(obj, conn);

        obj.output = JSON.stringify(receiptTrc10);
        obj.toAddress = param.toAddress;
        obj.balance = param.balance;          
        obj.fromAddress = param.fromAddress;
        obj.memberYN = 'N';
        obj.coinInfo = coinInfo
        obj.refrenceCode = param.buySeq; 
        obj.userId = param.userId;
        obj.cmpnyCd = param.cmpnyCd;

        await Query.QSetCoinSendHis(obj, conn);
        
        resolve(receiptTrc10.txid)
       
      } catch (e) {
        console.log(e)
        if (txid != "") resolve(txid) 
        else reject(e)
      }
    });
 
}

//코인 회수  
function fnReturnCoin(param,conn) {
  return new Promise(async function (resolve, reject) {
      let txid = "";
      console.log(param)
      console.log("objectTokenID",objectTokenID)
      try {
     
        logUtil.logStr('fnReturnCoin','fnSendCoin','')
        let coinInfo = 'CMDT00000000000036' 
        param.balance = parseInt(param.balance) * 1000000;
        let receiptTrc10 = await fnSendCoin(coinInfo, param.toAddress,param.balance,param.fromAddress,param.fromCoinPk ,objectTokenID)
          
        let obj = {};
        obj.buyKey = param.buySeq;
        obj.sendTxid = receiptTrc10.txid;
        
        param.balance = parseInt(param.balance) / 1000000;
        // 구매 요청 건에 대한 txid update
        await Query.QUptCoinReturn(obj, conn);

        obj.sendTxid = receiptTrc10.txid;
        obj.output = JSON.stringify(receiptTrc10);
        obj.toAddress = param.toAddress;
        obj.balance = param.balance;          
        obj.fromAddress = param.fromAddress;
        obj.memberYN = 'T';
        obj.coinInfo = coinInfo
        obj.refrenceCode = param.buySeq; 
        obj.userId = param.userId;
        obj.cmpnyCd = param.cmpnyCd;

        await Query.QSetCoinSendHis(obj, conn);
        
        resolve(receiptTrc10.txid)
       
      } catch (e) {
        console.log(e)
        if (txid != "") resolve(txid) 
        else reject(e)
      }
    });
 
}

function fnNewAddress() {
  return new Promise(async function (resolve, reject) {
    try {
      const seed = utils.generateMnemonic();
      const account = await utils.getAccountAtIndex(seed, 1);  
      resolve(account);
    } catch (err) {
      console.log(err)
      return reject(err);
    }
  })
}


function fnTronBalance(_address) {
  return new Promise(async function (resolve, reject) {    
    try {     
     
      const gBalance = await tronWeb.trx.getBalance(_address);     
      const trxBalance = gBalance / Math.pow(10,  6) 
      const gBandwidth = await tronWeb.trx.getBandwidth(_address);

      const tradeobj = await tronWeb.trx.getAccount(_address);   
      let trc20AccountBalance = 0;
      try {
        trc20AccountBalance = await tradeobj.assetV2[0].value;
      } catch (e) {
        console.log(e.message)
      }   
      const tokenBalance = trc20AccountBalance / Math.pow(10,  6)     
      resolve({"coin": trxBalance,"token": tokenBalance,"bandwidth":gBandwidth});

    } catch (e) {
      console.log(e)
      reject(e)
    }
  })
}

function fnSendCoin(tokenInfo, toAddress,amount,fromAddress,privateKey,objectTokenID) {
  return new Promise(async function(resolve,reject) {
    try {
      let tradeobj = null;
      if (tokenInfo == 'CMDT00000000000035') {
        tradeobj = await tronWeb.transactionBuilder.sendTrx(
          toAddress,
          amount,
          fromAddress
        );
      } else if (tokenInfo == 'CMDT00000000000036') {
        tradeobj = await tronWeb.transactionBuilder.sendToken(
          toAddress,
          amount,
          objectTokenID,
          fromAddress  
        )
      }
      
      const signedtxn = await tronWeb.trx.sign(
            tradeobj,
            privateKey
      );
  
      const receipt = await tronWeb.trx.sendRawTransaction(
            signedtxn
      );
  
      logUtil.logStr('fnSendCoin','receipt',receipt);
      resolve(receipt);
    } catch (e) {
      logUtil.errObj('fnSendCoin',e)
      reject(e)
    }
    
  });
}
module.exports.newAddress = fnNewAddress;
module.exports.tronBalance = fnTronBalance;
module.exports.sendBuyCoinComplete = fnSendBuyCoinComplete;

module.exports.returnCoin = fnReturnCoin;
