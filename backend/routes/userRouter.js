const express = require("express");
const router = express.Router();

const userMiddleWare = require("../controllers/user.controller");
const auth = require("../controllers/authMiddleWare");
const email = require("../controllers/email");

router.post('/register', userMiddleWare.signup);
router.post('/login', userMiddleWare.login, auth.issueToken);
router.get('/token/test', auth.verifyToken);
router.post('/sendMail', email.sendEmail)  // 이메일 보내기 
//router.get('/verifyMail', )
module.exports = router;