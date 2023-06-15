require("dotenv").config();
const express = require("express");
const app = express();
var fs = require('fs');
const db = require('./db');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

exports.showAll = async (req, res) => {
  let sql = "select * from shows";
  let keyword = req.body.keyword;
  let imgArr = [];
  if (!(keyword === undefined)) {
    sql = "select * from shows where showname like ";
    keyword = "'%" + keyword + "%'";
    sql = sql + keyword;
  }

  //db에서 전체 정보를 불러온다
  db.query(sql, [req.body.keyword], (err, rows) => {
    if (err) {
      console.log(err);
      throw err;
    }
    for (let i = 0; i < rows.length; i++) {
      let showid = rows[i].showid;
      let imgFile = fs.readFileSync(`./image/${showid}_width.jpg`);
      let encode = Buffer.from(imgFile).toString("base64");
      rows[i].imgEncode = encode;
    }

    return res.send({ success: true, data: rows });
  });
};

exports.showAll = async(req, res) => {
    console.log("its show");
    let sql = "select * from shows"
    let keyword = req.body.keyword;
    if (!(keyword === undefined)) {
        sql = "select * from shows where showname like ";
        keyword = '\'%' + keyword + '%\'';
        sql = sql + keyword;
    }

    //db에서 전체 정보를 불러온다
    try{
        const data = await db.query(sql, [keyword]);
        if (data[0].length === 0) {
            console.log("공연 정보 없음");
            return res.send({success : false, message: "공연정보 없음"});
        }
        for(let i = 0; i < data[0].length; i++) {
            let showid = data[0][i].showid;
            let imgFile = fs.readFileSync(`./image/${showid}_width.jpg`);
            let encode = Buffer.from(imgFile).toString('base64');
            data[0][i].imgEncode = encode;
        }   
        
        return res.send({success: true, data: data[0]});
    
    } catch(err) {
        console.log(err);
        throw(err);
    }    
}

// 응모 정보를 db에 저장 
exports.apply = async(req, res) => {

    const showid = req.body.showid;
    const userid = req.decoded.id;  // jwt 인증한 user 

    //db에 추가
    try {
        const data = await db.query("insert into apply(showid, userid) values(?, ?)", [showid, userid]);
        console.log(data);
        console.log(`응모 완료: 공연 ${showid}, 유저 ${userid}`);
        return res.send({success: true, code: 222, message: "응모 완료"});
    }catch(err) {
        console.log(err);
        //throw(err);
        return res.send({success: false, message: "응모 실패"});
    }  
};

exports.showDetails = async(req, res) => {
    const { userid, showid } = req.body;

    const sql = "select * from shows where showid = ?;";
    let sysdate = new Date();
    console.log(`sysdate: ${sysdate}`);

    try{
        let data = await db.query(sql, [showid]);
        data = data[0][0]
        console.log(data);

        let _applystart = (new Date(data.applystart)).valueOf();
        console.log(`_applystart: ${_applystart}`);
        
        let _applyend = (new Date(data.applyend)).valueOf();
        console.log(`_applyend: ${_applyend}`);
        if (sysdate < _applystart) {
            return res.send({success: true, code:111, message: "응모 기간 전"});
        }

        if (sysdate > _applyend) {
            return res.send({success: true, code: 444, message: "응모 기간 종료"})
        }

        let sql2 = "select * from apply where userid = ? and showid = ?";    
        try{
            let data2 = await db.query(sql2, [userid, showid]);
            if (data2[0].length !== 0) 
                return res.send({success: true, code: 222, message: "이미 응모함"});
            else 
                return res.send({success: true, code: 333, message: "응모 가능"});
        } catch(err) {
            throw(err);
        }

    }catch(err){
        throw(err);
    }
}