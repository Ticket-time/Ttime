const express = require("express");
const smtpTransport = require('./email.js');
const db = require('./db');

const app = express();

app.use(express.urlencoded({extended: false}))
app.listen(3000);

db.query(`USE ttime;`);
app.post("/register", (req, res) => {
    const id = req.body.id;
    const pwd = req.body.pwd;
    const email = req.body.email;

    console.log(req.body);

    // 제대로 입력했는지 확인 
    if (!id || !pwd || !email) {
        res.send({result: "no input"});
    }

    // id 중복 확인
    db.query(
        "select user_id from users where user_id = ?",
        [id],
        (err, result) => {
            let checkid = new Object();
            checkid.isAvailable = false;  // id 사용가능한 id?

            if(result[0] == undefined){
                checkid.isAvailable = true;
                res.send({checkid});
            }
            else {
                checkid.tf = false;
                res.send({checkid});
            }
    });

    // 비밀번호 동일한지 확인 

});    

// email 인증
app.post("/mail_verify", async(req, res)=> {
    var generateRandom = function (min, max) {
        var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
        return ranNum;
      }
    
    const email = req.body.email;
    const number = generateRandom(111111,999999)
    const mailOptions = {
        from: "T-Time",
        to: email,
        subject: "[T-Time]인증 관련 이메일 입니다",
        text: "오른쪽 숫자 6자리를 입력해주세요 : " + number
    };
    

    let sendMail = (mailOptions) => {
        smtpTransport.sendMail(mailOptions, function(error, info){
            if(error){
                console.log('error' + error);

            }
            else{
                console.log('전송 완료' + info.response);
            }
        })
    }
    sendMail(mailOptions);
    
    
    // smtpTransport.sendMail(mailOptions, (error, responses) => {
    //     if (error) {
    //         res.json(error);
    //     } else {
    //     /* 클라이언트에게 인증 번호를 보내서 사용자가 맞게 입력하는지 확인! */
    //         res.json(success);
    //     }
    // });

})
