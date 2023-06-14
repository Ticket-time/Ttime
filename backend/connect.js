const contract = require("truffle-contract");
const Web3 = require("web3");
var web3 = new Web3();
const ticketing_artifact = require("../build/contracts/Ticketing.json");
var Ticketing = contract(ticketing_artifact);

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
        console.log(price);
        return ticketing.issueTicket(showId, ticketOwner, {
          from: ticketOwner,
          value: price,
        });
      })
      .then(function (value) {
        // log 확인
        for (var i = 0; i < value.logs.length; i++) {
          var log = value.logs[i];
          if (log.event == "ISSUE_TICKET") {
            // We found the event!
            let param1 = log.args._showId;
            let param2 = log.args._ticketId;
            if (showId == param1) {
              callback(`showId: ${param1}, ticketId: ${param2}`);
            }
            break;
          }
        }
      })
      .catch(function (e) {
        console.log(e);
        callback("ERROR 404");
      });
  },
};
