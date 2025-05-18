const { transporter } = require("../configs/nodemialer");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const stripe = require("stripe")
// Function to check room availability
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: { $lte: checkOutDate },
            checkOutDate: { $gte: checkInDate }
        });

        return bookings.length === 0;

    } catch (error) {
        console.log(error);
        throw new Error("Error checking availability");
    }
};

// API to check availability
const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });

        return res.status(200).json({
            success: true,
            isAvailable
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// API to create booking
const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id;

        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });

        if (!isAvailable) {
            return res.json({
                success: false,
                message: "Room is not available"
            });
        }

        const roomData = await Room.findById(room).populate("hotel");
        if (!roomData) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        // Calculate total price
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut - checkIn;
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const totalPrice = roomData.pricePerNight * nights;

        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
             paymentMethod: req.body.paymentMethod || "Pay At Hotel"
        });
        const mailOptions = {
  from: process.env.SENDER_EMAIL,
  to: req.user.email,
  subject: "Hotel Booking Details",
  html: `
    <h2>Your Booking Details</h2>
    <p>Dear ${req.user.username},</p>
    <p>Thank you for your booking! Here are your details:</p>
    <ul>
      <li><strong>Booking ID:</strong> ${booking._id}</li>
      <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
      <li><strong>Address:</strong> ${roomData.hotel.address}</li>
      <li><strong>Check-In Date:</strong> ${booking.checkInDate.toDateString()}</li>
      <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || '₹'}${booking.totalPrice} / night</li>
    </ul>
    <p>We look forward to welcoming you!</p>
    <p>If you need to make any changes, feel free to contact us.</p>
  `
};

         await transporter.sendMail(mailOptions);


        return res.status(200).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// API to get all bookings for a user
const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user })
      .populate({
        path: "room",
        select: "roomType images", // make sure images are included
      })
      .populate({
        path: "hotel",
        select: "name address",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// API to get all bookings for a hotel owner
const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId }); // 🛠️ Fix: use await here
        if (!hotel) {
            return res.status(400).json({
                success: false,
                message: "No hotel found"
            });
        }

        const bookings = await Booking.find({ hotel: hotel._id })
            .populate("room hotel user")
            .sort({ createdAt: -1 });

        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

        return res.status(200).json({
            success: true,
            dashboardData: {
                totalBookings,
                totalRevenue, // 🛠️ Fix: typo `totalrevenue`
                bookings
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const stripePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);
        const roomData = await Room.findById(booking.room).populate('hotel');
        const totalPrice = booking.totalPrice;
        const { origin } = req.headers;

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const line_items = [
            {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: roomData.hotel.name,
                    },
                    unit_amount: totalPrice * 100,
                },
                quantity: 1
            }
        ];

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            metadata: {
                bookingId: bookingId.toString(),
            },
            payment_intent_data: {
                metadata: {
                    bookingId: bookingId.toString(),
                }
            }
        });

        res.json({
            success: true,
            url: session.url
        });

    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: "Payment failed"
        });
    }
};

module.exports = { stripePayment };

// Export all controllers
module.exports = {
    checkAvailabilityAPI,
    createBooking,
    getUserBookings,
    getHotelBookings,
    stripePayment
};