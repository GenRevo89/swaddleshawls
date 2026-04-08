import { NextResponse } from "next/server";
import { listInventory } from "@/lib/surge";

// ── Server-side Product Cache (Stale-While-Revalidate) ──
// Products are cached in-memory on the Node process. When a request arrives:
//   1. If cache exists → return it instantly (zero latency)
//   2. If cache is stale (past TTL) → still return it, but kick off a background refresh
//   3. If no cache at all → fetch synchronously, cache, and return

const CACHE_TTL_MS = 60 * 1000; // 60 seconds — stale threshold

let cachedProducts = null;   // { data: [...], timestamp: number }
let refreshInFlight = false; // Prevents duplicate background refreshes

function normalizeItems(data) {
    const raw = Array.isArray(data) ? data : data?.items || data?.products || [];

    return raw.map((item) => ({
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
        modifierGroups: item.modifierGroups || item.attributes?.modifierGroups || [],
    }));
}

async function fetchAndCache() {
    try {
        const data = await listInventory();
        const items = normalizeItems(data);
        cachedProducts = { data: items, timestamp: Date.now() };
        return items;
    } catch (error) {
        console.error("[ProductCache] Background refresh failed:", error.message);
        return null;
    } finally {
        refreshInFlight = false;
    }
}

function triggerBackgroundRefresh() {
    if (refreshInFlight) return; // Already refreshing
    refreshInFlight = true;
    // Fire-and-forget — doesn't block the response
    fetchAndCache();
}

// GET — Fetch inventory with SWR caching
export async function GET() {
    try {
        // Case 1: Cache exists
        if (cachedProducts) {
            const age = Date.now() - cachedProducts.timestamp;

            // Stale — return cached, refresh in background
            if (age > CACHE_TTL_MS) {
                triggerBackgroundRefresh();
            }

            return NextResponse.json(
                { success: true, data: cachedProducts.data, cached: true },
                {
                    status: 200,
                    headers: { "X-Cache": age > CACHE_TTL_MS ? "STALE" : "HIT" },
                }
            );
        }

        // Case 2: No cache — cold start, fetch synchronously
        const items = await fetchAndCache();
        if (!items) {
            return NextResponse.json(
                { success: false, error: "Failed to fetch inventory" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, data: items, cached: false },
            {
                status: 200,
                headers: { "X-Cache": "MISS" },
            }
        );
    } catch (error) {
        console.error("Error fetching Surge inventory:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch inventory" },
            { status: 500 }
        );
    }
}
