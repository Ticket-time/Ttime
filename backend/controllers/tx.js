const express = require("express");
const dotenv = require("dotenv").config();
const truffle_connect = require("../connect");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

module.exports = {
  getResellTicket: (req, res) => {
    let showId = parseInt(req.body.showId);
    truffle_connect.getResellTicket(showId, function (result) {
      res.send(result);
    });
  },
  resell: (req, res) => {
    let showId = parseInt(req.body.showId);
    let ticketId = parseInt(req.body.ticketId);
    let userAddr = req.body.userAddr;
    truffle_connect.resellTicket(showId, ticketId, userAddr, function (result) {
      res.send(result);
    });
  },
  handOver: (req, res) => {
    let showId = parseInt(req.body.showId);
    let userAddr = req.body.userAddr;
    truffle_connect.handOverTicket(showId, userAddr, function (result) {
      res.send(result);
    });
  },
};
