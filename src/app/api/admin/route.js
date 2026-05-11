import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Client from "@/models/Client";
import AdminUser from "@/models/AdminUser";
import { upsertContact, upsertAccount, createOpportunity, getContactByEmail, sendMessage } from "@/lib/crm";
import { generateShippingEmail } from "@/lib/email-templates";

function unauthorized() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Token is base64(email:timestamp) — simple session token
function generateToken(email) {
    return Buffer.from(`${email}:${Date.now()}`).toString("base64");
}

function decodeToken(token) {
    try {
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        const [email] = decoded.split(":");
        return email || null;
    } catch { return null; }
}

async function checkAuth(req) {
    const token = req.headers.get("x-admin-token");
    if (!token) return false;
    const email = decodeToken(token);
    if (!email) return false;
    const admin = await AdminUser.findOne({ email });
    return !!admin;
}

// GET /api/admin?tab=orders|clients|overview|status
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "overview";

    await connectToDatabase();

    // Public endpoint — checks if admin account exists (for setup vs login UI)
    if (tab === "status") {
        const adminExists = await AdminUser.countDocuments() > 0;
        return NextResponse.json({ success: true, data: { adminExists } });
    }

    if (!(await checkAuth(req))) return unauthorized();

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "-createdAt";

    await connectToDatabase();

    if (tab === "overview") {
        const [totalOrders, totalClients, totalRevenue, recentOrders, statusCounts] = await Promise.all([
            Order.countDocuments(),
            Client.countDocuments(),
            Order.aggregate([
                { $match: { status: { $ne: "awaiting_payment" } } },
                { $group: { _id: null, total: { $sum: "$total" } } },
            ]),
            Order.find().sort({ createdAt: -1 }).limit(5).lean(),
            Order.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalOrders,
                totalClients,
                totalRevenue: totalRevenue[0]?.total || 0,
                recentOrders,
                statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
            },
        });
    }

    if (tab === "orders") {
        const query = {};
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { customerName: { $regex: search, $options: "i" } },
            ];
        }
        if (status) query.status = status;

        const [orders, total] = await Promise.all([
            Order.find(query).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
            Order.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: { orders, total, page, pages: Math.ceil(total / limit) },
        });
    }

    if (tab === "clients") {
        const query = {};
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } },
            ];
        }

        const [clients, total] = await Promise.all([
            Client.find(query).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
            Client.countDocuments(query),
        ]);

        // For each client, get their order count and total spend
        const enriched = await Promise.all(
            clients.map(async (c) => {
                const orderStats = await Order.aggregate([
                    { $match: { email: c.email, status: { $ne: "awaiting_payment" } } },
                    { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$total" } } },
                ]);
                return {
                    ...c,
                    orderCount: orderStats[0]?.count || 0,
                    totalSpend: orderStats[0]?.total || 0,
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: { clients: enriched, total, page, pages: Math.ceil(total / limit) },
        });
    }

    return NextResponse.json({ error: "Invalid tab" }, { status: 400 });
}

// POST /api/admin — Auth actions + Admin actions
export async function POST(req) {
    const body = await req.json();
    const { action } = body;

    await connectToDatabase();

    // ── SETUP — idempotent first-time admin creation ──
    if (action === "setup") {
        const { email, password, name } = body;
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }
        const existingAdmin = await AdminUser.countDocuments();
        if (existingAdmin > 0) {
            return NextResponse.json({ error: "Admin account already exists. Please log in." }, { status: 409 });
        }
        const admin = await AdminUser.create({ email: email.toLowerCase().trim(), password, name: name || "Admin" });
        const token = generateToken(admin.email);
        return NextResponse.json({ success: true, token, admin: { email: admin.email, name: admin.name } });
    }

    // ── LOGIN ──
    if (action === "login") {
        const { email, password } = body;
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }
        const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() }).select("+password");
        if (!admin) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
        const valid = await admin.comparePassword(password);
        if (!valid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
        const token = generateToken(admin.email);
        return NextResponse.json({ success: true, token, admin: { email: admin.email, name: admin.name } });
    }

    // All other actions require auth
    if (!(await checkAuth(req))) return unauthorized();

    // ── CRM SYNC for a specific order ──
    if (action === "crm_sync") {
        const { orderId } = body;
        const order = await Order.findById(orderId);
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        if (!order.email || order.email === "pending@checkout.local") {
            return NextResponse.json({ error: "Cannot sync — no real email on this order" }, { status: 400 });
        }

        const client = await Client.findOne({ email: order.email });
        const nameParts = (order.customerName || "Customer").trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "Customer";

        try {
            const contact = await upsertContact({
                email: order.email,
                first_name: firstName,
                last_name: lastName,
                mobile_phone: client?.phone || undefined,
                tags: ["ecommerce", order.paymentMethod || "stripe", process.env.BRAND_CRM_TAG || "surgeshop"],
            });
            const contactId = contact?.id || null;

            const account = await upsertAccount({
                name: order.customerName,
                email: order.email,
                type: "Customer",
            });
            const accountId = account?.id || null;

            const opp = await createOpportunity({
                name: `Order ${order.orderNumber} - ${order.customerName}`,
                description: `${order.paymentMethod === "stripe" ? "Stripe" : "Surge"} order: ${order.items.map(i => i.productName).join(", ")}`,
                budget: Math.round(Number(order.total)),
                expected_revenue: Math.round(Number(order.total)),
                close_date: new Date(order.createdAt).toISOString().split("T")[0],
                lead_source: "Website",
                ...(contactId && { contactId }),
                ...(accountId && { accountId }),
            });

            return NextResponse.json({
                success: true,
                message: "CRM sync complete",
                data: { contactId, accountId, opportunityId: opp?.id || null },
            });
        } catch (err) {
            console.error("[Admin] CRM sync failed:", err);
            return NextResponse.json({ error: "CRM sync failed: " + err.message }, { status: 500 });
        }
    }

    // ── CRM LOOKUP for a client ──
    if (action === "crm_lookup") {
        const { email } = body;
        try {
            const contact = await getContactByEmail(email);
            return NextResponse.json({ success: true, data: contact });
        } catch (err) {
            return NextResponse.json({ error: "CRM lookup failed: " + err.message }, { status: 500 });
        }
    }

    // ── UPDATE ORDER STATUS ──
    if (action === "update_status") {
        const { orderId, status: newStatus } = body;
        const validStatuses = ["awaiting_payment", "confirmed", "processing", "shipped", "delivered"];
        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        const order = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: order });
    }

    // ── UPDATE TRACKING ──
    if (action === "update_tracking") {
        const { orderId, trackingCarrier, trackingNumber, trackingUrl } = body;
        const update = {};
        if (trackingCarrier) update.trackingCarrier = trackingCarrier;
        if (trackingNumber) update.trackingNumber = trackingNumber;
        if (trackingUrl) update.trackingUrl = trackingUrl;
        update.shippedAt = new Date();
        update.status = "shipped";

        const order = await Order.findByIdAndUpdate(orderId, update, { new: true });
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        // Non-blocking email dispatch
        try {
            const htmlBody = generateShippingEmail(order);
            sendMessage({
                to: { email: order.email },
                from: { email: process.env.OUTREACH_EMAIL || "support@swaddleshawls.com", name: "SwaddleShawls" },
                subject: `Your Order Has Shipped! (${order.orderNumber})`,
                body: htmlBody,
                isHtml: true,
                channel: "email"
            }).catch(err => console.error("[Admin] Shipping email dispatch failed:", err));
        } catch (err) {
            console.error("[Admin] Shipping email generation failed:", err);
        }

        return NextResponse.json({ success: true, data: order });
    }

    // ── MARK DELIVERED ──
    if (action === "mark_delivered") {
        const { orderId } = body;
        const order = await Order.findByIdAndUpdate(orderId, { status: "delivered", deliveredAt: new Date() }, { new: true });
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: order });
    }

    // ── RESEND CONFIRMATION EMAIL ──
    if (action === "resend_confirmation") {
        const { orderId } = body;
        const order = await Order.findById(orderId);
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        if (!order.email || order.email === "pending@checkout.local") {
            return NextResponse.json({ error: "No valid email to send to" }, { status: 400 });
        }

        try {
            const { generateOrderConfirmationEmail } = require("@/lib/email-templates");
            const htmlBody = generateOrderConfirmationEmail(order);
            await sendMessage({
                to: { email: order.email },
                from: { email: process.env.OUTREACH_EMAIL || "support@swaddleshawls.com", name: "SwaddleShawls" },
                subject: `Your SwaddleShawls Receipt — ${order.orderNumber}`,
                body: htmlBody,
                isHtml: true,
                channel: "email"
            });
            return NextResponse.json({ success: true, message: "Confirmation email resent" });
        } catch (err) {
            console.error("[Admin] Resending confirmation failed:", err);
            return NextResponse.json({ error: "Failed to resend confirmation: " + err.message }, { status: 500 });
        }
    }

    // ── SYNC STRIPE (Backfill missing orders) ──
    if (action === "sync_stripe") {
        try {
            const Stripe = require("stripe");
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            
            // Fetch recent successful checkout sessions
            const sessions = await stripe.checkout.sessions.list({ limit: 50 });
            let updatedCount = 0;

            for (const session of sessions.data) {
                if (session.payment_status === "paid" || session.status === "complete") {
                    const { orderId, receiptId, customerName } = session.metadata || {};
                    
                    // Find matching order
                    let order = null;
                    if (receiptId) order = await Order.findOne({ receiptId });
                    if (!order && orderId) order = await Order.findById(orderId);
                    
                    // If order exists but is stuck in awaiting_payment, or lacks Stripe data
                    if (order && (order.status === "awaiting_payment" || !order.stripeSessionId)) {
                        order.status = "confirmed";
                        order.surgeStatus = "paid_stripe";
                        order.paymentMethod = "stripe";
                        order.stripeSessionId = session.id;
                        order.stripePaymentIntent = session.payment_intent;

                        const stripeEmail = session.customer_details?.email || session.customer_email;
                        const stripeName = session.customer_details?.name || customerName;
                        if (stripeEmail && (order.email === "pending@checkout.local" || !order.email)) {
                            order.email = stripeEmail.toLowerCase().trim();
                        }
                        if (stripeName && (order.customerName === "Pending Customer" || !order.customerName)) {
                            order.customerName = stripeName.trim();
                        }

                        const shipping = session.shipping_details || session.shipping;
                        if (shipping?.address) {
                            order.shippingAddress = {
                                street: [shipping.address.line1, shipping.address.line2].filter(Boolean).join(", "),
                                city: shipping.address.city || "",
                                state: shipping.address.state || "",
                                zip: shipping.address.postal_code || "",
                                country: shipping.address.country || "",
                            };
                        }

                        await order.save();
                        updatedCount++;

                        // Basic CRM Upsert
                        if (order.email && order.email !== "pending@checkout.local") {
                            await Client.findOneAndUpdate(
                                { email: order.email },
                                { $setOnInsert: { name: order.customerName || "Customer" } },
                                { upsert: true }
                            );
                            
                            // Non-blocking full CRM sync
                            try {
                                const nameParts = (order.customerName || "").trim().split(/\s+/);
                                const firstName = nameParts[0] || "";
                                const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "Customer";
                                upsertContact({
                                    email: order.email,
                                    first_name: firstName,
                                    last_name: lastName,
                                    tags: ["ecommerce", "stripe", process.env.BRAND_CRM_TAG || "surgeshop"],
                                }).catch(() => {});
                            } catch (e) {}
                        }
                    }
                }
            }
            return NextResponse.json({ success: true, message: `Stripe sync complete. Updated ${updatedCount} stuck orders.` });
        } catch (err) {
            console.error("[Admin] Stripe sync failed:", err);
            return NextResponse.json({ error: "Stripe sync failed: " + err.message }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
