const contract = require("truffle-contract");
const Web3 = require("web3");
var web3 = new Web3();
const ticketing_artifact = require("../build/contracts/Ticketing.json");
var Ticketing = contract(ticketing_artifact);
const db = require("./util/database");
const fs = require("fs");
const Show = require("./models/show");

const RefundRatio = {
  Before7: 100,
  Between7and3: 80,
  Between3and1: 60,
  NoRefund: 0,
};

let manager = "0x246d89578e515F63DeCC1CEa8bD1df571aE3a705";

module.exports = {
  test: function(data) {
    console.log("this is truffle connect");
    console.log(data);
  }, 
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

  // issueLotteryTicket
  issueTicket: async function (
    showId,
    ticketOwner,
    numberOfSeats,
    userId,
    callback
  ) {
    try {
      const self = this;
      await Ticketing.setProvider(self.web3.currentProvider);
      const ticketing = await Ticketing.deployed();

      const [[{ ticketPrice }]] = await db.query(
        "select ticketPrice from shows where showid = ?",
        [showId]
      );
      
      // 추첨제 발급
      let totalPrice = web3.toWei(ticketPrice) * numberOfSeats;
      console.log("totalPrice = " + totalPrice);

      const result = await ticketing.issueTicket(
        showId,
        ticketOwner,
        numberOfSeats,
        userId,
        {
          from: ticketOwner,
          value: totalPrice,
        }
      );
      
      let bookingId;
      for (let i = 0; i < result.logs.length; i++) {
        let log = result.logs[i];
        if (log.event == "ISSUE_TICKET") {
          let param1 = log.args._showId;
          if (showId == param1) {
            bookingId = log.args._bookingId;
          }
          break;
        }
      }

      await db.query(
        "update seat set payment = 1 where userid = ? and showid = ?",
        [userId, showId]
      );
      
      const [[{seatid}]] = await db.query(
        "select seatid from apply where showid = ? and bookingId = ?",
        [showId, bookingId]
      );
      
      await db.query(
        "insert into seat values(?, ?, ?)",
        [bookingId, showId, seatid]
      )

    } catch (e) {
      console.log(e);
      callback("발급 오류");
    }
  },

  issueBasicTicket: async function (
    data
  ) {
    try {
      const self = this;
      await Ticketing.setProvider(self.web3.currentProvider);
      const ticketing = await Ticketing.deployed();

      const {showId, ticketOwner, userId} = data;
      const numOfReservedSeats = data.seats.length;

      const [[show]] = await db.query(
        "select ticketPrice, seats from shows where showid = ?",
        [showId]
      );
      
      let totalPrice = web3.toWei(show.ticketPrice) * numOfReservedSeats;
      console.log(`number of reserved seats = ${numOfReservedSeats}`);
      console.log("totalPrice = " + totalPrice);

      const result = await ticketing.issueTicket(
        showId,
        ticketOwner,
        numOfReservedSeats,
        userId,
        {
          from: ticketOwner,
          value: totalPrice,
        }
      );

      let bookingId;
      for (let i = 0; i < result.logs.length; i++) {
        let log = result.logs[i];
        if (log.event == "ISSUE_TICKET") {
          let param1 = log.args._showId;
          if (showId == param1) {
            bookingId = log.args._bookingId;
          }
          break;
        }
      }

      return bookingId;
  } catch (e) {
    console.log(e);
   }
  },
  
  // @완료
  getMyTicket: async function (userAddr, callback) {
    const self = this;
    await Ticketing.setProvider(self.web3.currentProvider);
    const ticketing = await Ticketing.deployed();

    // 2d-arr
    const result = await ticketing.getMyTicket(userAddr);

    if (result.length === 0) {
      return callback({
        success: true,
        message: "보유 티켓 없음",
        data: [],
      });
    }

    let array = await makeData(result);

    callback({
      success: true,
      message: "my ticket 가져오기 성공",
      data: array,
    });
  },

  // @완료
  getResellTicket: async function (showId, callback) {
    const self = this;
    await Ticketing.setProvider(self.web3.currentProvider);
    const ticketing = await Ticketing.deployed();

    // 2d array
    const result = await ticketing.getResellTicket(showId);

    if (result.length === 0) {
      return callback({
        success: true,
        message: "해당 공연 tx 없음",
        data: [],
      });
    }

    let array = await makeData(result);

    callback({
      success: true,
      message: "tx 가져오기 성공",
      data: array,
    });
  },

  // @완료
  resellTicket: async function (bookingId, callback) {
    const self = this;
    await Ticketing.setProvider(self.web3.currentProvider);
    const ticketing = await Ticketing.deployed();

    try {
      await ticketing.resellTicket(bookingId, { from: manager });
    } catch (err) {
      console.log(err);
      throw err;
    }
    callback({ success: true, message: "거래 탭에 티켓 추가 완료" });
  },

  // @완료
  buyTicketForHandOver: async function (userId, userAddr, bookingId, callback) {
    const self = this;
    await Ticketing.setProvider(self.web3.currentProvider);
    const ticketing = await Ticketing.deployed();

    try {
      let ticket = await ticketing.getTicketForBookingId(bookingId, {
        from: manager,
      });
      // console.log("old");
      // console.log(ticket);

      await ticketing.pay(bookingId, { from: userAddr, value: ticket.price });
      await ticketing.removeFromUser(bookingId, { from: manager });
      await ticketing.changeTicketInfo(userId, userAddr, bookingId, {
        from: manager,
      });

      // ticket = await ticketing.getTicketForBookingId(bookingId, {from : manager});
      // console.log("new");
      // console.log(ticket);
    } catch (err) {
      console.log(err);
      throw err;
    }
    callback({
      success: true,
      message: "티켓 양도 받기 완료",
    });
  },

  // 일반 예매 취소
  cancelBasicTicket: async function (bookingId, callback) {
    const self = this;
    await Ticketing.setProvider(self.web3.currentProvider);
    const ticketing = await Ticketing.deployed();

    const ticket = await ticketing.getTicketForBookingId(bookingId, {
      from: manager,
    });

    // typeof = number
    let totalPrice = await calculatePrice(ticket);

    try {
      await ticketing.pay(bookingId, { from: manager, value: totalPrice });
      await ticketing.removeFromUser(bookingId, { from: manager });
      await ticketing.initializeTicketInfo(bookingId, { from: manager });

      // let ticket = await ticketing.getTicketForBookingId(bookingId, {from: manager});
      // console.log(ticket);
    } catch (err) {
      console.log(err);
      throw err;
    }
    callback({ success: true, message: "일반 예매 티켓 취소" });
  },

  // 추첨제 티켓 취소
  cancelLotteryTicket: async function (bookingId, callback) {
    const self = this;
    await Ticketing.setProvider(self.web3.currentProvider);
    const ticketing = await Ticketing.deployed();

    const ticket = await ticketing.getTicketForBookingId(bookingId, {
      from: manager,
    });

    let totalPrice = await calculatePrice(ticket);
    try {
      let ticket = await ticketing.getTicketForBookingId(bookingId, {
        from: manager,
      });
      console.log("old");
      console.log(ticket);

      await ticketing.pay(bookingId, { from: manager, value: totalPrice });
      await ticketing.removeFromUser(bookingId, { from: manager });
      await ticketing.changeOwner(bookingId, { from: manager });
      await ticketing.resellTicket(bookingId, { from: manager });

      ticket = await ticketing.getTicketForBookingId(bookingId, {
        from: manager,
      });
      console.log("new");
      console.log(ticket);
    } catch (err) {
      console.log(err);
      throw err;
    }
    callback({ success: true, message: "추첨 예매 티켓 취소" });
  },

  cancelReselling: async function (bookingId, callback) {
    const self = this;
    await Ticketing.setProvider(self.web3.currentProvider);
    const ticketing = await Ticketing.deployed();

    let manager = "0x246d89578e515F63DeCC1CEa8bD1df571aE3a705";
    try {
      await ticketing.cancelReselling(bookingId, {
        from: manager,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
    callback({ success: true, message: "양도 취소 완료" });
  },
};

async function calculatePrice(ticket) {
  // 날짜 차이 구하기
  const [[{ showdate }]] = await db.query(
    "select showdate from shows where showid = ?",
    [ticket.showId]
  );
  console.log(typeof showdate);

  const [[{ dateGap }]] = await db.query(
    "select datediff(?, now()) as dateGap",
    [showdate]
  );
  console.log(dateGap);

  // 환불 비율 구하기
  let refundRatio;
  if (dateGap >= 7) {
    refundRatio = RefundRatio.Before7;
  } else if (dateGap >= 3) {
    refundRatio = RefundRatio.Between7and3;
  } else if (dateGap >= 1) {
    refundRatio = RefundRatio.Between3and1;
  } else {
    refundRatio = RefundRatio.NoRefund;
  }

  let totalPrice = (ticket.price * refundRatio) / 100;
  return totalPrice;
}

async function makeData(result) {
  console.log("makedata result");
  console.log(result);
  let array = [];
  for (let i = 0; i < result.length; i++) {
    try {
      const [[rows]] = await Show.findById(result[i].showId);
      
      rows.bookingId = result[i].bookingId;
      rows.owner = result[i].owner;
      rows.status = result[i].status;
      rows.numberOfSeats = result[i].numberOfSeats;
      
      let [reservedSeat] = await db.query(
        "select seatid from seat where bookingId = ? and showid = ?",
        [result[i].bookingId, result[i].showId]
      );
      
      rows.reservedSeat = reservedSeat;

      let imgFile = fs.readFileSync(`./image/${rows.showid}.jpg`);
      let encode = Buffer.from(imgFile).toString("base64");
      rows.imgEncode = encode;
      
      array.push(rows);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  return array;
}
