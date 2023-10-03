const express = require("express");
const dotenv = require("dotenv").config();
const truffle_connect = require("../connect");
const db = require("../util/database");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

module.exports = {

// @완료 
  getResellTicket: (req, res) => {
    const { showId } = req.body;
    truffle_connect.getResellTicket(showId, function (result) {
      res.send(result);
    });
  },


// @완료
// 거래탭에 올린다는 함수
  resell: (req, res) => {
    // ticketId = bookingId
    const { bookingId, userAddr } = req.body;

    truffle_connect.resellTicket(bookingId, function (result) {
      res.send(result);
    });
  },


// @완료 - 거래탭에 올라온 "양도" 티켓을 구매하는 함수
  handOver: (req, res) => {
    const { userId, bookingId, userAddr } = req.body;

    truffle_connect.buyTicketForHandOver(userId, userAddr, bookingId, function (result) {
      res.send(result);
    });
  },

  cancelTicket: async (req, res) => {
    const { bookingId } = req.body;
  
    truffle_connect.cancelBasicTicket(bookingId, function(result) {
      res.send(result);
    })
  },

  cancelLotteryTicket: async (req, res) => {
    const { bookingId } = req.body;
  
    truffle_connect.cancelLotteryTicket(bookingId, function(result) {
      res.send(result);
    })
  },
   
};
