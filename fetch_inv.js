const SURGE_BASE = "https://surge.basalthq.com";
const SURGE_KEY = "sk_live_6df2c7dcf7bdec86f83c3f33d0838be24a223101d28824bc";

async function fetchInv() {
    const res = await fetch(`${SURGE_BASE}/api/inventory`, {
        headers: {
            "Ocp-Apim-Subscription-Key": SURGE_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

fetchInv();
