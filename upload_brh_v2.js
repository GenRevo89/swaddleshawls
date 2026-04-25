const fs = require('fs');

require('dotenv').config({ path: '.env.local' });
const SURGE_BASE = "https://surge.basalthq.com";
const SURGE_KEY = process.env.SURGE_API_KEY;

function fileToDataUrl(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const base64 = fs.readFileSync(filePath, { encoding: 'base64' });
    return `data:${mimeType};base64,${base64}`;
}

const images = [
    fileToDataUrl('u:/SwaddleShawls/eCommerceSite/swaddleshawls/public/products/BRH-001_1.png'),
    fileToDataUrl('u:/SwaddleShawls/eCommerceSite/swaddleshawls/public/products/BRH-001_2.png'),
    fileToDataUrl('u:/SwaddleShawls/eCommerceSite/swaddleshawls/public/products/BRH-001_3.png')
];

const product = {
    wallet: '0x14c95030baAb410e165609560367A83392d2b7C7',
    name: 'The Agra Brick Rose Swaddle',
    sku: 'BRH-001',
    category: 'Newborn Essentials',
    priceUsd: 30,
    stockQty: 50,
    description: "Inspired by the warm, sunlit clay walls of Agra heritage quarters. A rich brick red cotton muslin swaddle adorned with a simple, elegant gold rosebud block-print pattern. Each piece is handcrafted using traditional Indian block-printing techniques passed down through generations. Perfectly sized for swaddling, nursing, or as a stroller cover.",
    tags: ['swaddle','brick red','rosebud','agra','heritage','botanical','newborn','cotton','premium','block-print'],
    taxable: true,
    shippingEnabled: true,
    images: images,
    attributes: {
        analytics: {
            size: '47x47 inches (120x120 cm)',
            color: 'Brick Red / Gold',
            material: '100% Cotton Muslin',
            pattern: 'Gold Rosebud Block Print',
            age_group: 'Newborn (0-6 months)'
        },
        care_instructions: 'Machine wash cold with similar colors. Tumble dry low.'
    }
};

async function upload() {
    console.log("Pushing updated BRH-001...");
    const res = await fetch(`${SURGE_BASE}/api/inventory`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": SURGE_KEY
        },
        body: JSON.stringify(product)
    });
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text.substring(0, 200)}...`);
}

upload().catch(console.error);
