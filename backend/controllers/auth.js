require('dotenv').config("../../.env");
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const jwt = require('jsonwebtoken');
const db = require('../util/database');

// 토큰 검증
exports.verifyToken = (req, res, next) => {
    try {
        // 해독된 페이로드
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY);
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

exports.issueToken = async (req, res) => {
    try{
        let sql = "select wallet from user where id = ?"
        let params = [req.body.id];
        const id = req.body.id;
        console.log(id);
        const token = await jwt.sign({ id }
            ,process.env.JWT_SECRET_KEY
            ,{expiresIn: '1d', issuer: '문정만크크크'});
            console.log("토큰 발급 완료");

        let result;
            
        try{
            const rows = await db.query(sql, [id]);
            console.log(rows[0][0]);
            return res.send({success: true, code: 200, message: '토큰 발급 완료', token, wallet: rows[0][0].wallet});
        } catch(err) {
            console.log(err);
            throw(err);
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러'
        });
    }

    

};