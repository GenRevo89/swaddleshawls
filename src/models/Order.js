import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
    {
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
    },
    { _id: false }
);

const ShippingAddressSchema = new mongoose.Schema(
    {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        zip: { type: String, default: "" },
        country: { type: String, default: "" },
    },
    { _id: false }
);

function generateOrderNumber() {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BSL-${rand}`;
}

const OrderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            default: generateOrderNumber,
        },
        email: {
            type: String,
            required: [true, "Customer email is required"],
            lowercase: true,
            index: true,
        },
        customerName: {
            type: String,
            required: [true, "Customer name is required"],
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: [arr => arr.length > 0, "Order must have at least one item"],
        },
        total: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["awaiting_payment", "confirmed", "processing", "shipped", "delivered"],
            default: "awaiting_payment",
        },
        // ── Payment method ──
        paymentMethod: {
            type: String,
            enum: ["surge", "stripe"],
            default: "surge",
        },
        // ── Shipping address ──
        shippingAddress: {
            type: ShippingAddressSchema,
            default: () => ({}),
        },
        // ── BasaltSurge payment fields ──
        receiptId: {
            type: String,
            index: true,
            sparse: true,
        },
        surgeStatus: {
            type: String,
            enum: ["generated", "pending", "paid", "paid_stripe", "completed", "refunded"],
            default: "generated",
        },
        paymentUrl: {
            type: String,
        },
        // ── Stripe payment fields ──
        stripeSessionId: {
            type: String,
            sparse: true,
        },
        stripePaymentIntent: {
            type: String,
            sparse: true,
        },
        // ── Shipping tracking ──
        trackingCarrier: {
            type: String, // e.g. "USPS", "UPS", "FedEx", "DHL"
        },
        trackingNumber: {
            type: String,
        },
        trackingUrl: {
            type: String,
        },
        shippedAt: {
            type: Date,
        },
        deliveredAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
