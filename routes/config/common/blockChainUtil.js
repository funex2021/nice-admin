
const axios = require('axios');
/*
* properties
*/
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('adm.properties');
const apiUrl = properties.get('com.blockchain.api');

var getNewAddress = async function (password) {
    return new Promise(async function (resolve, reject) {
        try{
            var obj = {};
            let ethInfo = await axios.get(apiUrl+'/newAddress?password=' + password);
            // console.log('ethInfo : ' + JSON.stringify(ethInfo.data));
            if(ethInfo.data.success) {
                obj.ethAddr = ethInfo.data.data.address;
                obj.pk = ethInfo.data.data.priKey;
                resolve(obj);
            } 
        } catch(e) {
            console.log(' getNewAddress catch !! ' + e.message)
            reject();
        }
    });
};

var getBalance = async function (address) {
    return new Promise(async function (resolve, reject) {
        try{
            var obj = {};
            console.log('getbalance url : ' + apiUrl+'/balance?address=' + address);
            let ethInfo = await axios.get(apiUrl+'/balance?address=' + address);
            console.log('ethInfo : ' + JSON.stringify(ethInfo.data));
            if(ethInfo.data.success) {
                obj.coin = ethInfo.data.data.coin;
                obj.token = ethInfo.data.data.token;
                resolve(obj);
            }
        } catch(e) {
            console.log(' getBalance catch !! ' + e.message)
            var obj = {};
            obj.coin = "0";
            obj.token = "0";
            reject(obj);
        }
    });
};

var delegateSendToken = async function (fromPk, toAddress, balance, feeAddr) {
    return new Promise(function (resolve, reject) {
        var obj = {};
        var data = JSON.stringify({
            "fromPk": fromPk,
            "toAddress": toAddress,
            "balance": balance,
            "feeAddr": feeAddr
        });

        console.log(data);
        
        var config = {
            method: 'post',
            url: apiUrl + '/delegateSendToken',
            headers: { 
            'Content-Type': 'application/json'
            },
            data : data
        };
        
        axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            if(response.data.success) {
                obj.result = 1;
                obj.txid = response.data.data.txid;
            } else {
                obj.result = -1;
                obj.txid = "";
            }
            
            resolve(obj);
        })
        .catch(function (error) {
            console.log(error);
            obj.result = -1;
            obj.txid = "";
            resolve(obj);
        });
    });
};

var sellerSendToken = async function (toAddress, balance) {
    return new Promise(function (resolve, reject) {
        var obj = {};
        var data = JSON.stringify({
            "toAddress": toAddress,
            "balance": balance,
            "sendType": "T"
        });

        console.log(data);
        
        var config = {
            method: 'post',
            url: apiUrl + '/sellerSendToken',
            headers: { 
            'Content-Type': 'application/json'
            },
            data : data
        };
        
        axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            if(response.data.success) {
                obj.result = 1;
                obj.txid = response.data.data.txid;
            } else {
                obj.result = -1;
                obj.txid = "";
            }
            
            resolve(obj);
        })
        .catch(function (error) {
            console.log(error);
            obj.result = -1;
            obj.txid = "";
            resolve(obj);
        });
    });
};

module.exports.sellerSendToken = sellerSendToken;
module.exports.getBalance =  getBalance;
module.exports.getNewAddress =  getNewAddress;
module.exports.delegateSendToken =  delegateSendToken;
