const express = require("express");
const router = express.Router();

const userMiddleWare = require("../controllers/user");
const auth = require("../controllers/auth");
const qr = require('../controllers/show');

router.post("/register", userMiddleWare.signup);
router.post("/login", userMiddleWare.login);
// router.post("/login", userMiddleWare.login, auth.issueToken);///, auth.issueToken);
// router.get('/token/test', auth.verifyToken);

//router.post('/apply', auth.verifyToken, userMiddleWare.apply);
//router.post('/applyList', auth.verifyToken, userMiddleWare.applyList);
router.post('/apply', userMiddleWare.apply);
router.post('/applyList', userMiddleWare.applyList);
router.post("/checkPayable", userMiddleWare.checkPayable);



router.post('/getETH', userMiddleWare.getETH);
router.post('/getQR', qr.getQR);
module.exports = router;
