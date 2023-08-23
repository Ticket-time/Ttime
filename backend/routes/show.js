const express = require("express");
const auth = require("../controllers/auth");
const showMiddleWare = require("../controllers/show");
const search = require("../controllers/search");

const router = express.Router();

router.post('/', showMiddleWare.showAll);
router.post('/search', search.rank);
router.post('/keyword', search.insertWord, showMiddleWare.getSearchedShow);
router.post('/detail', showMiddleWare.showDetails);

module.exports = router;