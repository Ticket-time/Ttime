// setInverval() 써서 매일 정각에 추첨할 공연이 있는지 체크
// 공연 db에서 targetDate 받아오기 - applyend 받아오고, 하루 뒤로 설정(임의)
// 애초에 db에서 applyend 모두 받아와서 추첨할 공연 체크
// 있다면, apply 테이블 정보 가져와서, random() 돌리고
// apply update
require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./backend/controllers/db");
const bodyParser = require("body-parser");
const mysql = require("mysql");
var targetDate = new Date("2023-06-10T16:27:00");
var now = new Date(); // 현재 시간
// if (now >= targetDate) {
//   random();
// } else {
//   console.log("아직 아닙니다");
// }

const sql =
  "SELECT showid, applyend FROM shows WHERE DATE_ADD(applyend, INTERVAL 1 DAY) > CURDATE()";
db.query(sql, async (err, results) => {
  // console.log(results);
  if (results.length > 0) {
    // random()함수 실행
    random(1);
  }
});

function random(showid) {
  // 좌석 수 가져오기
  let sql1 = "SELECT seats FROM shows WHERE showid=?;";
  const sql1s = mysql.format(sql1, showid);
  // apply 테이블에서 해당공연 응모자 가져오기
  let sql2 = "SELECT userid FROM apply WHERE showid=?;";
  const sql2s = mysql.format(sql2, showid);

  db.query(sql1s + sql2s, async (err, results) => {
    let sql1s_result = JSON.parse(JSON.stringify(results[0]));
    let sql2s_result = JSON.parse(JSON.stringify(results[1]));

    let numOfSeats = sql1s_result[0].seats;
    let numOfApplicants = sql2s_result.length;
    let checkArray = new Array(numOfApplicants).fill(false);
    let winnerArray = new Array(numOfSeats);
    let idx = 0;

    // (응모자 수 > 좌석수)
    if (numOfApplicants > numOfSeats) {
      for (let i = 0; i < numOfSeats; i++) {
        // 좌석수 만큼 반복
        let pickIndex = Math.floor(Math.random() * numOfApplicants);
        if (checkArray[pickIndex] == false) {
          console.log("아직 당첨되지 않은 사람입니다.");
          checkArray[pickIndex] = true;
        } else {
          // 다시 돌리기
          console.log("이미 당첨된 사람입니다.");
          i--;
        }
        console.log(sql2s_result[pickIndex].userid); // 당첨자 userid
      }
      for (let j = 0; j < checkArray.length; j++) {
        //
        if (checkArray[j] == true) {
          console.log("당첨자 확인");
          let userid = sql2s_result[j].userid;
          console.log(userid);
          winnerArray[idx++] = userid;
        }
      }
      console.log(winnerArray);
    } else {
      // (응모자 수 <= 좌석 수)
      winnerArray = new Array(numOfApplicants);
      checkArray.fill(true);
      idx = 0;
      for (let k = 0; k < numOfApplicants; k++) {
        userid = sql2s_result[k].userid;
        winnerArray[idx++] = userid;
      }
    }

    // winnerArray를 토대로 db에 isWin column update
    winnerArray.forEach((userid) => {
      const sql3 = "UPDATE apply SET isWin=1 WHERE userid=? and showid=?";
      db.query(sql3, [userid, showid], (error, results) => {
        if (error) throw error;
        console.log(`Updated userid: ${userid}`);
      });
    });
  });
}

// let seatArray = new Array(numOfSeats);
// for (let k = 0; k < numOfApplicants; k++) {
//   let pickIndex = Math.floor(Math.random() * numOfSeats);
//   seatArray[pickIndex] = sql2s_result[k].userid; // k 번째 사람 차례대로 랜덤으로 좌석 배정
// }
// console.log(seatArray);
