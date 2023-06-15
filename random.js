require("dotenv").config();
const db = require("./backend/controllers/db");
const mysql = require("mysql");

module.exports = {
  random: function (showid) {
    // 좌석 수 가져오기
    let sql1 = "SELECT seats FROM shows WHERE showid=?;";
    const sql1s = mysql.format(sql1, showid);
    // apply 테이블에서 해당공연 응모자 가져오기
    let sql2 = "SELECT userid FROM apply WHERE showid=?;";
    const sql2s = mysql.format(sql2, showid);

    db.query(sql1s + sql2s, async (err, results) => {
      if (err) {
        console.log(err);
        throw err;
      }
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
  },
};