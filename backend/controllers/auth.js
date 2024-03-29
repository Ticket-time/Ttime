require('dotenv').config("../../.env");
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const jwt = require('jsonwebtoken');
const db = require('../util/database');
const User = require('../models/user');


exports.issueToken = async (req, res) => {
    try{
        const { id } = req.body;
        const token = jwt.sign(
            { id } 
            ,process.env.JWT_SECRET_KEY
            ,{expiresIn: '1d', issuer: '마이너송'});

        console.log(`${id} 토큰 발급 완료`);

        const [[{wallet}]] = await db.query("select wallet from user where id = ?", [id]);

        return res.send({
            success: true,
            message: '토큰 발급 완료',
            token : token,
            wallet: wallet
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러'
        });
    }
};

exports.verifyToken = (req, res, next) => {
    try {
        // 해독된 페이로드
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY);
        console.log("토큰 검증 성공");
        return next();

    } catch (error) {
        console.log(error.name);
        if (error.name === 'TokenExpiredError') {
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.'
            });
        }
        return res.status(401).json({
            code: 401,
            message: '유효하지 않은 토큰입니다.'
        })
    }
}


exports.checkID = (req, res) => {
    const { userid } = req.body;
    User.findId(userid)
    .then(([rows]) => {
        if(rows.length === 0) { // 중복 id 없음
            return res.send({
                confirmed: true,
                message: "중복 ID 없음",
                success: true
            })
        }
        else {
            return res.send({
                confirmed: false,
                message: "중복되는 ID",
                success: true
            })
        }
    }).catch(err => console.log(err));
}

exports.checkPhoneNumber = (req, res, next) => {
    const { phoneNumber } = req.body;
    User.findPhoneNumber(phoneNumber)
    .then(([rows]) => {
        if(rows.length === 0) { // 중복 id 없음
            next();
        }
        else {
            return res.send({
                confirmed: false,
                message: "이미 가입된 전화번호",
                success: true
            })
        }
    }).catch(err => console.log(err));
}