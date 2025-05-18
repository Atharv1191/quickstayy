const stripe = require("stripe");
const Booking = require("../models/Booking");

const stripeWebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the checkout session completed event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const bookingId = session.metadata.bookingId;

        try {
            await Booking.findByIdAndUpdate(bookingId, {
                isPaid: true,
                paymentMethod: "Stripe",
            });
        } catch (error) {
            console.error("Failed to update booking:", error);
            return response.status(500).send("Failed to update booking");
        }
    } else {
        console.log(`Unhandled Event Type: ${event.type}`);
    }

    response.json({ received: true });
};

module.exports = { stripeWebhooks };
