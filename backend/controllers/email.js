const nodemailer = require('nodemailer');
require('dotenv').config("../../.env");
const express = require('express');
const app = express();
app.use(express.json());

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PWD
    },
    tls: {
        rejectUnauthorized: false
    }
  });

exports.sendEmail = async(req, res) => {
    try {
        console.log(req.body.email);
        const number = ((Math.round(Math.random() * 1000000)) + '').padStart(6, '0');
        const info = await smtpTransport.sendMail({
            from : process.env.EMAIL_ID,
            to: req.body.email,
            subject: "[T-Time]인증 관련 이메일 입니다",
            text: "앱으로 돌아가 인증 코드 6자리를 입력해주세요: " + number
        });
        return res.status(200).json({
            number,
            message: "전송 완료"
        }); 
        //소원아 부탁한다. 앞에서 확인ㄱㄴ? 

    } catch(error) {
        console.log(error);
        return res.json({
            code: 500,
            message: '이메일 전송 오류'
        });
    }
}