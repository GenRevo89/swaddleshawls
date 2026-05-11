import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { upsertContact, upsertAccount, createOpportunity, sendMessage } from "@/lib/crm";
import Client from "@/models/Client";
import { generateOrderConfirmationEmail } from "@/lib/email-templates";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST — Stripe webhook handler for checkout.session.completed
export async function POST(req) {
    try {
        const body = await req.text();
        const sig = req.headers.get("stripe-signature");

        let event;

        // If we have a webhook secret, verify the signature
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            try {
                event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
            } catch (err) {
                console.error("[Stripe Webhook] Signature verification failed:", err.message);
                return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
            }
        } else {
            // Dev mode — parse directly (add STRIPE_WEBHOOK_SECRET in production!)
            event = JSON.parse(body);
            console.warn("[Stripe Webhook] No STRIPE_WEBHOOK_SECRET set — skipping signature verification");
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const { orderId, receiptId, customerName } = session.metadata || {};

            console.log(`[Stripe Webhook] Payment completed — session: ${session.id}, order: ${orderId}, receipt: ${receiptId}`);

            await connectToDatabase();

            // Find the order by receiptId or orderId
            let order = null;
            if (receiptId) {
                order = await Order.findOne({ receiptId });
            }
            if (!order && orderId) {
                order = await Order.findById(orderId);
            }

            if (order) {
                order.status = "confirmed";
                order.surgeStatus = "paid_stripe";
                order.paymentMethod = "stripe";
                order.stripeSessionId = session.id;
                order.stripePaymentIntent = session.payment_intent;

                // Backfill real customer details from Stripe session
                const stripeEmail = session.customer_details?.email || session.customer_email;
                const stripeName = session.customer_details?.name || customerName;
                if (stripeEmail && (order.email === "pending@checkout.local" || !order.email)) {
                    order.email = stripeEmail.toLowerCase().trim();
                }
                if (stripeName && (order.customerName === "Pending Customer" || !order.customerName)) {
                    order.customerName = stripeName.trim();
                }

                // Extract shipping address from Stripe Checkout
                const shipping = session.shipping_details || session.shipping;
                if (shipping?.address) {
                    order.shippingAddress = {
                        street: [shipping.address.line1, shipping.address.line2].filter(Boolean).join(", "),
                        city: shipping.address.city || "",
                        state: shipping.address.state || "",
                        zip: shipping.address.postal_code || "",
                        country: shipping.address.country || "",
                    };
                    console.log(`[Stripe Webhook] Shipping: ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`);
                }

                await order.save();
                console.log(`[Stripe Webhook] Order ${order.orderNumber} confirmed — email: ${order.email}, name: ${order.customerName}`);

                // Upsert client record with real details
                if (order.email && order.email !== "pending@checkout.local") {
                    await Client.findOneAndUpdate(
                        { email: order.email },
                        { $setOnInsert: { name: order.customerName || "Customer" } },
                        { upsert: true, new: true }
                    );
                }

                // ── CRM SYNC (same logic as /api/orders/confirm) ──
                const client = await Client.findOne({ email: order.email });
                const nameParts = (order.customerName || customerName || "").trim().split(/\s+/);
                const firstName = nameParts[0] || "";
                const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "Customer";

                try {
                    const contact = await upsertContact({
                        email: order.email,
                        first_name: firstName,
                        last_name: lastName,
                        mobile_phone: client?.phone || undefined,
                        tags: ["ecommerce", "stripe", process.env.BRAND_CRM_TAG || "surgeshop"],
                    });
                    const contactId = contact?.id || null;

                    const account = await upsertAccount({
                        name: order.customerName,
                        email: order.email,
                        type: "Customer",
                    });
                    const accountId = account?.id || null;

                    await createOpportunity({
                        name: `Order ${order.orderNumber} - ${order.customerName}`,
                        description: `Stripe order: ${order.items.map(i => i.productName).join(", ")}`,
                        budget: Math.round(Number(order.total)),
                        expected_revenue: Math.round(Number(order.total)),
                        close_date: new Date().toISOString().split("T")[0],
                        lead_source: "Website",
                        ...(contactId && { contactId }),
                        ...(accountId && { accountId }),
                    });
                    console.log("[Stripe Webhook] CRM sync complete");

                    // Send order confirmation email via CRM
                    try {
                        const emailHtml = generateOrderConfirmationEmail(order);
                        await sendMessage({
                            to: order.email,
                            subject: `Your SwaddleShawls Receipt — ${order.orderNumber}`,
                            body: emailHtml,
                            channel: "email",
                        });
                        console.log("[Stripe Webhook] Confirmation email sent to:", order.email);
                    } catch (emailErr) {
                        console.error("[Stripe Webhook] Confirmation email failed:", emailErr.message);
                    }
                } catch (err) {
                    console.error("[Stripe Webhook] CRM sync failed:", err);
                }
            } else {
                console.warn(`[Stripe Webhook] No matching order found for receipt: ${receiptId}, orderId: ${orderId}`);
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error("[Stripe Webhook] Error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
