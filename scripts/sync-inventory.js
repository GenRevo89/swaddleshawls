const fs = require("fs");
const path = require("path");
// Load local env natively (Node 20.6+)
try { process.loadEnvFile(".env.local"); } catch(e) {}
try { process.loadEnvFile(".env"); } catch(e) {}

const SURGE_BASE = "https://surge.basalthq.com";
const SURGE_KEY = process.env.SURGE_API_KEY;

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

function createAgentInventory(items) {
  return items.map((item) => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    price: Number(item.price),
    category: item.category,
    description: item.description,
    inStock: item.stockQty > 0 || item.stockQty === -1,
    tags: item.tags,
    modifierGroups: item.modifierGroups,
  }));
}

const https = require("https");

async function sync() {
  console.log("🔄 Fetching inventory from BasaltSurge...");
  try {
    const data = await new Promise((resolve, reject) => {
      const req = https.request("https://surge.basalthq.com/api/inventory", {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": SURGE_KEY,
          "Accept": "application/json",
        }
      }, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          if (res.statusCode >= 400) return reject(new Error(`Surge API error: ${res.statusCode} ${body}`));
          resolve(JSON.parse(body));
        });
      });
      req.on("error", reject);
      req.end();
    });

    const items = normalizeItems(data);
    const agentItems = createAgentInventory(items);

    const dataDir = path.join(process.cwd(), "src", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(dataDir, "inventory.json"),
      JSON.stringify(items, null, 2),
      "utf8"
    );

    fs.writeFileSync(
      path.join(dataDir, "agent-inventory.json"),
      JSON.stringify(agentItems, null, 2),
      "utf8"
    );

    console.log(`✅ Inventory synchronized successfully!`);
    console.log(`📦 Total Items: ${items.length}`);
    console.log(`📄 Wrote to src/data/inventory.json and src/data/agent-inventory.json`);
  } catch (error) {
    console.error("❌ Failed to synchronize inventory:", error);
  }
}

sync();
