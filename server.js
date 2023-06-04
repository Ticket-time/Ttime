const express = require("express");
const app = express();
const port = 3000 || process.env.PORT;
const Web3 = require("web3");
const truffle_connect = require("./connection/app.js");
const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use("/", express.static("public_static"));

app.get("/testGet", (req, res) => {
  res.send("hello world");
});

app.get("/getAccounts", (req, res) => {
  console.log("**** GET /getAccounts ****");
  truffle_connect.start(function (answer) {
    res.send(answer);
  });
});

app.post("/getBalance", (req, res) => {
  console.log("**** GET /getBalance ****");
  console.log(req.body);
  let currentAcount = req.body.account;

  truffle_connect.refreshBalance(currentAcount, (answer) => {
    let account_balance = answer;
    truffle_connect.start(function (answer) {
      // get list of all accounts and send it along with the response
      let all_accounts = answer;
      response = [account_balance, all_accounts];
      res.send(response);
    });
  });
});

app.post("/sendCoin", (req, res) => {
  console.log("**** GET /sendCoin ****");
  console.log(req.body);

  let amount = req.body.amount;
  let sender = req.body.sender;
  let receiver = req.body.receiver;

  truffle_connect.sendCoin(amount, sender, receiver, (balance) => {
    res.send(balance);
  });
});

// 거래 목록 불러오기
app.get("/transaction", (req, res) => {
  console.log("**** GET /transaction ****");
  // truffle_connect.??;
});

// 선택한 쇼 불러오기
app.get("/ticketing", (req, res) => {
  console.log("**** GET /ticketing ****");

  const showId = req.query.showId;
  res.send(showId);
  // truffle_connect.getShowInfo(showId, (answer) => {
  //   res.send(answer);
  // });
});

// 공연 생성
app.post("/createShow", (req, res) => {
  console.log("**** POST /createShow ****");
  console.log(req.body);

  let sender = req.body.sender;
  let name = req.body.name;
  let date = req.body.date;
  let totalNumOfSeat = req.body.totalNumOfSeat;
  let ticketPrice = req.body.ticketPrice;

  truffle_connect.createEvent(
    sender,
    name,
    date,
    totalNumOfSeat,
    ticketPrice,
    (answer) => {
      console.log(ticketPrice);
      res.send(answer);
    }
  );
});

// 티켓 발행
app.post("/issueTicket", (req, res) => {
  console.log("**** POST /issueTicket ****");
  truffle_connect.issueTicket(function (answer) {
    res.send(answer);
  });
});

app.listen(port, () => {
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  truffle_connect.web3 = new Web3(
    new Web3.providers.HttpProvider("http://localhost:8545")
  );

  console.log("Express Listening at http://localhost:" + port);
});
