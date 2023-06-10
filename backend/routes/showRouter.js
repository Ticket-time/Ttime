const express = require("express");
const router = express.Router();

const showMiddleWare = require("../controllers/show.controller");
const auth = require("../controllers/authMiddleWare");

router.post('/', showMiddleWare.showAll);
router.post('/keyword', showMiddleWare.showAll);
router.post('/apply', auth.verifyToken, showMiddleWare.apply);
router.post('/detail', showMiddleWare.showDetails);

module.exports = router;