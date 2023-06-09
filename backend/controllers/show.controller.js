require("dotenv").config();
const express = require("express");
const app = express();
const db = require('../../backend/db');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


exports.showAll = async(req, res) => {
    // db에서 전체 정보를 불러온다
    db.query("select * from shows",
        (err, rows) => {
            if (err) {
                console.log(err);
                throw err;
            }

            if (rows.length == 0) {
                console.log("공연 정보 없음");
                return res.send({success : false, message: "공연정보 없음"});
            }

            return res.send({success: true, data: rows});
        }
    );
}