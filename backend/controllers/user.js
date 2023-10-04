const express = require("express");
const dotenv = require("dotenv").config();
const fs = require("fs");
const Web3 = require("web3");
const bodyParser = require("body-parser");
const Web3Utils = require("web3-utils");
const User = require("../models/user");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://127.0.0.1:8545"));

exports.getETH = async (req, res) => {
  const { wallet } = req.body;

  if (!wallet) {
    return res.send({ success: false, message: "잘못된 지갑 주소" });
  }
  
  let balance = web3.eth.getBalance(wallet);
  balance = Web3Utils.toBN(balance);
  balance = Web3Utils.fromWei(balance, "ether");
  
  console.log(`wallet ${wallet} : ${balance} ETH`);

  return res.send({
    success: true,
    message: "잔액 조회 성공",
    balance: balance,
  });
};

exports.signup = async (req, res) => {
  const { id, password, phoneNumber, wallet} = req.body;

  User.create(id, password, wallet, phoneNumber)
  .then(() => {
    return res.send({
      success: true,
      message: "회원가입 완료"
    });
  }).catch(err => console.log(err));
};

// 로그인 -> 토큰 발급
exports.login = async (req, res, next) => {
  const { id, password } = req.body;

  try{
    const [[rows]] = await User.findId(id);  // json

    if(rows === undefined || rows.password !== password) {
      console.log("로그인 정보가 일치하지 않습니다.");
      return res.send({
        success: false, 
        message: "로그인 실패" 
      });
    } else {
      console.log("로그인 성공.");
      return next();
    }
  } catch (err) {
    console.log(err);
  } 
};

exports.apply = (req, res) => {
  const showid = req.body.showid;
  const userid = req.decoded.id;  

  User.apply(showid, userid)
  .then(() => {
    console.log(`응모 완료: 공연 ${showid}, 유저 ${userid}`);
    return res.send({
      success: true,
      code: 222,
      message: "응모 완료"
    });
  })
  .catch(err => {      
    console.log(err);
    return res.send({
      success: false,
      message: "DB 오류"
    })
  });
};

exports.applyList = (req, res) => {
  const userid = req.decoded.id;
  
  User.getApplyList(userid)
  .then(([rows]) => {
    if(rows.length === 0) {
      return res.send({
        success: true,
        message: "응모 내역 없음",
        data: rows
      });
    }

    for (let i = 0; i < rows.length; i++) {
      let imgFile = fs.readFileSync(`./image/${rows[i].showid}.jpg`);
      let encode = Buffer.from(imgFile).toString("base64");
      rows[i].imgEncode = encode;
    }

    return res.send({
      success: true,
      message: "응모 내역 있음",
      data: rows,
    });

  })
  .catch(err => console.log(err))
};

// 응모 내역에 대한 결제 가능 여부
exports.checkPayable = async (req, res) => {

  let {userid, showid} = req.body;
  let sysdate = new Date();
  
  try {
    const [[apply]] = await User.getApplyInfo(userid, showid);
    
    // 탈락 
    if(apply.isWin == false) {
      return res.send({ 
        success: true, 
        message: "당첨 실패", 
        code: 111 
      });
    }

    // 당첨 - 결제 완료 
    if (apply.payment == true) {
      return res.send({
        success: true,
        message: "결제 완료",
        code: 222,
      });
    }

    // 당첨 - 결제 기간 지남 
    let paymentPeriod = new Date(apply.payend);
    if (sysdate > paymentPeriod) {
      return res.send({
        success: true,
        message: "결제 기간 만료",
        code: 444,
      });
    }
      // 결제 아직 안함 
    return res.send({
      success: true,
      message: "결제하기",
      code: 333,
    });

  }
  catch(err) {
    console.log(err);
  }
}