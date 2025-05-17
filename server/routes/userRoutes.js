
const express = require("express");
const protect = require("../middeleweres/authMiddelewere");
const { getUserData, storeRecentSearchedCities } = require("../controllers/userController");

const router = express.Router();

router.get('/',protect,getUserData)
router.post('/store-recent-search',protect,storeRecentSearchedCities)
module.exports = router;