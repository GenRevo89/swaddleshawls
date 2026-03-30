import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Client from "@/models/Client";
import { upsertContact, upsertAccount, createOpportunity } from "@/lib/crm";

// POST — Confirm order after successful payment (triggers CRM sync)
export async function POST(req) {
    try {
        const body = await req.json();
        const { receiptId } = body;

        if (!receiptId) {
            return NextResponse.json(
                { error: "receiptId is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const order = await Order.findOne({ receiptId });
        if (!order) {
            return NextResponse.json(
                { error: "Order not found for this receiptId" },
                { status: 404 }
            );
        }

        // Update order status
        order.status = "confirmed";
        order.surgeStatus = "paid";
        await order.save();

        // ── CRM SYNC (chained: Contact → Account → Opportunity) ──
        const client = await Client.findOne({ email: order.email });
        const nameParts = order.customerName.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "Customer";

        // Fire CRM chain in background — never block the response
        (async () => {
            try {
                // 1. Upsert Contact → get contactId
                const contact = await upsertContact({
                    email: order.email,
                    first_name: firstName,
                    last_name: lastName,
                    mobile_phone: client?.phone || undefined,
                    tags: ["ecommerce", process.env.BRAND_CRM_TAG || "surgeshop"],
                });
                const contactId = contact?.id || null;
                console.log("[CRM] Contact synced:", contactId);

                // 2. Upsert Account → get accountId
                const account = await upsertAccount({
                    name: order.customerName,
                    email: order.email,
                    type: "Customer",
                });
                const accountId = account?.id || null;
                console.log("[CRM] Account synced:", accountId);

                // 3. Create Opportunity with linked IDs
                const opp = await createOpportunity({
                    name: `Order ${order.orderNumber} - ${order.customerName}`,
                    description: `E-commerce order: ${order.items.map(i => i.productName).join(", ")}`,
                    budget: Math.round(Number(order.total)),
                    expected_revenue: Math.round(Number(order.total)),
                    close_date: new Date().toISOString().split("T")[0],
                    lead_source: "Website",
                    ...(contactId && { contactId }),
                    ...(accountId && { accountId }),
                });
                console.log("[CRM] Opportunity synced:", opp?.id || opp);
            } catch (err) {
                console.error("[CRM] Sync chain failed:", err);
            }
        })();

        return NextResponse.json(
            { success: true, message: "Order confirmed", data: order },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error confirming order:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
