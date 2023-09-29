const contract = require("truffle-contract");
const Web3 = require("web3");
var web3 = new Web3();
const ticketing_artifact = require("../build/contracts/Ticketing.json");
var Ticketing = contract(ticketing_artifact);
const db = require("./util/database");
const fs = require("fs");
const Show = require("./models/show");

module.exports = {
  createShow: async function (showOwner, ticketPriceEth, callback) {
    try {
      const self = this;
      const ticketPriceWei = web3.toWei(ticketPriceEth, "ether");
      console.log(ticketPriceWei);
      await Ticketing.setProvider(self.web3.currentProvider);
      const ticketing = await Ticketing.deployed();
      const value = await ticketing.createShow(ticketPriceWei, {
        from: showOwner,
      });
      callback(value.receipt.status);
    } catch (e) {
      console.log(e);
      callback("ERROR 404");
    }
  },
  issueTicket: async function (showId, ticketOwner, callback) {
    try {
      const self = this;
      await Ticketing.setProvider(self.web3.currentProvider);
      const ticketing = await Ticketing.deployed();
      const price = await ticketing.getTicketPrice(showId);
      const result = await ticketing.issueTicket(showId, ticketOwner, {
        from: ticketOwner,
        value: price,
      });
      console.log(`price: ${price}`);
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
      let tx = result.tx;

      // log 확인
      for (let i = 0; i < result.logs.length; i++) {
        let log = result.logs[i];
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
    } catch (e) {
      console.log(e);
      callback("발급 오류");
    }
  },
  getMyTicket: async function (userAddr, callback) {
    const self = this;
    await Ticketing.setProvider(self.web3.currentProvider);
    const ticketing = await Ticketing.deployed();
    const result = await ticketing.getMyTicket(userAddr);
    let array = [];
    if (result.length === 0) {
      return callback({
        success: true,
        message: "보유 티켓 없음",
        data: [],
      });
    }
    for (var i = 0; i < result.length; i++) {
      try {
        // const rows = await db.query("select * from shows where showid = ?", [
        //   result[i].showId,
        // ]);
        const rows = await Show.findById(result[i].showId);
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
  },
  getResellTicket: async function (showId, callback) {
    const self = this;
    await Ticketing.setProvider(self.web3.currentProvider);
    const ticketing = await Ticketing.deployed();
    const result = await ticketing.getResellTicket(showId);
    let array = [];
    if (result.length === 0) {
      return callback({
        success: true,
        message: "해당 공연 tx 없음",
        data: [],
      });
    }
    for (var i = 0; i < result.length; i++) {
      try {
        const rows = await db.query("select * from shows where showid = ?", [
          result[i].showId,
        ]);
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
  },

  resellTicket: async function (showId, ticketId, userAddr, callback) {
    const self = this;
    await Ticketing.setProvider(self.web3.currentProvider);
    const ticketing = await Ticketing.deployed();
    try {
      await ticketing.resellTicket(showId, ticketId, { from: userAddr });
    } catch (err) {
      console.log(err);
      throw err;
    }
    callback({ success: true, message: "양도 탭에 티켓 추가 완료" });
  },

  handOverTicket: async function (showId, userAddr, callback) {
    const self = this;
    await Ticketing.setProvider(self.web3.currentProvider);
    const ticketing = await Ticketing.deployed();
    //sellingQueueIndex -
    // 1. sellingQueue의 map key를 자연수 순서대로 : 근데 이건 티켓이 많아질수록..?
    // 1-1. index를 따로 저장해서 쉽게 찾게 하기
    // 1-2. 사용자가 표 좌석을 알 수 없는 상태로 큐 차례대로 양도 (채택)
    // 2. sellingQueue의 map key를 ticketID로 : getResellTicket 할 때 복잡해져서 안 됨
    const sellingQueueIndex = await ticketing.getQueueHeadIndex(showId);
    try {
      await ticketing.buyTicket(showId, sellingQueueIndex, { from: userAddr });
    } catch (err) {
      console.log(err);
      throw err;
    }
    callback({
      success: true,
      message: "티켓 양도 받기 완료",
    });
  },
};
