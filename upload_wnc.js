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
    fileToDataUrl('u:/SwaddleShawls/eCommerceSite/swaddleshawls/public/products/WNC-001_1.png'),
    fileToDataUrl('u:/SwaddleShawls/eCommerceSite/swaddleshawls/public/products/WNC-001_2.png'),
    fileToDataUrl('u:/SwaddleShawls/eCommerceSite/swaddleshawls/public/products/WNC-001_3.png')
];

const product = {
    wallet: '0x14c95030baAb410e165609560367A83392d2b7C7',
    name: 'The Pure White Bindi Nursing Cover',
    sku: 'WNC-001',
    category: 'Parenthood Essentials',
    priceUsd: 35,
    stockQty: 50,
    description: "An elegant, completely opaque pure white cotton nursing cover designed for absolute privacy and comfort. Adorned with a delicate, traditional Indian bindi dot block-print pattern in bright red. The breathable yet thick muslin weave ensures your baby stays cool while providing full coverage for confident nursing anywhere.",
    tags: ['nursing cover','white','bindi','dot','opaque','privacy','parenthood','cotton','premium','block-print','red'],
    taxable: true,
    shippingEnabled: true,
    images: images,
    attributes: {
        analytics: {
            size: 'One Size Fits Most',
            color: 'Opaque White / Red',
            material: '100% Cotton Muslin',
            pattern: 'Traditional Bindi Dot Print',
            age_group: 'Adult / Maternity'
        },
        care_instructions: 'Machine wash cold with similar colors. Tumble dry low.'
    }
};

async function upload() {
    console.log("Pushing new WNC-001...");
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
