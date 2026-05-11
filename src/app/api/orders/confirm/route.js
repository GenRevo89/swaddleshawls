import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Client from "@/models/Client";
import { upsertContact, upsertAccount, createOpportunity, sendMessage } from "@/lib/crm";
import { getReceipt } from "@/lib/surge";
import { generateOrderConfirmationEmail } from "@/lib/email-templates";

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

        // ── Fetch receipt from Surge to backfill customer details ──
        try {
            const receipt = await getReceipt(receiptId);
            if (receipt) {
                // Backfill buyer wallet
                if (receipt.buyerWallet) {
                    order.buyerWallet = receipt.buyerWallet;
                }

                // Backfill shipping address (contains name, email, phone from portal)
                const shipping = receipt.shippingAddress;
                if (shipping) {
                    if (shipping.name && (order.customerName === "Pending Customer" || !order.customerName)) {
                        order.customerName = shipping.name.trim();
                    }
                    if (shipping.email && (order.email === "pending@checkout.local" || !order.email)) {
                        order.email = shipping.email.toLowerCase().trim();
                    }
                    if (shipping.line1 || shipping.city) {
                        order.shippingAddress = {
                            street: [shipping.line1, shipping.line2].filter(Boolean).join(", "),
                            city: shipping.city || "",
                            state: shipping.state || "",
                            zip: shipping.zip || "",
                            country: shipping.country || "",
                        };
                    }
                }

                // Also check for transactionHash
                if (receipt.transactionHash) {
                    order.transactionHash = receipt.transactionHash;
                }
            }
        } catch (err) {
            console.warn("[Confirm] Failed to fetch Surge receipt for backfill:", err.message);
            // Non-blocking — proceed with confirmation
        }

        // Update order status
        order.status = "confirmed";
        order.surgeStatus = "paid";
        await order.save();

        // Create/update client record with real details (if we have them)
        if (order.email && order.email !== "pending@checkout.local") {
            await Client.findOneAndUpdate(
                { email: order.email },
                { $setOnInsert: { name: order.customerName || "Customer" } },
                { upsert: true, new: true }
            );
        }

        // ── CRM SYNC (chained: Contact → Account → Opportunity) ──
        // Only sync if we have a real email (skip for placeholder)
        if (order.email && order.email !== "pending@checkout.local") {
            const client = await Client.findOne({ email: order.email });
            const nameParts = (order.customerName || "Customer").trim().split(/\s+/);
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

                    // 4. Send order confirmation email via CRM
                    try {
                        const emailHtml = generateOrderConfirmationEmail(order);
                        await sendMessage({
                            to: order.email,
                            subject: `Your SwaddleShawls Receipt — ${order.orderNumber}`,
                            body: emailHtml,
                            channel: "email",
                        });
                        console.log("[CRM] Confirmation email sent to:", order.email);
                    } catch (emailErr) {
                        console.error("[CRM] Confirmation email failed:", emailErr.message);
                    }
                } catch (err) {
                    console.error("[CRM] Sync chain failed:", err);
                }
            })();
        } else {
            console.log("[Confirm] Skipping CRM sync — no real email available yet");
        }

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
