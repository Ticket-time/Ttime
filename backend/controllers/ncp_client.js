require('dotenv').config("../../.env");

const axios = require('axios');
const Cache = require('memory-cache');
const CryptoJS = require('crypto-js');

const date = Date.now().toString();
const uri = process.env.SERVICE_ID;
const secretKey = process.env.SECRET_KEY;
const accessKey = process.env.ACCESS_KEY;
const method = 'POST';
const space = " ";
const newLine = "\n";
const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
const url2 = `/sms/v2/services/${uri}/messages`;

const  hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

hmac.update(method);
hmac.update(space);
hmac.update(url2);
hmac.update(newLine);
hmac.update(date);
hmac.update(newLine);
hmac.update(accessKey);

const hash = hmac.finalize();
const signature = hash.toString(CryptoJS.enc.Base64);

exports.send = async function (req, res) {
  const phoneNumber = req.body.phoneNumber;

  Cache.del(phoneNumber);

  //인증번호 생성
  const verifyCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  Cache.put(phoneNumber, verifyCode.toString(), 60000) ;

  const response = await axios({
    method: method,
    json: true,
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'x-ncp-iam-access-key': accessKey,
      'x-ncp-apigw-timestamp': date,
      'x-ncp-apigw-signature-v2': signature,
    },
    data: {
      type: 'SMS',
      contentType: 'COMM',
      countryCode: '82',
      from: '01022349455',
      content: `[Ttime] 인증번호 [${verifyCode}]를 입력해주세요.`,
      messages: [
        {
          to: `${phoneNumber}`,
        },
      ],
    }, 
    });

  console.log(response.status);
  if(response.status === 202) {
    console.log("hello");
    return res.send({
      success: true,
      message: "발신 성공"
    })
  } else {
    return res.send({
      success: false,
      message: "발신 실패"
    })
  }
};

exports.verify = async function (req, res) {
  const phoneNumber = req.body.phoneNumber;
  const inputCode = req.body.inputCode;

  const CacheData = Cache.get(phoneNumber);

  if (!CacheData) {  // phoneNumber에 해당하는 value가 없으면 (== null이면)
    return res.send({
      success: true,
      message: "인증 시간 만료됨"
  });
  } else if (CacheData !== inputCode) {
      return res.send({
        success: true,
        confirmed: false,
        message: "인증번호가 일치하지 않음"
      });
  } else {
    Cache.del(phoneNumber);
    return res.send({
        success: true,
        confirmed: true,
        message: "인증번호가 일치함"
    });     
  }
};