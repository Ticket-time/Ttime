// auth Router
const express = require('express');
const auth = require("../controllers/auth");
const userMiddleWare = require("../controllers/user");
const router = express.Router();

router.post("/login", userMiddleWare.login, auth.issueToken);
//router.post("/register", userMiddleWare.signup);
//router.get('/token/test', auth.verifyToken);
//router.post("/sendMail", email.sendEmail); // 이메일 보내기

module.exports = router;