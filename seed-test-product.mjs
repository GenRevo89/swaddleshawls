// Quick script to add a $1 test product to BasaltSurge inventory
const SURGE_BASE = "https://surge.basalthq.com";
const SURGE_KEY = process.env.SURGE_API_KEY;

async function addTestProduct() {
    const res = await fetch(`${SURGE_BASE}/api/inventory`, {
        method: "POST",
        headers: {
            "Ocp-Apim-Subscription-Key": SURGE_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: "Test Product",
            sku: "TEST-1USD",
            priceUsd: 1.00,
            description: "A $1 test product for payment flow testing",
            category: "Test",
            stockQty: 999,
        }),
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
}

addTestProduct();
