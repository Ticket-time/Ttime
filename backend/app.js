const express = require("express");
const Web3 = require("web3");
const dotenv = require("dotenv").config();
const setInterval = require("./controllers/setInterval.js");
const search = require("./controllers/search.js");

const truffle_connect = require("./connect.js");
const bodyParser = require("body-parser");
const schedule = require("node-schedule");

const userRouter = require("./routes/user.js");
const showRouter = require("./routes/show.js");
const authRouter = require("./routes/auth.js");
const txRouter = require("./routes/tx");

const port = process.env.PORT;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/users", userRouter);
app.use("/shows", showRouter); // 전체 공연
app.use(authRouter);
app.use("/tx", txRouter);

app.post("/payTicket", (req, res) => {
  console.log("**** POST /payTicket ****");
  let showId = parseInt(req.body.showId);
  let ticketOwner = req.body.ticketOwner;
  console.log(showId);
  console.log(ticketOwner);
  truffle_connect.issueTicket(showId, ticketOwner, function (result) {
    res.send({ success: true, message: result });
  });
});

app.post("/createShow", (req, res) => {
  console.log("**** POST /createShow ****");
  let showOwner = req.body.showOwner;
  let ticketPrice = parseFloat(req.body.ticketPrice);
  // let ticketPrice = req.body.ticketPrice;
  truffle_connect.createShow(showOwner, ticketPrice, function (result) {
    res.send({ success: true, message: result });
  });
});

app.post("/home", (req, res) => {
  console.log("**** POST /home ****");
  let userAddr = req.body.userAddr;
  truffle_connect.getMyTicket(userAddr, function (result) {
    res.send(result);
  });
});

//setInterval.scheduleRandomFunc();

app.listen(port, () => {
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  truffle_connect.web3 = new Web3(
    new Web3.providers.HttpProvider("http://127.0.0.1:8545")
  );

  /**
   * 자정마다 실행하는 함수
   * 1. 추첨할 공연이 있는지 체크하는 함수
   * 2. 랭킹 재조정하고 이전 검색 기록 삭제하는 함수
   */

  const rule = new schedule.RecurrenceRule();
  rule.hour = 0;
  rule.minute = 0;
  rule.second = 0;
  rule.tz = "Asia/Seoul";

  schedule.scheduleJob(rule, function () {
    console.log("app.js파일에서 출력" + new Date());
    search.deleteWord();
    setInterval.callRandomFunc();

    // rank
  });

  console.log("Express Listening at http://localhost:" + port);
});
