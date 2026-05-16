import { NextResponse } from "next/server";
import { listInventory } from "@/lib/surge";
import fs from "fs";
import path from "path";

// ── Static Fallback ──
// This import is always bundled by Vercel's file tracer, guaranteeing
// product data is available even when the filesystem cache is missing
// and the Surge API is unreachable.
import staticInventory from "@/data/inventory.json";

// ── Server-side Product Cache (Stale-While-Revalidate) ──
let refreshInFlight = false; // Prevents duplicate background refreshes

// ── Resolve local product images by SKU ──
const PRODUCTS_DIR = path.join(process.cwd(), "public", "products");
const IMAGE_EXTS = [".webp", ".png"];

function resolveLocalImages(sku) {
    if (!sku) return [];
    const images = [];
    for (let i = 1; i <= 4; i++) {
        for (const ext of IMAGE_EXTS) {
            const filename = `${sku}_${i}${ext}`;
            const fullPath = path.join(PRODUCTS_DIR, filename);
            if (fs.existsSync(fullPath)) {
                images.push(`/products/${filename}`);
                break;
            }
        }
    }
    return images;
}

function normalizeItems(data) {
    const raw = Array.isArray(data) ? data : data?.items || data?.products || [];

    return raw.map((item) => {
        const sku = item.sku;
        const localImages = resolveLocalImages(sku);
        const images = localImages.length > 0 ? localImages : [];

        return {
            id: item.id || item._id,
            sku,
            name: item.name,
            price: item.priceUsd ?? item.price ?? 0,
            category: item.category || "Swaddle",
            description: item.description || "",
            image: images[0] || "",
            images,
            tags: item.tags || [],
            stockQty: item.stockQty ?? 0,
            attributes: item.attributes || {},
            modifierGroups: item.modifierGroups || item.attributes?.modifierGroups || [],
        };
    });
}

async function fetchAndCache() {
    try {
        const data = await listInventory();
        const items = normalizeItems(data);
        
        // Write full inventory to json (may fail on read-only filesystems like Vercel)
        try {
            const dataDir = path.join(process.cwd(), "src", "data");
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            fs.writeFileSync(
                path.join(dataDir, "inventory.json"),
                JSON.stringify(items, null, 2),
                "utf8"
            );
            
            // Write agent inventory
            const agentItems = items.map((item) => ({
                id: item.id,
                sku: item.sku,
                name: item.name,
                price: Number(item.price),
                category: item.category,
                description: item.description,
                inStock: item.stockQty > 0 || item.stockQty === -1,
                tags: item.tags,
            }));
            
            fs.writeFileSync(
                path.join(dataDir, "agent-inventory.json"),
                JSON.stringify(agentItems, null, 2),
                "utf8"
            );
        } catch (writeErr) {
            // Read-only filesystem (Vercel) — cache write is non-critical
            console.warn("[ProductCache] Cache write skipped (read-only fs):", writeErr.message);
        }
        
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

// GET — Fetch inventory with triple-fallback:
//   1. Filesystem cache (src/data/inventory.json via fs)
//   2. Live Surge API fetch
//   3. Static bundled import (always available, build-time snapshot)
export async function GET() {
    try {
        // ── Layer 1: Filesystem cache ──
        const inventoryPath = path.join(process.cwd(), "src", "data", "inventory.json");
        if (fs.existsSync(inventoryPath)) {
            const stats = fs.statSync(inventoryPath);
            const ageMs = Date.now() - stats.mtimeMs;
            
            // If file is older than 5 minutes (300,000 ms), trigger background sync
            if (ageMs > 300000) {
                triggerBackgroundRefresh();
            }

            const data = fs.readFileSync(inventoryPath, "utf8");
            return NextResponse.json({ success: true, data: JSON.parse(data), cached: true }, {
                headers: { "Cache-Control": "public, max-age=60" }
            });
        }
        
        // ── Layer 2: Live Surge API fetch ──
        const items = await fetchAndCache();
        if (items && items.length > 0) {
            return NextResponse.json(
                { success: true, data: items, cached: false },
                { headers: { "Cache-Control": "no-store" } }
            );
        }
        
        // ── Layer 3: Static bundled fallback (build-time snapshot) ──
        if (Array.isArray(staticInventory) && staticInventory.length > 0) {
            console.warn("[api/products] Serving from static bundled fallback");
            return NextResponse.json(
                { success: true, data: staticInventory, cached: true, static: true },
                { headers: { "Cache-Control": "public, max-age=120" } }
            );
        }

        return NextResponse.json(
            { success: true, data: [], cached: false },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("[api/products] Error reading inventory:", error);

        // Even on total failure, serve the static fallback
        if (Array.isArray(staticInventory) && staticInventory.length > 0) {
            console.warn("[api/products] Error recovery — serving static fallback");
            return NextResponse.json(
                { success: true, data: staticInventory, cached: true, static: true },
                { headers: { "Cache-Control": "public, max-age=120" } }
            );
        }

        return NextResponse.json(
            { success: false, error: "Failed to load products" },
            { status: 500 }
        );
    }
}

// Trigger refresh
