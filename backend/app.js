require("dotenv").config();
const express = require("express");
const app = express();
const db = require('./db');
const smtpTransport = require('./email.js');
const jwt = require('jsonwebtoken');
const createNewUser = require('./controller');
const { validationResult, body } = require('express-validator')

app.use(express.urlencoded({extended: false}))
app.listen(3000);

db.query(`USE ttime;`);

app.post("/register", async (req, res) => {
    const { id, password, email } = req.body;
    console.log(req.body);

    // input data validation 
    if (!id || !password || !email) {
        return res.send('wrong input');
    //  else if (body("email").isEmail()) {
    //     throw Error("Invalid email entered");
    } else if (password.length < 8) {
        return res.send('too short password');
    } 


    //id 중복 확인
    db.query(
        "select id from user where id = ?",
        [id],
        (err, rows) => {
            if(rows.length == 0) {
                console.log("중복 email 없음");
                const query = db.query(
                    "insert into user(id, email, password) values(?, ?, ?)",
                    [id, password, email],
                    (err, rows) => {
                        if (err) throw err;
                        else res.json({message: '이미 가입된 이메일입니다.'});
                    }
                )
            }
            else{
                res.json({message: '중복 id 입니다.'});
            }
    });
        
});    

// email 인증
app.post("/mail_verify", async(req, res)=> {
    
    let date = new Date();
    let id = req.body.id;
    let email = req.body.email;

    const emailToken = jwt.sign(
        {
            "id": id,
            "created": date.toString()
        },
        process.env.JWT_SECRET_KEY_EMAIL, 
        {
             expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

    let url = `${process.env.BASE_URL}/user/confirmation/${emailToken}`;

    let info = await smtpTransport.sendMail({
        from: 'T-Time', // sender address
        to: email, // list of receivers seperated by comma
        subject: "Account Verification", // Subject line
        html: `Please click this email to confirm your email: <a href="${url}">${url} </a>`// plain text body
    }, (error, info) => {

        if (error) {
            console.log(error)
            return;
        }
        console.log('Message sent successfully!');
        console.log(info);
        smtpTransport.close();
        res.send('성공');
    });

    

});


app.get("/user/comfirmation/:token", async(req, res) => {
    try{
        const emailToken = jwt.verify(req.params.token, JWT_SECRET_KEY_EMAIL);
        console.log(emailToken);
        // db update 구문 
    } catch (e) {
        res.send('error');
    }
   return res.send('success email confirmation');
});

