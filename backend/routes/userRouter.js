const express = require("express");
const router = express.Router();

const userMiddleWare = require("../controllers/user.controller");
const auth = require("../controllers/authMiddleWare");
const email = require("../controllers/email");
const check = require("../controllers/check");
const qr = require('../controllers/qr');

router.post("/register", userMiddleWare.signup);
router.post("/login", userMiddleWare.login, auth.issueToken);///, auth.issueToken);
router.get('/token/test', auth.verifyToken);
router.post("/sendMail", email.sendEmail); // 이메일 보내기

router.post("/checkPayable", check.checkPayable);
router.post('/applyList', auth.verifyToken, userMiddleWare.applyList);
router.post('/getETH', userMiddleWare.getETH);
router.post('/getQR', qr.getQR);
module.exports = router;
