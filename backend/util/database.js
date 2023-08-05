const mysql = require("mysql2");
const dotenv = require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT,
  multipleStatements: true,
  dateStrings: "date",
  database: 'ttime'
});

// pool.connect(err => {
//   if (err) {
//     return console.error("DB connection failed" + err.stack);
//   }
//   console.log("connected to DB");
// });

module.exports = pool.promise();
