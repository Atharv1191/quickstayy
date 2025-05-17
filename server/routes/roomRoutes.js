
const express = require("express");
const upload = require("../middeleweres/uploadMiddelewere");
const protect = require("../middeleweres/authMiddelewere");
const { createRoom, getRooms, getOwnerRooms,toggleAvailability } = require("../controllers/roomController");

const router = express.Router()

router.post('/',upload.array("images",4),protect,createRoom);
router.get('/',getRooms);
router.get('/owner',protect,getOwnerRooms);
router.post('/toggle-availability',protect,toggleAvailability);

module.exports = router;