// auth Router
const express = require('express');
const auth = require("../controllers/auth");
const userMiddleWare = require("../controllers/user");
const ncp_client = require("../controllers/ncp_client");
const router = express.Router();

router.post("/login", userMiddleWare.login, auth.issueToken);
router.post("/sens/test", auth.checkPhoneNumber, ncp_client.send);  // 번호가 이미 가입됐는지 먼저 확인
router.post("/sens/verify", ncp_client.verify);
router.post("/checkID", auth.checkID);

//router.post("/register", userMiddleWare.signup);
//router.get('/token/test', auth.verifyToken);

module.exports = router;