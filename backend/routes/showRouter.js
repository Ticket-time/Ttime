const express = require("express");
const router = express.Router();

const showMiddleWare = require("../controllers/show.controller");


router.post('/', showMiddleWare.showAll);
//router.get('/', auth.verifyToken);
module.exports = router;