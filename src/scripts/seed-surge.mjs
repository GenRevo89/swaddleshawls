// Seed inventory to BasaltSurge with base64 data URI images
// Run: node --env-file=.env.local src/scripts/seed-surge.mjs

import { readFileSync } from "fs";
import { resolve } from "path";

const SURGE_BASE = "https://surge.basalthq.com";
const SURGE_KEY = process.env.SURGE_API_KEY;

if (!SURGE_KEY) { console.error("❌ Missing SURGE_API_KEY"); process.exit(1); }

// Convert local image to data URI
function toDataUri(filePath) {
    const buffer = readFileSync(resolve(filePath));
    const base64 = buffer.toString("base64");
    return `data:image/png;base64,${base64}`;
}

const PRODUCTS = [
    {
        sku: "BPC-157-5MG",
        name: "BPC-157 (Body Protective Compound)",
        priceUsd: 49.99, stockQty: 50, category: "peptides",
        description: "Research-grade peptide supporting tissue repair and gut health. 5mg lyophilized powder per vial.",
        tags: ["peptide", "recovery", "gut-health"], taxable: true, costUsd: 12.00,
        attributes: { weight: "5mg", form: "lyophilized powder" },
        imagePath: "public/products/bpc-157.png",
    },
    {
        sku: "TB500-5MG",
        name: "TB-500 (Thymosin Beta-4)",
        priceUsd: 54.99, stockQty: 40, category: "peptides",
        description: "Recovery peptide promoting cell migration and tissue regeneration. 5mg per vial.",
        tags: ["peptide", "recovery", "regeneration"], taxable: true, costUsd: 14.00,
        attributes: { weight: "5mg", form: "lyophilized powder" },
        imagePath: "public/products/tb-500.png",
    },
    {
        sku: "GHK-CU-50MG",
        name: "GHK-Cu (Copper Peptide)",
        priceUsd: 39.99, stockQty: 60, category: "peptides",
        description: "Anti-aging copper peptide complex for skin rejuvenation and wound healing. 50mg jar.",
        tags: ["peptide", "anti-aging", "skin"], taxable: true, costUsd: 8.00,
        attributes: { weight: "50mg", form: "topical cream" },
        imagePath: "public/products/ghk-cu.png",
    },
    {
        sku: "NAD-TABS-30",
        name: "NAD+ Sublingual Tablets",
        priceUsd: 79.99, stockQty: 100, category: "longevity",
        description: "High-purity NAD+ for cellular energy and longevity support. 30 tablets, 250mg each.",
        tags: ["nad", "longevity", "cellular-energy"], taxable: true, costUsd: 22.00,
        attributes: { count: "30", dosage: "250mg" },
        imagePath: "public/products/nad-tablets.png",
    },
    {
        sku: "MB-1PCT-50ML",
        name: "Methylene Blue (Pharmaceutical Grade)",
        priceUsd: 34.99, stockQty: 75, category: "nootropics",
        description: "Mitochondrial optimizer and nootropic. 1% solution, 50mL dropper bottle.",
        tags: ["nootropic", "mitochondria", "focus"], taxable: true, costUsd: 6.00,
        attributes: { concentration: "1%", volume: "50mL" },
        imagePath: "public/products/methylene-blue.png",
    },
    {
        sku: "RAPA-MICRO-30",
        name: "Rapamycin Micro-Dose Kit",
        priceUsd: 129.99, stockQty: 25, category: "longevity",
        description: "Longevity protocol micro-dosing kit with dosing schedule guide. 30-day supply.",
        tags: ["longevity", "rapamycin", "mtor"], taxable: true, costUsd: 45.00,
        attributes: { supply: "30-day", type: "micro-dose" },
        imagePath: "public/products/rapamycin-kit.png",
    },
];

async function main() {
    console.log("🚀 Seeding BasaltSurge Inventory (base64 images)...\n");
    let success = 0;

    for (const product of PRODUCTS) {
        const { imagePath, ...fields } = product;
        console.log(`  → ${product.sku}`);

        // Convert image to base64 data URI
        console.log(`    📷 Encoding ${imagePath}...`);
        const dataUri = toDataUri(imagePath);
        console.log(`    📷 Size: ${Math.round(dataUri.length / 1024)}KB`);

        const payload = { ...fields, images: [dataUri] };

        const res = await fetch(`${SURGE_BASE}/api/inventory`, {
            method: "POST",
            headers: {
                "Ocp-Apim-Subscription-Key": SURGE_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            console.log(`    ✓ Created with image`);
            success++;
        } else {
            const text = await res.text();
            console.error(`    ✗ Failed (${res.status}):`, text.substring(0, 150));
        }
    }

    console.log(`\n✅ ${success}/${PRODUCTS.length} products seeded.`);
}

main().catch(console.error);
