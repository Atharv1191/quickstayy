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

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const bookingId = session.metadata.bookingId;

            await Booking.findByIdAndUpdate(bookingId, {
                isPaid: true,
                paymentMethod: "Stripe",
            });
        }

        else if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            const bookingId = paymentIntent.metadata.bookingId;

            if (bookingId) {
                await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentMethod: "Stripe",
                });
            } else {
                console.warn("No bookingId in payment_intent metadata");
            }
        }

        else {
            console.log(`Unhandled Event Type: ${event.type}`);
        }

        response.json({ received: true });

    } catch (error) {
        console.error("Failed to handle webhook:", error);
        return response.status(500).send("Internal Server Error");
    }
};

module.exports = { stripeWebhooks };
