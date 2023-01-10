const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))

const Query = require('./cmm.sqlmap'); // 여기
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))



exports.VCommCodeMst = async (req, res, next) => {
  let basicInfo = {}
  basicInfo.title = 'Main Admin 관리';
  basicInfo.menu = 'MENU99999999999998';

  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);
  mydb.execute(async conn => {
    var obj = {}
    let cmmMstList = await Query.QCommCodeMstList(obj, conn);
    res.render('VCommCode', {          
      commList : cmmMstList,
      basicInfo: basicInfo
    });
  })
}

exports.VCommCodeDtl = async (req, res, next) => {
  var cmmCd = req.body.cmmCd;  
  var obj = {};
  obj.cmmCd = cmmCd;

  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);
  mydb.execute(async conn => {
    let cmmMstList = await Query.QCommCodeDtlList(obj, conn);
    res.send({dtlList:cmmMstList});
  })
}

exports.setCommCodeMst = async (req, res, next) => {
  var cmmName = req.body.cmmName;  
  var cmmDesc = req.body.cmmDesc;  
  var accountId = req.body.accountId;  
  
  var obj = {};
  obj.cmmName = cmmName;    
  obj.cmmDesc = cmmDesc;    
  obj.accountId = accountId;    

  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);

  mydb.execute(async conn => {
    try {
      await Query.QSetCommCodeMst(obj, conn)
      res.json(rtnUtil.successTrue("","" ))
    } catch (e) {
      res.json(rtnUtil.successFalse("", ""));
    }
    
  })
}

exports.setCommCodeDtl = async (req, res, next) => {
  var cmmCd = req.body.cmmCd; 
  var cmmDtlName = req.body.cmmDtlName;  
  var cmmDtlDesc = req.body.cmmDtlDesc;  
  var cmmDtlDesc1 = req.body.cmmDtlDesc1;  
  var cmmSn = req.body.cmmSn; 
  var accountId = req.body.accountId;  
  
  var obj = {};
  obj.cmmCd = cmmCd;    
  obj.cmmDtlName = cmmDtlName;    
  obj.cmmDtlDesc = cmmDtlDesc;   
  obj.cmmDtlDesc1 = cmmDtlDesc1;   
  obj.cmmSn = cmmSn;   
  obj.accountId = accountId;   

  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);

  mydb.execute(async  conn => {
    try {
      await Query.QSetCommCodeDtl(obj, conn)
      res.json(rtnUtil.successTrue("","" ))
    } catch (e) {
      res.json(rtnUtil.successFalse("", ""));
    }
    
  })
}