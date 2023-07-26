const contract = require("truffle-contract");
const Web3 = require("web3");
var web3 = new Web3();
const ticketing_artifact = require("../build/contracts/Ticketing.json");
var Ticketing = contract(ticketing_artifact);
const db = require("./controllers/db");
const fs = require("fs");
module.exports = {
  createShow: function (showOwner, ticketPriceEth, callback) {
    var self = this;
    const ticketPriceWei = web3.toWei(ticketPriceEth, "ether");
    console.log(ticketPriceWei);
    Ticketing.setProvider(self.web3.currentProvider);
    var ticketing;
    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        return ticketing.createShow(ticketPriceWei, { from: showOwner });
      })
      .then(function (value) {
        console.log(value.receipt.status);
        callback(value.receipt.status);
      })
      .catch(function (e) {
        console.log(e);
        callback("ERROR 404");
      });
  },
  issueTicket: function (showId, ticketOwner, callback) {
    var self = this;
    Ticketing.setProvider(self.web3.currentProvider);
    var ticketing;

    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        return ticketing.getTicketPrice(showId);
      })
      .then(function (price) {
        console.log(`price: ${price}`);
        return ticketing.issueTicket(showId, ticketOwner, {
          from: ticketOwner,
          value: price,
        });
      })
      .then(async function (value) {
        // update payment in apply table
        const userId = await db.query("select id from user where wallet = ?", [
          ticketOwner,
        ]);
        const rows = await db.query(
          "update apply set payment=1 where showid = ? and userid = ?",
          [showId, userId[0][0].id]
        );
        if (rows.length > 0) {
          console.log("apply table 업데이트 완료");
        }

        console.log(`check receipt`);
        let tx = value.tx;
        // log 확인
        for (var i = 0; i < value.logs.length; i++) {
          var log = value.logs[i];
          if (log.event == "ISSUE_TICKET") {
            // We found the event!
            let param1 = log.args._showId;
            let param2 = log.args._ticketId;
            if (showId == param1) {
              callback({
                tx: tx,
                message: `showId: ${param1}, ticketId: ${param2}`,
              });
            }
            break;
          }
        }
      })
      .catch(function (e) {
        console.log(e);
        callback("발급 오류");
      });
  },
  getMyTicket: async function (userAddr, callback) {
    var self = this;
    Ticketing.setProvider(self.web3.currentProvider);
    var ticketing;

    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;

        return instance.getMyTicket(userAddr);
      })
      .then(async function (result) {
        // result는 object 배열이다
        let array = [];
        console.log(result.length);
        if (result.length === 0) {
          return callback({
            success: true,
            message: "보유 티켓 없음",
            data: [],
          });
        }

        // json 으로 변환 - 이름 , 날짜, 시간, 이미지 세로긴거, 일시, 장소, 좌석
        for (var i = 0; i < result.length; i++) {
          try {
            const rows = await db.query(
              "select * from shows where showid = ?",
              [result[i].showId]
            );
            console.log("hi");
            rows[0][0].ticketId = result[i].ticketId;
            let showid = rows[0][0].showid;
            let imgFile = fs.readFileSync(`./image/${showid}.jpg`);
            let encode = Buffer.from(imgFile).toString("base64");
            rows[0][0].imgEncode = encode;
            array.push(rows[0][0]);
            console.log(array[0]);
          } catch (err) {
            console.log(err);
            throw err;
          }
        }
        console.log(array); // for문 끝
        callback({
          success: true,
          message: "my ticket 가져오기 성공",
          data: array,
        });
      });
  },
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
            let showid = rows[0][0].showid;
            let imgFile = fs.readFileSync(`./image/${showid}.jpg`);
            let encode = Buffer.from(imgFile).toString("base64");
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

  resellTicket: async function (showId, ticketId, userAddr, callback) {
    var self = this;
    Ticketing.setProvider(self.web3.currentProvider);
    var ticketing;
    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;

        return instance.resellTicket(showId, ticketId, {
          from: userAddr,
        });
      })
      .then(
        callback({
          success: true,
          message: "양도 탭에 티켓 추가 완료",
        })
      );
  },
};
