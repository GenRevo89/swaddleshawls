import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Client from "@/models/Client";
import { createOrder as createSurgeOrder, getPortalUrl } from "@/lib/surge";

// POST — Create order via BasaltSurge, then save to local DB
export async function POST(req) {
    try {
        const body = await req.json();
        const { email, customerName, items } = body;

        if (!email || !customerName || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields: email, customerName, items[]" },
                { status: 400 }
            );
        }

        for (const item of items) {
            if (!item.productName || !item.quantity || !item.price) {
                return NextResponse.json(
                    { error: "Each item must have productName, quantity, and price" },
                    { status: 400 }
                );
            }
        }

        // ── 1. Create order in BasaltSurge ──
        let receiptId = null;
        let paymentUrl = null;
        let surgeTotal = null;

        try {
            const surgePayload = {
                items: items.map((item) => ({
                    sku: item.sku || item.productName,
                    qty: item.quantity,
                })),
            };

            const surgeResponse = await createSurgeOrder(surgePayload);
            console.log("[Surge] Order response:", JSON.stringify(surgeResponse, null, 2));

            // Handle multiple possible response shapes
            receiptId = surgeResponse?.receipt?.receiptId
                || surgeResponse?.receiptId
                || surgeResponse?.id
                || null;
            surgeTotal = surgeResponse?.receipt?.totalUsd
                || surgeResponse?.totalUsd
                || null;

            if (receiptId) {
                paymentUrl = getPortalUrl(receiptId, {
                    embedded: true,
                    correlationId: receiptId,
                });
                console.log("[Surge] Portal URL:", paymentUrl);
            } else {
                console.error("[Surge] No receiptId found in response:", surgeResponse);
            }
        } catch (surgeError) {
            console.error("[Surge] Order creation failed:", surgeError);
            // Non-blocking — still save locally for manual reconciliation
        }

        // ── 2. Save order to local MongoDB ──
        const localTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const roundedTotal = surgeTotal ?? Math.round(localTotal * 100) / 100;

        await connectToDatabase();

        const order = await Order.create({
            email: email.toLowerCase().trim(),
            customerName: customerName.trim(),
            items,
            total: roundedTotal,
            status: receiptId ? "awaiting_payment" : "confirmed",
            receiptId: receiptId || null,
            surgeStatus: receiptId ? "generated" : null,
            paymentUrl: paymentUrl || null,
        });

        // Auto-create or update client in the clients collection
        await Client.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            { $setOnInsert: { name: customerName.trim() } },
            { upsert: true, new: true }
        );

        // NOTE: CRM sync is deferred to /api/orders/confirm (after payment succeeds)

        return NextResponse.json(
            {
                success: true,
                message: receiptId
                    ? "Order created — complete payment to confirm."
                    : "Order placed successfully!",
                data: {
                    ...order.toObject(),
                    paymentUrl,
                    receiptId,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// GET — Look up orders by email
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json(
                { error: "Email query parameter is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const orders = await Order.find({
            email: email.toLowerCase().trim(),
            status: { $ne: "awaiting_payment" },
        }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: orders }, { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
