const express = require("express");
const router = express.Router();

const userMiddleWare = require("../controllers/user.controller");

router.post('/register', userMiddleWare.signup);


module.exports = router;