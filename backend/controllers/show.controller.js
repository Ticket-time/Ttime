require("dotenv").config();
const express = require("express");
const app = express();
const db = require('./db');
const bodyParser = require("body-parser");
const mysql = require("mysql");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


exports.showAll = async(req, res) => {
    let sql = "select * from shows"
    let keyword = req.body.keyword;
    if (!(keyword === undefined)) {
        sql = "select * from shows where showname like ";
        keyword = '\'%' + keyword + '%\'';
        sql = sql + keyword;
    }
    
    //db에서 전체 정보를 불러온다
    db.query(sql, [req.body.keyword],
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

// 응모 정보를 db에 저장 
exports.apply = async(req, res) => {

    const showid = req.body.showid;
    const userid = req.decoded.id;  // jwt 인증한 user 

    //db에 추가
    db.query("insert into apply(showid, userid) values(?, ?)", [showid, userid],
        (err, rows) => {
            if (err) {  // 잘못된 정보 입력 or db 문제 
                console.log(err);
                return res.send({success: false, message: "응모 실패"});
            }

            console.log(`응모 완료: 공연 ${showid}, 유저 ${userid}`);
            return res.send({success: true, message: "응모 완료"});
        }
    )
};

exports.showDetails = async(req, res) => {
    const { userid, showid } = req.body;

    const sql1 = "select * from shows where showid = ?;";
    const sql2 = "select * from apply where userid = ? and showid = ?;";
    const sql1s = mysql.format(sql1, [showid]);
    const sql2s = mysql.format(sql2, [userid, showid]);
  
    let sysdate = new Date();

    db.query(sql1s + sql2s,
        (err, results) => {
            if (err) {  // db 문제 
                console.log(err);
                return res.send({success: false, message: "DB 에러"});
            }

            let show = results[0][0];   // 그 클릭한 공연 정보 불러온거 
            let applyInfo = results[1];   // 유저가 클릭한 공연을 응모했는지 응모 테이블 select 결과 
            console.log(show);
            console.log(applyInfo);
         
            let _applystart =  new Date(show.applystart);
            let _applyend = new Date(show.applyend);

            if (sysdate < _applystart) {
                return res.send({success: true, code:111, message: "응모 기간 전"});
            }
            else if (sysdate >= _applystart && sysdate < _applyend ){
                // 응모 기간 중 유저가 이미 응모를 했으면 
                if(applyInfo.length > 0)
                    return res.send({success: true, code: 222, message: "이미 응모함"});
                else     // 응모 기간 중 유저가 아직 응모를 안했으면 
                    return res.send({success: true, code: 333, message: "응모 가능"});
            }
            else {
                return res.send({success: true, code: 444, message: "응모 기간 종료"})
            }
        }
    )
}
