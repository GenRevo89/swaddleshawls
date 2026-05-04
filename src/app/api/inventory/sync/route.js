import { NextResponse } from "next/server";
import { listInventory } from "@/lib/surge";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

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
        break; // Found this index, move to next
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
  }));
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (token !== "chandra010326") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await listInventory();
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

    return NextResponse.json({
      success: true,
      message: "Inventory synchronized successfully",
      totalItems: items.length,
    });
  } catch (error) {
    console.error("[inventory/sync] Error:", error);
    return NextResponse.json(
      { error: "Failed to synchronize inventory", detail: error.message },
      { status: 500 }
    );
  }
}
