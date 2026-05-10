import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Look up a Stripe Product by its surge_sku metadata
async function findStripePriceForSku(sku) {
    try {
        const products = await stripe.products.search({
            query: `metadata["surge_sku"]:"${sku}"`,
        });
        if (products.data.length === 0) return null;

        const product = products.data[0];
        if (product.default_price) {
            return typeof product.default_price === "string"
                ? product.default_price
                : product.default_price.id;
        }

        // Fallback: fetch active prices
        const prices = await stripe.prices.list({
            product: product.id,
            active: true,
            currency: "usd",
            limit: 1,
        });
        return prices.data[0]?.id || null;
    } catch (err) {
        console.error(`[Stripe] SKU lookup failed for ${sku}:`, err.message);
        return null;
    }
}

// POST — Create a Stripe Checkout Session
export async function POST(req) {
    try {
        const body = await req.json();
        const { items, email, customerName, orderId, receiptId, couponCode } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "items[] is required" },
                { status: 400 }
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_BRAND_URL || "https://swaddleshawls.com";

        // Try to resolve Stripe Price IDs for each SKU.
        // If a synced product exists, use its Price ID; otherwise fall back to ad-hoc price_data.
        const line_items = [];
        for (const item of items) {
            const stripePriceId = item.sku ? await findStripePriceForSku(item.sku) : null;

            if (stripePriceId) {
                line_items.push({
                    price: stripePriceId,
                    quantity: item.quantity,
                });
            } else {
                // Fallback: ad-hoc pricing for items not yet synced
                line_items.push({
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: item.name,
                            ...(item.image && {
                                images: [item.image.startsWith("http") ? item.image : `${baseUrl}${item.image}`],
                            }),
                        },
                        unit_amount: Math.round(item.price * 100),
                    },
                    quantity: item.quantity,
                });
            }
        }

        // Compute cart subtotal to determine free shipping eligibility
        const cartSubtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const freeStandard = cartSubtotal >= 75;

        // Determine effective coupon
        const isPreorder = process.env.NEXT_PUBLIC_PREORDER === "TRUE";
        let effectiveCouponId = null;

        if (isPreorder && couponCode === "NWSLTR-10") {
            // Stacked: 10% then 10% = 19% total discount
            const stackedId = "PREORDER-NWSLTR-19";
            try {
                await stripe.coupons.retrieve(stackedId);
                effectiveCouponId = stackedId;
            } catch (err) {
                if (err.code === "resource_missing") {
                    await stripe.coupons.create({
                        id: stackedId,
                        percent_off: 19,
                        name: "Stacked Preorder & Newsletter Discount",
                    });
                    effectiveCouponId = stackedId;
                }
            }
        } else if (isPreorder && !couponCode) {
            effectiveCouponId = "PREORDER-10";
        } else if (couponCode) {
            effectiveCouponId = couponCode;
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            ui_mode: "embedded_page",
            payment_method_types: ["card"],
            line_items,
            // Stripe-native shipping address collection
            shipping_address_collection: {
                allowed_countries: [
                    "US", "CA", "GB", "AU", "IN", "DE", "FR", "NL", "IT", "ES",
                    "JP", "SG", "AE", "NZ", "IE", "SE", "NO", "DK", "FI", "CH",
                ],
            },
            // Shipping rate options shown to the customer
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: { amount: freeStandard ? 0 : 599, currency: "usd" },
                        display_name: freeStandard ? "Free Standard Shipping" : "Standard Shipping",
                        delivery_estimate: {
                            minimum: { unit: "business_day", value: 5 },
                            maximum: { unit: "business_day", value: 7 },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: { amount: 1299, currency: "usd" },
                        display_name: "Express Shipping",
                        delivery_estimate: {
                            minimum: { unit: "business_day", value: 2 },
                            maximum: { unit: "business_day", value: 3 },
                        },
                    },
                },
            ],
            metadata: {
                orderId: orderId || "",
                receiptId: receiptId || "",
                customerName: customerName || "",
                source: "swaddleshawls",
                couponCode: couponCode || effectiveCouponId || "",
            },
            ...(effectiveCouponId ? { discounts: [{ coupon: effectiveCouponId }] } : {}),
            return_url: `${baseUrl}/shop?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        });

        return NextResponse.json(
            { success: true, clientSecret: session.client_secret, sessionId: session.id },
            { status: 200 }
        );
    } catch (error) {
        console.error("[Stripe] Checkout session error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
