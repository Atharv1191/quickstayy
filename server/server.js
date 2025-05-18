const express = require("express");
require("dotenv").config();
const cors = require("cors");

const connectDB = require("./configs/db");
const connectCloudinary = require("./configs/cloudinary");

const { clerkMiddleware } = require("@clerk/express");
const { clerkWebhooks } = require("./controllers/clerkWebhookes");
const { stripeWebhooks } = require("./controllers/stripWebhookController");

const userRoute = require("./routes/userRoutes");
const hotelRoute = require("./routes/HotelRoutes");
const roomRoute = require("./routes/roomRoutes");
const bookingRoute = require("./routes/bookingRoutes");

const app = express();

// ✅ Allow CORS
app.use(cors());

// ✅ Stripe webhook requires raw body
app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// ✅ Clerk needs rawBody for Svix
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf; // ✅ keep as Buffer
    },
  })
);

// ✅ Clerk middleware
app.use(clerkMiddleware());

// ✅ Clerk webhook handler (uses rawBody)
app.post("/webhooks", clerkWebhooks);

// ✅ Regular routes
app.get("/", (req, res) => {
  res.send("api is working");
});
app.use("/api/user", userRoute);
app.use("/api/hotels", hotelRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/bookings", bookingRoute);

// ✅ DB + Cloudinary
connectDB();
connectCloudinary();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
