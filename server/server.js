
const express = require("express")
require('dotenv').config();
const cors = require("cors");
const connectDB = require("./configs/db");
const { clerkMiddleware } = require('@clerk/express');
const { clerkWebhooks } = require("./controllers/clerkWebhookes");
const userRoute = require("./routes/userRoutes")
const hotelRoute = require("./routes/HotelRoutes");
const roomRoute = require("./routes/roomRoutes")
const bookingRoute = require("./routes/bookingRoutes")
const connectCloudinary = require("./configs/cloudinary");
const { stripeWebhooks } = require("./controllers/stripWebhookController");
const app = express();
app.use(cors());

app.post('/api/stripe',express.raw({type:"application/json"}),stripeWebhooks)

// 👇 Add this BEFORE express.json
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // save raw body for Svix
  }
}));

// Middleware
app.use(clerkMiddleware());

// Webhook route (MUST use raw body)
app.post('/webhooks', clerkWebhooks);

app.get('/', (req, res) => {
  res.send("api is working");
});
app.use('/api/user',userRoute)
app.use('/api/hotels',hotelRoute)
app.use('/api/rooms',roomRoute)
app.use('/api/bookings',bookingRoute)


// DB Connection
connectDB();
connectCloudinary()

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
