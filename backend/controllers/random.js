require("dotenv").config();
const db = require("../util/database");

module.exports = {
  random: async function (showid) {
    
    let [[{seats}]] = await db.query("SELECT seats FROM shows WHERE showid = ?", [showid]);
    let [applicants] = await db.query("SELECT userid, isWin FROM apply WHERE showid = ?", [showid]);   // 1d json array

    let numOfSeats = seats;
    let numOfApplicants = applicants.length;
    let winnerArray = new Array(numOfSeats);  // index: 좌석, value: userid 

    // 전원 당첨
    if (numOfApplicants <= numOfSeats) {
      for (let i = 0; i < numOfApplicants; seatid++) {
        winnerArray[i] = applicants[i].userid;  
      }
    }
    else { // 일부 당첨
      for (let i = 0; i < numOfSeats; i++) {
        let pickIndex = Math.floor(Math.random() * numOfApplicants);

        if (applicants[pickIndex].isWin == true) {
          console.log("이미 당첨.");
          i--;
        }
        else {
          console.log("아직 당첨되지 않은 사람입니다.");
          applicants[pickIndex].isWin = true;
          winnerArray[i] = applicants[pickIndex].userid;  // 당첨자 userid 저장
        } 

      }
    }
      
    let userid;
    try{
      for (let seatid = 1; seatid <= winnerArray.length; seatid++) {
        userid = winnerArray[seatid - 1];
        await db.execute("UPDATE apply SET isWin = 1, seatid = ? WHERE userid = ? and showid = ?", [seatid, userid, showid]);
      }

    } catch(err) {
      console.log(err);
    }

    console.log(winnerArray);
  }   
 };
