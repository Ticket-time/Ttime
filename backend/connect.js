const contract = require("truffle-contract");

const ticketing_artifact = require("../build/contracts/Ticketing.json");
var Ticketing = contract(ticketing_artifact);

module.exports = {
  createShow: function (callback) {
    var self = this;
    var ticketing;
    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        return ticketing.createShow();
      })
      .catch(function (e) {
        console.log(e);
        callback("ERROR 404");
      });
  },
  issueTicket: function (showId, owner, callback) {
    var self = this;
    Ticketing.setProvider(self.web3.currentProvider);
    var ticketing;

    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        return ticketing.issueTicket(showId, owner, {
          from: owner,
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
