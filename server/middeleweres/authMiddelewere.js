const User = require('../models/User');

// Middleware to check if user is authenticated
const protect = async (req, res, next) => {
    try {
        const { userId } = req.auth;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error(" Auth middleware error:", err.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = protect;
