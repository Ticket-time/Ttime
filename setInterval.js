require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./backend/controllers/db");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const random = require("./random.js");

function callRandomFunc() {
  console.log("매일 자정에 체크");
  // 추첨 시간: 응모 종료일 + 1 DAY
  const sql =
    "SELECT showid FROM shows WHERE DATE_ADD(applyend, INTERVAL 1 DAY) > CURDATE() and applyend < CURDATE()";
  db.query(sql, async (err, results) => {
    console.log(results);
    if (results.length > 0) {
      results.forEach((instance) => {
        let showid = instance.showid;
        random.random(showid);
      });
    }
  });
}

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
  const timeUntilMidnight = nextMidnight - now;

  setTimeout(() => {
    callRandomFunc(); // 자정에 호출될 함수를 호출합니다.
    setInterval(callRandomFunc, 24 * 60 * 60 * 1000); // 매일 자정에 반복 호출되도록 설정합니다.
  }, timeUntilMidnight);
}

callRandomFunc();
// scheduleRandomFunc();
// 외부 스케쥴러나 corn 이용?
