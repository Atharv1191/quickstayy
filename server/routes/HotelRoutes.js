
const express = require("express");
const protect = require("../middeleweres/authMiddelewere");
const { registerHotel } = require("../controllers/HotelController");

const router = express.Router();

router.post('/',protect,registerHotel)

module.exports = router;
