
const express = require("express");
const { checkAvailabilityAPI, createBooking, getUserBookings, getHotelBookings } = require("../controllers/bookingController");
const protect = require("../middeleweres/authMiddelewere");

const router = express.Router()

router.post('/check-availability',checkAvailabilityAPI);
router.post('/book',protect,createBooking)
router.get('/user',protect,getUserBookings)
router.get('/hotel',protect,getHotelBookings)

module.exports = router