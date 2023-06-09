require("dotenv").config();
const express = require("express");
const app = express();
const db = require('../../backend/db');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 권한 확인 auth


// 회원가입 sign up
// next로 유효성 검사먼저 하고, 회원가입할 수 있을듯
exports.signup = async (req, res) => {
   
    const { id, password, email } = req.body;
    console.log(req.body);

    // input data validation 
    if (!id || !password || !email) {
        console.log("잘못된 입력입니다.");
        return res.send({success: false, message: "잘못된 입력"});
    //  else if (body("email").isEmail()) {
    //     throw Error("Invalid email entered");
    } else if (password.length < 8) {
        console.log("패스워드 길이가 너무 짧습니다.");
        return res.send({success: false, message: "비밀번호는 8자리 이상이어야 합니다"});
    } 

    //id 중복 확인
    db.query("select id from user where id = ?",[id],
        (err, rows) => {
            if (err) {
                console.log(err);
                throw err;
            }

            if (rows.length != 0) {
                console.log("중복되는 ID");
                return res.send({success : false, message: "중복되는 id"});
            }
        }
    );

    db.query("select email from user where email = ?", [email],
        (err, rows) => {
            if (err) {
                console.log(err);
                throw err;
            }

            if (rows.length != 0) {
                console.log("이미 가입된 이메일");
                return res.send({success : false, message: "중복되는 email"});
            }
        }
    );
    
    db.query("insert into user(id, email, password) values(?, ?, ?)",[id, email, password],
        (err, rows) => {
            if (err) {
                console.log(err);
                throw err;
            }
            else {
                res.json(data = {success: true, message: '회원가입 완료'});
            }
        }
    )
};
                            


// 로그인 -> 토큰 발급
exports.login = async (req, res, next) => {
    console.log(req.body);
    const { id, password } = req.body;

    db.query("select * from user where id = ? and password = ?",[id, password],
        (err, rows) => {
            if (err) {
                console.log(err);
                throw err;
            }

            if (rows.length === 0) {
                console.log("로그인 정보가 일치하지 않습니다.");
                return res.send({success : false, message: "로그인 실패"});
            }
            else {
                console.log("로그인 정보가 일치합니다");
                return next();
            }
        }
    );
}


