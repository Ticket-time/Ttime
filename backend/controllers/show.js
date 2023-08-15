const express = require("express");
const dotenv = require("dotenv").config();
const qrcode = require("qrcode");
const fs = require('fs');
const Show = require('../models/show');
const User = require('../models/user');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

exports.showAll = (req, res) => {
    Show.fetchAll()
    .then(([shows])=>{
        if (shows.length === 0) {
            return res.send({
                success: true, 
                message: "등록된 공연 없음",
                data: shows
            });
        }
//     for(let i = 0; i < data[0].length; i++) {
//         let showid = data[0][i].showid;
//         let imgFile = fs.readFileSync(`./image/${showid}_width.jpg`);
//         let encode = Buffer.from(imgFile).toString('base64');
//         data[0][i].imgEncode = encode;
//     }   
    
//     return res.send({success: true, message: "공연 정보 있음", data: data[0]});       
        console.log(shows);
    })
    .catch(err => console.log(err));
}

exports.getSearchedShow = async(req, res) => {
    const keyword = req.body.keyword;
    console.log(keyword);
    await Show.findByName(keyword)
    .then(([shows]) => {
        if(shows.length === 0) {
            return res.send({
                success: true, 
                message: "검색 결과 없음",
                data: shows
            });
        }
//     for(let i = 0; i < data[0].length; i++) {
//         let showid = data[0][i].showid;
//         let imgFile = fs.readFileSync(`./image/${showid}_width.jpg`);
//         let encode = Buffer.from(imgFile).toString('base64');
//         data[0][i].imgEncode = encode;
//     }   
    
//     return res.send({success: true, message: "공연 정보 있음", data: data[0]});
    })
    .catch(err => console.log(err));
}

exports.showDetails = (req, res) => {
    const { userid, showid } = req.body;
    let sysdate = new Date();

    console.log(`sysdate: ${sysdate}`);

    Show.findById(showid)
    .then(([data]) => {
        console.log(data);
        data = data[0];
        console.log(data);

        let _applystart = (new Date(data.applystart)).valueOf();
        console.log(`_applystart: ${_applystart}`);
        
        let _applyend = (new Date(data.applyend)).valueOf();
        console.log(`_applyend: ${_applyend}`);


        if (sysdate < _applystart) {
            return res.send({
                success: true,
                code:111,
                message: "응모 기간 전"
            });
        }

        if (sysdate > _applyend) {
            return res.send({
                success: true,
                code: 444,
                message: "응모 기간 종료"
            });
        }

        User.isApplied(userid, showid)
        .then(([rows]) => {
            if(rows.length === 0) {
                return res.send({
                    success: true,
                    code: 333,
                    message: "응모 가능"
                });
            }
            else {
                return res.send({
                    success: true,
                    code: 222,
                    message: "이미 응모함"
                })
            }
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}

exports.getQR = async(req, res) => {
    const { userid, showid } = req.body;
    let qrStr = JSON.stringify({userid: userid, showid: showid});

    Show.findById(showid)
    .then(([show]) => {
        // 근데 있는 공연만 가져오는건데 이 코드를 굳이 넣어야되나 
        if(show.length === 0) {
            console.log("공연 정보 없음");
            return res.send({
                success: true,
                message: "공연정보 없음"
            });
        }
        qrcode.toDataURL(qrStr, function(err, url) {
            if (err) {
                console.error(err);
                throw err;
            }
    
            return res.send({
                success: true, 
                data: show, 
                url: url
            });
        })
        

    })
    .catch(err => console.log())
}

