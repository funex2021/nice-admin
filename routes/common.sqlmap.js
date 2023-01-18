var isNullOrEmpty = require("is-null-or-empty");

function fnGetMstCodeList(conn) {
	return new Promise(function (resolve, reject) {
		let sql = " SELECT cmm_cd, cmm_name, cmm_desc ";
		sql += " FROM tb_comm_cd_mst where use_yn = 'Y' ";

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

function fnGetDtlCodeList(param, conn) {
	return new Promise(function (resolve, reject) {
		let sql = " SELECT cmm_dtl_cd, cmm_dtl_name, cmm_cd, cmm_dtl_desc, cmm_sn ";
		sql += " FROM tb_comm_cd_dtl where use_yn = 'Y' and cmm_cd = '" + param.mstCode + "' order by cmm_sn ";

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

module.exports.QGetDtlCodeList = fnGetDtlCodeList;
module.exports.QGetMstCodeList = fnGetMstCodeList;
