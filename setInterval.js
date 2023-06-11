require("dotenv").config();
const db = require("./backend/controllers/db");
const random = require("./random.js");

module.exports = {
  scheduleRandomFunc: scheduleRandomFunc,
};

function scheduleRandomFunc() {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );

  const timeUntilMidnight = nextMidnight.getTime() - now.getTime();
  console.log("자정까지 시간(ms): " + timeUntilMidnight);

  setTimeout(() => {
    callRandomFunc(); // 자정에 호출될 함수를 호출합니다.
    setInterval(callRandomFunc, 24 * 60 * 60 * 1000); // 매일 자정에 반복 호출되도록 설정
  }, timeUntilMidnight);
}

function callRandomFunc() {
  console.log("추첨할 공연이 있는지 체크합니다.");
  // 추첨 시간: 응모 종료일 + 1 DAY
  const sql =
    "SELECT showid FROM shows WHERE curdate() = DATE(DATE_ADD(applyend, INTERVAL 1 DAY))";
  db.query(sql, async (err, results) => {
    console.log(results);
    if (results.length > 0) {
      results.forEach((instance) => {
        let showid = instance.showid;
        console.log(showid + " 추첨 시작합니다.");
        random.random(showid);
      });
    }
  });
}
