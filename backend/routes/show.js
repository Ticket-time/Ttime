const express = require("express");
const showMiddleWare = require("../controllers/show");
const search = require("../controllers/search");

const router = express.Router();

router.post("/", showMiddleWare.showAll);
router.post("/search", search.rank);
router.post("/keyword", search.insertWord, showMiddleWare.getSearchedShow);
router.post("/detail", showMiddleWare.showDetails);
router.post("/type", showMiddleWare.getTypeShow);
router.post("/issuableShow", showMiddleWare.showAllTx); // /shows/issuableShow

module.exports = router;
