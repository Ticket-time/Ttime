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
  // 지갑 주소
  const wallet = req.body.wallet;
  console.log(wallet);
  if (!wallet) {
    return res.send({ success: false, message: "잘못된 지갑 주소" });
  }
  
  let balance = web3.eth.getBalance(wallet);
  balance = Web3Utils.toBN(balance);
  balance = Web3Utils.fromWei(balance, "ether");
  console.log(typeof balance);
  console.log(`${balance} ETH`);
  return res.send({
    success: true,
    message: "잔액 조회 성공",
    balance: balance,
  });
};

//****************************************************************************************** */

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

  User.findId(id)
  .then(([rows]) => {
    if(rows.length === 0 || rows[0].password !== password) {
      console.log("로그인 정보가 일치하지 않습니다.");
      return res.send({
        success: false, 
        message: "로그인 실패" 
      });
    } else {
      console.log("로그인 성공.");
      return next();

    }
  })
  .catch(err => console.log(err));
};

exports.apply = (req, res) => {
  const showid = req.body.showid;
  const userid = req.decoded.id;  // jwt 인증한 user 
  

  User.apply(showid, userid)
  .then(([rows, fieldData]) => {
    console.log(rows);
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
  //const userid = req.body.id;
  
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

exports.checkPayable = (req, res) => {

  let {userid, showid} = req.body;
  let sysdate = new Date();

  User.getApplyInfo(userid, showid)
  .then(([apply]) => {
    // length === 0 이면 일단 안씀 
    apply = apply[0];
    if(apply.isWin == false) {
      return res.send({ 
        success: true, 
        message: "당첨되지 않았습니다.", 
        code: 111 });
    }
    
    let _paystart = new Date(apply.paystart);
    let _payend = new Date(apply.payend);

    if (_paystart <= sysdate && _payend > sysdate) {
      // 결제 기간
      //console.log(apply.payment, typeof(apply.payment));

      if(apply.payment == true) {
        return res.send({
          success: true,
          message: "결제가 이미 완료됨",
          code: 222,
        });
      } else {
        return res.send({
          success: true,
          message: "결제 가능",
          code: 333
        });
      }
    } else {
      console.log("결제 기간이 지났습니다. 혹은 아직입니다.");
      return res.send({
        success: true,
        message: "결제 불가",
        code: 444,
      });
    }
   
  })
  .catch(err => console.log(err));
}