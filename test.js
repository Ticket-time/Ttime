// var Web3 = require('web3');
// var web3 = new Web3();

// const Web3Utils = require('web3-utils');
// web3.setProvider(new web3.providers.HttpProvider("http://127.0.0.1:8545"));

// let manager = web3.eth.accounts[0];
// console.log(manager);
// //console.log(web3.eth.accounts[0]);
// console.log(typeof(manager));


// let a = web3.eth.getBalance('0x246d89578e515F63DeCC1CEa8bD1df571aE3a705');

// let price = 2000000000000000000;
// web3.sendTransaction({to:'0x246d89578e515F63DeCC1CEa8bD1df571aE3a705', from:'0x80b3f9f67CdAa27F5C6F5CB12aAc4E4A7d3AeA0C', value: price});

// a = Web3Utils.toBN(a);
// console.log(a);

// console.log(Web3Utils.fromWei(a, "ether"));



// cache.put("010", "1111");
// console.log(cache.get("010"));
// console.log(cache.get("000"));D
// let word = "seventeen tour";
// word = word.trim();
// console.log(word);

// const now = new Date();
//   const nextMidnight = new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     now.getDate() + 1,
//     0,
//     0,
//     0
//   );
  
// const timeUntilMidnight = nextMidnight.getTime() - now.getTime();
//   console.log("자정까지 시간(ms): " + timeUntilMidnight);
 const db = require("./backend/util/database");
 
 
// const rand = require("./backend/controllers/random");
// rand.random(1);


 async function a(showId) {
    let [[seatid]] = await db.query("select seatid from seat where showid = ?", [showId]);
    console.log(seatid);
 }
 a(1);

// a([1, 2, 3]);


