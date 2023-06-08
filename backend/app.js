require("dotenv").config();
const express = require("express");
const app = express();
const db = require('./db');
// const smtpTransport = require('./email.js');
// const jwt = require('jsonwebtoken');
// const { validationResult, body } = require('express-validator')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//app.use(express.urlencoded({extended: false}))
app.listen(3000);

db.query(`USE ttime;`);

   

// // email 인증
// app.post("/mail_verify", async(req, res)=> {
    
//     let date = new Date();
//     let id = req.body.id;
//     let email = req.body.email;

//     const emailToken = jwt.sign(
//         {
//             "id": id,
//             "created": date.toString()
//         },
//         process.env.JWT_SECRET_KEY_EMAIL, 
//         {
//              expiresIn: process.env.JWT_EXPIRES_IN
//         }
//     );

//     let url = `${process.env.BASE_URL}/user/confirmation/${emailToken}`;

//     let info = await smtpTransport.sendMail({
//         from: 'T-Time', // sender address
//         to: email, // list of receivers seperated by comma
//         subject: "Account Verification", // Subject line
//         html: `Please click this email to confirm your email: <a href="${url}">${url} </a>`// plain text body
//     }, (error, info) => {

//         if (error) {
//             console.log(error)
//             return;
//         }
//         console.log('Message sent successfully!');
//         console.log(info);
//         smtpTransport.close();
//         res.send('성공');
//     });

    

// });


// app.get("/user/comfirmation/:token", async(req, res) => {
//     try{
//         const emailToken = jwt.verify(req.params.token, JWT_SECRET_KEY_EMAIL);
//         console.log(emailToken);
//         // db update 구문 
//     } catch (e) {
//         res.send('error');
//     }
//    return res.send('success email confirmation');
// });



var userRouter = require('./routes/userRouter');
app.use('/user', userRouter);