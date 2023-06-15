require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./db2");
const bodyParser = require("body-parser");
const mysql = require("mysql");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

exports.checkPayable = async (req, res) => {
  var userid = req.body.userid;
  var showid = req.body.showid;
  var sysdate = new Date();

  const sql1 = "SELECT isWin FROM apply WHERE userid=? and showid=?;";
  var params = [userid, showid];
  
  const sql1s = mysql.format(sql1, params);

  const sql2 = "SELECT paystart, payend FROM shows WHERE showid=?;";
  const sql2s = mysql.format(sql2, showid);

  db.query(sql1s + sql2s, async (err, results) => {
    let sql1s_result = JSON.parse(JSON.stringify(results[0]));
   
    let sql2s_result = JSON.parse(JSON.stringify(results[1]));
    sql1s_result = sql1s_result[0];
    sql2s_result = sql2s_result[0];

    if (err) {
      console.log(err);
      throw err;
    }
    // 당첨 여부 확인
    if (sql1s_result.isWin == 0) {
      console.log("추첨 결과: X");
      return res.send({ success: false, message: "당첨X" });
    }
    // 기간 확인 paystart ~ payend 사이일 것
    let _paystart = new Date(sql2s_result.paystart);
    let _payend = new Date(sql2s_result.payend);
    console.log(sysdate);
    console.log(_paystart);
    console.log(_payend);
    if (_paystart <= sysdate && _payend > sysdate) {
      console.log("결제 기간 내 입니다.");
      return res.send({
        success: true,
        message: "결제 가능",
      });
    } else {
      console.log("결제 기간이 지났습니다.");
      return res.send({
        success: false,
        message: "결제 불가",
      });
    }
  });
};
