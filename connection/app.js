const contract = require("truffle-contract");

const ticketing_artifact = require("../build/contracts/Ticketing.json");
var Ticketing = contract(ticketing_artifact);

module.exports = {
  start: function (callback) {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    // MetaCoin.setProvider(self.web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    self.web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        console.log("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        console.log(
          "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        );
        return;
      }
      self.accounts = accs;
      self.account = self.accounts[2];

      callback(self.accounts);
    });
  },
  book: function (account, callback) {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    // MetaCoin.setProvider(self.web3.currentProvider);

    var ticketing;
    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        return ticketing.book();
      })
      .catch(function (e) {
        console.log(e);
        callback("Error 404");
      });
  },
  random: function (callback) {
    var self = this;

    var ticketing;
    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        return ticketing.random();
      })
      .catch(function (e) {
        console.log(e);
        callback("ERROR 404");
      });
  },
  sendCoin: function (amount, sender, receiver, callback) {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    // MetaCoin.setProvider(self.web3.currentProvider);

    var ticketing;
    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        return ticketing.sendCoin(receiver, amount, { from: sender });
      })
      .then(function () {
        self.refreshBalance(sender, function (answer) {
          callback(answer);
        });
      })
      .catch(function (e) {
        console.log(e);
        callback("ERROR 404");
      });
  },
  issueTicket: function (showId, buyer, callback) {
    var self = this;

    var ticketing;
    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        return ticketing.issueTicket(showId, buyer);
      })
      .catch(function (e) {
        console.log(e);
        callback("ERROR 404");
      });
  },
  resellTicket: function (showId, ticketId, callback) {
    var self = this;
    var ticketing;
    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        return ticketing.resellTicket(showId, ticketId);
      })
      .catch(function (e) {
        console.log(e);
        callback("ERROR 404");
      });
  },
  buyTicket: function (sellingQueueIndex, callback) {
    var self = this;
    var ticketing;
    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        return ticketing.buyTicket(sellingQueueIndex);
      })
      .catch(function (e) {
        console.log(e);
        callback("ERROR 404");
      });
  },
  getShowInfo: function (showId, callback) {
    var self = this;

    Ticketing.setProvider(self.web3.currentProvider);

    var ticketing;
    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        return ticketing.getShowInfo(showId);
      })
      .catch(function (e) {
        console.log(e);
        callback("소원이 노답임");
      });
  },
  createEvent: function (
    sender,
    name,
    date,
    totalNumOfSeat,
    ticketPrice,
    callback
  ) {
    var self = this;

    Ticketing.setProvider(self.web3.currentProvider);

    var ticketing;
    Ticketing.deployed()
      .then(function (instance) {
        ticketing = instance;
        console.log(ticketing);
        return ticketing.createEvent(name, date, totalNumOfSeat, ticketPrice, {
          from: sender,
        });
      })
      .then(function (value) {
        callback(value.valueOf());
      })
      .catch(function (e) {
        console.log(e);
        callback("왜 에러남");
      });
  },
};
