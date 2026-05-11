import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/checkout/stripe/session?session_id=cs_xxx
// Returns the session metadata (receiptId, orderId) so the client can trigger /api/orders/confirm
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.json({ error: "session_id is required" }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return NextResponse.json({
            receiptId: session.metadata?.receiptId || null,
            orderId: session.metadata?.orderId || null,
            customerName: session.metadata?.customerName || null,
            email: session.customer_details?.email || session.customer_email || null,
            status: session.payment_status,
        });
    } catch (error) {
        console.error("[Stripe Session] Lookup failed:", error.message);
        return NextResponse.json({ error: "Session lookup failed" }, { status: 500 });
    }
}
