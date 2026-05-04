import { NextResponse } from "next/server";
import { listInventory } from "@/lib/surge";
import fs from "fs";
import path from "path";

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
        
        // Write full inventory to json
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

// GET — Fetch inventory statically with background refresh (Stale-While-Revalidate)
export async function GET() {
    try {
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
        
        // Fallback if not synced yet: Trigger a sync immediately and wait
        const items = await fetchAndCache();
        if (items) {
            return NextResponse.json(
                { success: true, data: items, cached: false },
                { headers: { "Cache-Control": "no-store" } }
            );
        }
        
        return NextResponse.json(
            { success: true, data: [], cached: false },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("[api/products] Error reading inventory:", error);
        return NextResponse.json(
            { success: false, error: "Failed to load products" },
            { status: 500 }
        );
    }
}

// Trigger refresh
