import { NextResponse } from "next/server";
import { listInventory } from "@/lib/surge";

// GET — Fetch inventory from BasaltSurge (server-side proxy)
export async function GET() {
    try {
        const data = await listInventory();

        // Normalize to array
        const raw = Array.isArray(data) ? data : data?.items || data?.products || [];

        // Map Surge fields to what the shop page expects
        const items = raw.map((item) => ({
            id: item.id || item._id,
            sku: item.sku,
            name: item.name,
            price: item.priceUsd ?? item.price ?? 0,
            category: item.category || "Swaddle",
            description: item.description || "",
            image: item.images && item.images.length > 0 ? item.images[0] : "",
            images: item.images || [],
            tags: item.tags || [],
            stockQty: item.stockQty ?? 0,
            attributes: item.attributes || {},
        }));

        return NextResponse.json({ success: true, data: items }, { status: 200 });
    } catch (error) {
        console.error("Error fetching Surge inventory:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch inventory" },
            { status: 500 }
        );
    }
}
