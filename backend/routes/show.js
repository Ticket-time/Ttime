const express = require("express");
const auth = require("../controllers/auth");
const showMiddleWare = require("../controllers/show");

const router = express.Router();

router.post('/', showMiddleWare.showAll);
router.post('/keyword', showMiddleWare.getSearchedShow);
router.post('/detail', showMiddleWare.showDetails);

module.exports = router;