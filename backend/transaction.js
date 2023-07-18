const contract = require("truffle-contract");
const Web3 = require("web3");
var web3 = new Web3();
const ticketing_artifact = require("../build/contracts/Ticketing.json");
var Ticketing = contract(ticketing_artifact);
const db = require("./controllers/db");
const fs = require("fs");
module.exports = {
  getResellTicket: async function (showId, callback) {
    var self = this;
    Ticketing.setProvider(self.web3.currentProvider);
    var ticketing;

    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;

        return instance.getResellTicket(showId);
      })
      .then(async function (result) {
        let array = [];
        console.log(result.length);
        if (result.length === 0) {
          return callback({
            success: true,
            message: "해당 공연 tx 없음",
            data: [],
          });
        }
        for (var i = 0; i < result.length; i++) {
          try {
            const rows = await db.query(
              "select * from shows where showid = ?",
              [result[i].showId]
            );
            rows[0][0].ticketId = result[i].ticketId;
            rows[0][0].imgEncode = encode;
            array.push(rows[0][0]);
            console.log(array[0]);
          } catch (err) {
            console.log(err);
            throw err;
          }
        }
        callback({
          success: true,
          message: "tx 가져오기 성공",
          data: array,
        });
      });
  },
};
