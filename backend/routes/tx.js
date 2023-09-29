// tx Router
const express = require("express");
const txMiddleWare = require("../controllers/tx");
const router = express.Router();

router.post("/", txMiddleWare.getResellTicket);
router.post("/resell", txMiddleWare.resell);
router.post("/handOver", txMiddleWare.handOver);

module.exports = router;
