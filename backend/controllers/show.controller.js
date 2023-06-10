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

    const sql = "select * from shows where showid = ?;";
    let sysdate = new Date();
    console.log(`sysdate: ${sysdate}`);

    db.query(sql, [showid],
        (err, rows) => {
            if (err) {  // db 문제 
                console.log(err);
                return res.send({success: false, message: "DB 에러"});
            }
            console.log(rows[0]);
            console.log(rows[0].applystart);
            
            let _applystart = (new Date(rows[0].applystart)).valueOf();
            console.log(`_applystart: ${_applystart}`);
            
            let _applyend = (new Date(rows[0].applyend)).valueOf();
            console.log(`_applyend: ${_applyend}`);


            if (sysdate < _applystart) {
                return res.send({success: true, code:111, message: "응모 기간 전"});
            }

            if (sysdate > _applyend) {
                return res.send({success: true, code: 444, message: "응모 기간 종료"})
            }
             
            let sql = "select * from apply where userid = ? and showid = ?";
            db.query(sql, [userid, showid],
                (err, rows) => {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    
                    if (rows.length !== 0) 
                        return res.send({success: true, code: 222, message: "이미 응모함"});
                    else 
                        return res.send({success: true, code: 333, message: "응모 가능"});
                }            
            )
        }
    )
}

