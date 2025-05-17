const Hotel = require("../models/Hotel");
const User = require("../models/User");

const registerHotel = async (req, res) => {
    try {
        const { name, address, contact, city } = req.body;
        const owner = req.user._id;

        // Check if hotel already exists for this user
        const existingHotel = await Hotel.findOne({ owner });

        if (existingHotel) {
            return res.status(400).json({
                success: false,
                message: "Hotel already registered"
            });
        }

        // Create new hotel
        await Hotel.create({
            name,
            address,
            contact,
            city,
            owner
        });

        // Update user role to hotelOwner
        await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

        return res.status(200).json({
            success: true,
            message: "Hotel registered successfully"
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { registerHotel };
