const dotenv = require("dotenv").config();
const express = require("express");
//const db = require("../util/db2");
const db = require("../util/database");
const User = require("../models/user");
const Show = require("../models/show");

const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

exports.checkPayable = async (req, res) => {
  var userid = req.body.userid;
  var showid = req.body.showid;
  var sysdate = new Date();

  const sql1 = "SELECT isWin, payment FROM apply WHERE userid=? and showid=?;";
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
      return res.send({ success: true, message: "당첨X", code: 111 });
    }
    // 기간 확인 paystart ~ payend 사이일 것
    let _paystart = new Date(sql2s_result.paystart);
    let _payend = new Date(sql2s_result.payend);
    console.log(sysdate);
    console.log(_paystart);
    console.log(_payend);
    if (_paystart <= sysdate && _payend > sysdate) {
      console.log("결제 기간 내 입니다.");
      let code;
      if (sql1s_result.payment == true) {
        //이미 결제 완료
        return res.send({
          success: true,
          message: "결제가 이미 완료됨",
          code: 222,
        });
      } else {
        // 결제 안 된 상태 - 이 상태만 결제가 가능
        return res.send({
          success: true,
          message: "결제 가능",
          code: 333,
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
  });
};



//*************************************아래가 새로 짜는 코드 */
// 이걸 더더더더 쪼개면 될 거 같은데 
// 당첨 함수, 결제 여부 함수, 결제 기간 체크 함수? 이렇게 쪼개서 그걸 불러서 => 이걸 찾아야겠다.. 시발 ,, 
// 
// exports.checkPayable = async (req, res) => {

//   let userid, showid = {userid, showid}; 
//   let sysdate = new Date();

//   let isWin = false;
//   let isPaid = false;
//   let isPayable = false;
//   User.getApplyInfo(userid, showid)
//   .then(([apply]) => {
//     // length === 0 이면 일단 안씀 
//     apply = apply[0];
//     if(apply.isWin === true) {
//       isWin = true;
//       return apply;
//     }
//     return res.send({
//       isWin: isWin,
//       isPayable: isPayable,
//       isPaid: isPaid
//     })

//   }).then((apply) => {
//     Show.findById(showid)
//     .then()
//   })
//   .catch(err => console.log(err));


//   const sql1 = "SELECT isWin, payment FROM apply WHERE userid=? and showid=?;";
//   var params = [userid, showid];

//   const sql1s = mysql.format(sql1, params);

//   const sql2 = "SELECT paystart, payend FROM shows WHERE showid=?;";
//   const sql2s = mysql.format(sql2, showid);

//   db.query(sql1s + sql2s, async (err, results) => {
//     let sql1s_result = JSON.parse(JSON.stringify(results[0]));

//     let sql2s_result = JSON.parse(JSON.stringify(results[1]));
//     sql1s_result = sql1s_result[0];
//     sql2s_result = sql2s_result[0];

//     if (err) {
//       console.log(err);
//       throw err;
//     }
//     // 당첨 여부 확인
//     if (sql1s_result.isWin == 0) {
//       console.log("추첨 결과: X");
//       return res.send({ success: true, message: "당첨X", code: 111 });
//     }
//     // 기간 확인 paystart ~ payend 사이일 것
//     let _paystart = new Date(sql2s_result.paystart);
//     let _payend = new Date(sql2s_result.payend);
//     console.log(sysdate);
//     console.log(_paystart);
//     console.log(_payend);
//     if (_paystart <= sysdate && _payend > sysdate) {
//       console.log("결제 기간 내 입니다.");
//       let code;
//       if (sql1s_result.payment == true) {
//         //이미 결제 완료
//         return res.send({
//           success: true,
//           message: "결제가 이미 완료됨",
//           code: 222,
//         });
//       } else {
//         // 결제 안 된 상태 - 이 상태만 결제가 가능
//         return res.send({
//           success: true,
//           message: "결제 가능",
//           code: 333,
//         });
//       }
//     } else {
//       console.log("결제 기간이 지났습니다. 혹은 아직입니다.");
//       return res.send({
//         success: true,
//         message: "결제 불가",
//         code: 444,
//       });
//     }
//   });
// };
