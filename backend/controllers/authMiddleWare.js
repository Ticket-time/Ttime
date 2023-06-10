const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const jwt = require('jsonwebtoken');
require('dotenv').config("../../.env");

// 토큰 검증
exports.verifyToken = (req, res, next) => {
    try {
        // 해독된 페이로드 
        ///req.user.jwt = jwt;
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY);
        //console.log(req.decoded);
        console.log(req.decoded);
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

exports.issueToken = (req, res) => {
    try{
        const id = req.body.id;
        const token = jwt.sign({ id }
            ,process.env.JWT_SECRET_KEY
            ,{expiresIn: '1m', issuer: '문정만크크크'});
            console.log("토큰 발급 완료");
        return res.send({success: true, code: 200, message: '토큰 발급 완료', token});

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러'
        });
    }
};