require("dotenv").config();
const express = require("express");
const app = express();
const Web3 = require("web3");
const port = 3000 || process.env.PORT;
const setInterval = require("../setInterval.js");
const truffle_connect = require("./connect.js");

// const smtpTransport = require('./email.js');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var userRouter = require("./routes/userRouter");
var showRouter = require("./routes/showRouter");
app.use("/users", userRouter);
app.use("/shows", showRouter); // 전체 공연

app.post("/payTicket", (req, res) => {
  console.log("**** POST /payTicket ****");
  // showId, ticketOwner
  let showId = parseInt(req.body.showId);
  let ticketOwner = req.body.ticketOwner;
  // ticketPrice 어떻게 처리할 건지
  // 1. showId로 db query 날려서 불러오기
  // 2. show 구조체에 같이 저장은 했는데 dk 될듯
  // let ticketPrice = parseFloat(req.body.ticketPrice);
  // value값은 wei로 또 변환 해야함
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

setInterval.scheduleRandomFunc();
// // email 인증
// app.post("/mail_verify", async(req, res)=> {

//     let date = new Date();
//     let id = req.body.id;
//     let email = req.body.email;

//     const emailToken = jwt.sign(
//         {
//             "id": id,
//             "created": date.toString()
//         },
//         process.env.JWT_SECRET_KEY_EMAIL,
//         {
//              expiresIn: process.env.JWT_EXPIRES_IN
//         }
//     );

//     let url = `${process.env.BASE_URL}/user/confirmation/${emailToken}`;

//     let info = await smtpTransport.sendMail({
//         from: 'T-Time', // sender address
//         to: email, // list of receivers seperated by comma
//         subject: "Account Verification", // Subject line
//         html: `Please click this email to confirm your email: <a href="${url}">${url} </a>`// plain text body
//     }, (error, info) => {

//         if (error) {
//             console.log(error)
//             return;
//         }
//         console.log('Message sent successfully!');
//         console.log(info);
//         smtpTransport.close();
//         res.send('성공');
//     });

// });
app.listen(port, () => {
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  truffle_connect.web3 = new Web3(
    new Web3.providers.HttpProvider("http://127.0.0.1:8545")
  );

  console.log("Express Listening at http://localhost:" + port);
});
