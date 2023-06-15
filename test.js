var Web3 = require('web3');
var web3 = new Web3();

const Web3Utils = require('web3-utils');

web3.setProvider(new web3.providers.HttpProvider("http://127.0.0.1:8545"));
console.log(web3.eth.accounts[0]);

let a = web3.eth.getBalance('0x246d89578e515F63DeCC1CEa8bD1df571aE3a705');
a = Web3Utils.toBN(a);
console.log(a);

console.log(Web3Utils.fromWei(a, "ether"));
