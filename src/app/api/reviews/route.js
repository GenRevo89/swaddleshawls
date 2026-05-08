import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";

// ── Review Schema (defined inline to avoid extra model file) ──
const reviewSchema = new mongoose.Schema({
  email: { type: String, required: true },
  orderId: { type: String, required: true },
  sku: { type: String, required: true },
  productName: { type: String, default: "" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" },
  status: { type: String, default: "approved", enum: ["pending", "approved", "rejected"] },
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

// GET — Fetch reviews for a product SKU or all
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sku = searchParams.get("sku");
    const email = searchParams.get("email");

    await connectToDatabase();

    const query = { status: "approved" };
    if (sku) query.sku = sku;
    if (email) query.email = email.toLowerCase().trim();

    const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ success: true, data: reviews }, { status: 200 });
  } catch (error) {
    console.error("[REVIEWS_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — Submit a review (with 3-day eligibility check)
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, orderId, sku, productName, rating, comment } = body;

    if (!email || !orderId || !sku || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: email, orderId, sku, rating" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    await connectToDatabase();

    // Import Order model dynamically to avoid circular deps
    const Order = mongoose.models.Order || (await import("@/models/Order")).default;

    // ── Eligibility check ──
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.email.toLowerCase() !== email.toLowerCase().trim()) {
      return NextResponse.json({ error: "This order does not belong to you" }, { status: 403 });
    }

    // Check that the order contains this SKU
    const hasItem = order.items.some(
      (item) => item.sku === sku || item.productName === productName
    );
    if (!hasItem) {
      return NextResponse.json({ error: "This product is not in your order" }, { status: 400 });
    }

    // Check order is delivered
    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "Reviews can only be left for delivered orders" },
        { status: 400 }
      );
    }

    // Check 3-day waiting period
    if (order.deliveredAt) {
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      const elapsed = Date.now() - new Date(order.deliveredAt).getTime();
      if (elapsed < threeDaysMs) {
        const daysLeft = Math.ceil((threeDaysMs - elapsed) / (24 * 60 * 60 * 1000));
        return NextResponse.json(
          { error: `Please wait ${daysLeft} more day${daysLeft !== 1 ? "s" : ""} before reviewing` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate review
    const existing = await Review.findOne({ email: email.toLowerCase().trim(), orderId, sku });
    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this product from this order" }, { status: 409 });
    }

    // Create review
    const review = await Review.create({
      email: email.toLowerCase().trim(),
      orderId,
      sku,
      productName: productName || "",
      rating: Math.round(rating),
      comment: (comment || "").trim().substring(0, 1000),
      status: "approved",
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error("[REVIEWS_POST]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
