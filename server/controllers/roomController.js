const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const cloudinary = require('cloudinary').v2;

// Create Room
// const createRoom = async (req, res) => {
//     try {
//         const { roomType, pricePerNight, amenities } = req.body;

//         const hotel = await Hotel.findOne({ owner: req.auth.userId });

//         if (!hotel) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No hotel found"
//             });
//         }

//         if (!req.files || req.files.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "At least one room image is required"
//             });
//         }

//         // Upload images to Cloudinary
//         const uploadImages = req.files.map(async (file) => {
//             const response = await cloudinary.uploader.upload(file.path);
//             return response.secure_url;
//         });

//         const images = await Promise.all(uploadImages);

//         const room = await Room.create({
//             hotel: hotel._id,
//             roomType,
//             pricePerNight: +pricePerNight,
//             amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
//             images,
//             isAvailable: true // ensure default field
//         });

//         return res.status(201).json({
//             success: true,
//             message: "Room created successfully",
//             data: room
//         });

//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };
const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities } = req.body;

        const hotel = await Hotel.findOne({ owner: req.auth.userId });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "No hotel found"
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one room image is required"
            });
        }

        // Upload images to Cloudinary
        const uploadImages = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(file.path);
            return response.secure_url;
        });

        const images = await Promise.all(uploadImages);

        const room = await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
            images,
            isAvailable: true
        });

        return res.status(201).json({
            success: true,
            message: "Room created successfully",
            room: room // ✅ send as `room`, not `data`
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// Get All Available Rooms
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ isAvailable: true })
            .populate({
                path: 'hotel',
                populate: {
                    path: 'owner',
                    select: 'image'
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            rooms
        });

    } catch (error) {
         console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Rooms of the Hotel Owned by the Logged-In User
const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({ owner: req.auth.userId });

        if (!hotelData) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found for this user"
            });
        }

        const rooms = await Room.find({ hotel: hotelData._id }).populate("hotel");

        return res.status(200).json({
            success: true,
            rooms
        });

    } catch (error) {
         console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Toggle Room Availability
const toggleAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;

        const roomData = await Room.findById(roomId);
        if (!roomData) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();

        return res.status(200).json({
            success: true,
            message: "Room availability updated"
        });

    } catch (error) {
         console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createRoom,
    getRooms,
    getOwnerRooms,
    toggleAvailability
};
