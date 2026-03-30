// BasaltSurge API Helper
// All API calls go server-side only — never expose the key in browser code.

const SURGE_BASE = "https://surge.basalthq.com";
const SURGE_KEY = process.env.SURGE_API_KEY;
const MERCHANT_WALLET = process.env.SURGE_MERCHANT_WALLET;

async function surgeRequest(path, options = {}) {
    const { method = "GET", body } = options;

    const headers = {
        "Ocp-Apim-Subscription-Key": SURGE_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "SwaddleShawls/1.0 (NextJS; Server-Side)",
    };

    const res = await fetch(`${SURGE_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    // Some endpoints return empty body on success
    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!res.ok) {
        console.error(`[Surge] ${method} ${path} → ${res.status}:`, data);
        throw new Error(`Surge API error: ${res.status}`);
    }

    return data;
}

// ── Inventory ──

export async function listInventory() {
    return surgeRequest("/api/inventory");
}

export async function createInventoryItem(item) {
    return surgeRequest("/api/inventory", {
        method: "POST",
        body: item,
    });
}

export async function getInventoryItem(id) {
    return surgeRequest(`/api/inventory/${id}`);
}

export async function deleteInventoryItem(id) {
    return surgeRequest(`/api/inventory/${id}`, { method: "DELETE" });
}

// ── Orders ──

export async function createOrder(orderPayload) {
    return surgeRequest("/api/orders", {
        method: "POST",
        body: orderPayload,
    });
}

// ── Receipts ──

export async function getReceipt(receiptId) {
    return surgeRequest(`/api/receipts/${receiptId}`);
}

export async function getReceiptStatus(receiptId) {
    return surgeRequest(`/api/receipts/status?receiptId=${encodeURIComponent(receiptId)}`);
}

// ── Shop Config ──

export async function getShopConfig() {
    return surgeRequest("/api/shop/config");
}

// ── Portal URL ──
// Builds a portal payment URL. `recipient` wallet is required by the portal.
// Options: { embedded, layout, correlationId, returnUrl }
// Omit forcePortalTheme so the merchant's own shop theme is shown.

export function getPortalUrl(receiptId, options = {}) {
    const wallet = options.recipient || MERCHANT_WALLET;
    const params = new URLSearchParams();

    if (wallet) params.set("recipient", wallet);
    if (options.embedded) params.set("embedded", "1");
    if (options.layout) params.set("layout", options.layout);
    if (options.correlationId) params.set("correlationId", options.correlationId);
    if (options.returnUrl) params.set("returnUrl", options.returnUrl);

    return `${SURGE_BASE}/portal/${receiptId}?${params.toString()}`;
}
