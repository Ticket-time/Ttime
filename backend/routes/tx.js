// tx Router
const express = require("express");
const txMiddleWare = require("../controllers/tx");

const router = express.Router();

router.post("/", txMiddleWare.getResellTicket);
router.post("/resell", txMiddleWare.resell);
router.post("/cancelResell", txMiddleWare.cancelResell);

router.post("/buyTicket", txMiddleWare.buyTicket);

router.post("/cancelTicket", txMiddleWare.cancelTicket);
router.post("/cancelLotteryTicket", txMiddleWare.cancelLotteryTicket);

module.exports = router;
