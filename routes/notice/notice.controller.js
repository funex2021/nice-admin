const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))

exports.view = async (req, res, next) => {
  let basicInfo = {}
  basicInfo.title = 'Admin 관리';
  basicInfo.menu = 'MENU00000000000005';
  basicInfo.rtnUrl = 'notice/index';

  req.basicInfo = basicInfo;

  next();
}
