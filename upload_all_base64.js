const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });
const SURGE_BASE = "https://surge.basalthq.com";
const SURGE_KEY = process.env.SURGE_API_KEY;
const PUBLIC_PRODUCTS_DIR = "u:/SwaddleShawls/eCommerceSite/swaddleshawls/public/products";

function fileToDataUrl(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const base64 = fs.readFileSync(filePath, { encoding: 'base64' });
    return `data:${mimeType};base64,${base64}`;
}

async function run() {
    console.log("Fetching current inventory...");
    const invRes = await fetch(`${SURGE_BASE}/api/inventory`, {
        headers: { "Ocp-Apim-Subscription-Key": SURGE_KEY }
    });
    const inventory = await invRes.json();
    const items = Array.isArray(inventory) ? inventory : (inventory.items || inventory.products || []);

    const targetSkus = [
        "VSS-001", "HFS-001", "KVR-001", "GSS-001", "RPP-001", "KMB-001",
        "JPP-001", "DSH-001", "MBS-001", "EFW-001", "GLS-001", "MMS-001",
        "EPU39F8P3", "RK4RWVUTL", "SC55JFH9Z", "DNQ3P5HA6", "BRH-001"
    ];

    for (const sku of targetSkus) {
        let prod = items.find(i => i.sku === sku);
        if (!prod && sku === "BRH-001") {
            // Reconstruct if missing from fetch
            prod = {
                wallet: '0x14c95030baAb410e165609560367A83392d2b7C7',
                name: 'The Agra Brick Henna Swaddle',
                sku: 'BRH-001',
                category: 'Newborn Essentials',
                priceUsd: 30,
                stockQty: 50,
                description: "Inspired by the warm, sunlit clay walls of Agra heritage quarters. A rich brick red cotton muslin swaddle adorned with delicate cream henna-inspired vine, leaf, and mandala block-print patterns. Each piece is handcrafted using traditional Indian block-printing techniques passed down through generations. Perfectly sized for swaddling, nursing, or as a stroller cover.",
                tags: ['swaddle','brick red','henna','agra','heritage','botanical','newborn','cotton','premium','block-print'],
                taxable: true,
                shippingEnabled: true,
                attributes: {
                    analytics: {
                        size: '47x47 inches (120x120 cm)',
                        color: 'Brick Red / Cream',
                        material: '100% Cotton Muslin',
                        pattern: 'Henna Vine and Mandala Block Print',
                        age_group: 'Newborn (0-6 months)'
                    },
                    care_instructions: 'Machine wash cold with similar colors. Tumble dry low.'
                }
            };
        }

        if (!prod) {
            console.log(`Skipping ${sku} (not found)`);
            continue;
        }

        // Gather all existing local images for this SKU
        const images = [];
        for (let i = 1; i <= 4; i++) {
            const exts = ['.png', '.webp', '.jpg'];
            let found = false;
            for (const ext of exts) {
                const fullPath = path.join(PUBLIC_PRODUCTS_DIR, `${sku}_${i}${ext}`);
                if (fs.existsSync(fullPath)) {
                    images.push(fileToDataUrl(fullPath));
                    found = true;
                    break;
                }
            }
        }

        if (images.length > 0) {
            prod.images = images;
            console.log(`Pushing ${sku} with ${images.length} images...`);
            
            // Clean up unneeded server-injected fields
            delete prod._id; delete prod.id; delete prod.createdAt; delete prod.updatedAt;

            const res = await fetch(`${SURGE_BASE}/api/inventory`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": SURGE_KEY
                },
                body: JSON.stringify(prod)
            });
            const text = await res.text();
            console.log(` -> Status ${res.status}: ${text.substring(0, 100)}`);
        } else {
            console.log(`No local images found for ${sku}`);
        }
    }
}

run().catch(console.error);
