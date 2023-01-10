
/*
* 공통 코드 마스터 리스트
*/
function fnCommCodeMstList(param, conn) {
    return new Promise(function(resolve, reject) {
        var select = "SELECT  CMM_CD as cmmCd,CMM_NAME as cmmName,USE_YN as useYn "
        var column = " ,CMM_DESC as cmmDesc, CREATE_DATE as createDate ,CREATE_USER as createUser "
        var from = " FROM tb_comm_cd_mst"
        var sql = select.concat(column, from);

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

/*
* 공통 코드 서브 리스트 
*/
function fnCommCodeDtlList(param, conn) {
    return new Promise(function(resolve, reject) {
        var select = "SELECT  CMM_DTL_CD as cmmDtlCd, CMM_DTL_NAME as cmmDtlName, CMM_CD as cmmCd, USE_YN as useYn "
        var column = " ,CMM_DTL_DESC as cmmDtlDesc, CMM_SN as cmmSn, CREATE_DATE as createDate ,CREATE_USER as createUser "
        var from = " FROM tb_comm_cd_dtl"
        var where = " WHERE CMM_CD = '"+param.cmmCd+"'";
        var sql = select.concat(column, from, where);

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

/*
* 공통 코드 마스터 
*/
function fnSetCommCodeMst(param, conn) {
    return new Promise(function(resolve, reject) {
        var insert = "INSERT INTO tb_comm_cd_mst "
        var column = " (CMM_CD,CMM_NAME,USE_YN,CMM_DESC,CREATE_DATE,CREATE_USER)"         
        var values = " VALUES (FN_GEN_KEY('TB_COMM_CD_MST'),'"+param.cmmName+"','Y','"+param.cmmDesc+"',now(),'"+param.accountId+"')"; 
        var sql = insert.concat(column,  values);
        console.log(sql);
        conn.query(sql, (err, ret) => {        
            if (err) {     
                console.log("fnCommCodeMst call")          
                reject(err)          
            }            
            resolve(ret);
        });
    }); 
}

/*
* 공통 코드 서브 
*/
function fnSetCommCodeDtl(param, conn) {
    return new Promise(function(resolve, reject) {
        var insert = "INSERT INTO tb_comm_cd_dtl "
        var column = " (CMM_DTL_CD,CMM_DTL_NAME,CMM_CD,USE_YN,CMM_DTL_DESC,CMM_SN,CREATE_DATE,CREATE_USER)"         
        var values = " VALUES (FN_GEN_KEY('TB_COMM_CD_DTL'),'"+param.cmmDtlName+"','"+param.cmmCd+"','Y','"+param.cmmDtlDesc+"',cast('"+param.cmmSn+"' as unsigned),now(),'"+param.accountId+"')"; 
        var sql = insert.concat(column,  values);
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


module.exports.QCommCodeMstList = fnCommCodeMstList;
module.exports.QCommCodeDtlList = fnCommCodeDtlList;
module.exports.QSetCommCodeMst = fnSetCommCodeMst;
module.exports.QSetCommCodeDtl = fnSetCommCodeDtl;




