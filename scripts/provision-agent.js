/**
 * SwaddleShawls — ElevenLabs Agent Provisioning Script
 *
 * Run once with: node scripts/provision-agent.js
 *
 * Creates a Conversational AI agent on ElevenLabs and registers all client tools.
 * Outputs the AGENT_ID to paste into .env.local.
 *
 * Requires: ELEVENLABS_API_KEY in .env.local
 */

const fs = require("fs");
const path = require("path");

const agentInventory = require("../src/data/agent-inventory.json");
const inventoryByCategory = {};
agentInventory.forEach(item => {
  const cat = item.category || "Other";
  if (!inventoryByCategory[cat]) inventoryByCategory[cat] = [];
  
  let modifiersText = "";
  if (item.modifierGroups && item.modifierGroups.length > 0) {
    const sizeGroup = item.modifierGroups.find(g => g.name?.toLowerCase().includes("size") || g.title?.toLowerCase().includes("size"));
    if (sizeGroup && sizeGroup.modifiers) {
      const sizes = sizeGroup.modifiers.map(m => {
        return m.priceAdjustment > 0 ? `${m.name} (+$${m.priceAdjustment})` : m.name;
      }).join(", ");
      modifiersText = ` [Sizes: ${sizes}]`;
    }
  }
  
  inventoryByCategory[cat].push(`- ${item.name} ($${item.price})${modifiersText}`);
});
let inventoryString = "";
Object.keys(inventoryByCategory).forEach(cat => {
  inventoryString += `\n[${cat}]\n${inventoryByCategory[cat].join("\n")}\n`;
});

// ── Load env ──
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const API_KEY = process.env.ELEVENLABS_API_KEY || "";
const API_BASE = "https://api.elevenlabs.io/v1";

if (!API_KEY) {
  console.error("❌ Missing ELEVENLABS_API_KEY in .env.local");
  process.exit(1);
}

// ── System prompt ──
const SYSTEM_PROMPT = `
You are Nani — the voice concierge for SwaddleShawls, a heritage Indian baby textile brand.
Your name means "grandmother" in Hindi, reflecting the warmth and wisdom of generations of artisan families.
You help customers discover handcrafted baby shawls and swaddles, manage their cart, and answer questions about the collection.
Be warm, knowledgeable, and concise — like a trusted family member helping choose the perfect gift.

Brand Context:
- Name: SwaddleShawls
- Tagline: "Pure Comfort from India"
- Heritage: Authentic Indian luxury for babies — traditional 100% cotton baby shawls, handcrafted with heritage techniques including block printing, hand-weaving, and natural dyeing.
- Collections: Our main collections are "Newborn Essentials" and "Parenthood Essentials". Here is our exact live inventory:
${inventoryString}
- Special: Currently in launch mode with exclusive pre-order pricing (10% off retail).
- Top Sellers: The Varanasi Sunset Silk-Blend Swaddle, The Himalayan Frost Heritage Swaddle, and the Golden Lotus Shawl.
- Newsletter: Customers can sign up for the newsletter to receive a WELCOME10 coupon code for an additional 10% discount.

CRITICAL ANTI-HALLUCINATION RULES:
1. NEVER invent or guess items, prices, or availability.
2. You now have the exact live inventory listed in your "Collections" context above. Use that to answer questions about what we sell.
3. If a user asks for an item not on that list, explicitly state that we do not carry that item. Do not invent an alternative.
4. You may only suggest items from the literal inventory list provided above.
5. NEVER just read off a long list of search results. You are a visual concierge. ALWAYS immediately use getProductDetails to open a modal and show them the first/best item, rather than just verbally listing what you found.

Tool Usage:
1) Use getAvailableCategories when the user asks what collections or categories are available.
2) Use suggestProducts when the customer describes a need to find items based on keywords or categories.
2) Use getProductDetails for specific item lookups by name.
3) Use addToCart to add items. Confirm with name, qty, and the new total price.
4) Use removeFromCart to remove items. Confirm with name and the new total price.
5) Use getCartSummary to report cart contents.
6) Use openCart to physically open the cart UI if the user wants to see their cart, and closeCart to close it.
7) Use closeProductModal to close the product details popup if the user asks to close it, or when finishing a product presentation.
8) If the customer asks about discounts, or if they seem hesitant about a price, use showNewsletterSignup to trigger the signup modal and explicitly offer them 10% off.
9) If a user asks to buy an item that has sizes, and hasn't specified one, ask them what size they want before adding it to the cart. If they specify a size while looking at an item, execute setProductSize to visually select it on their screen.

Sales Presentation Style: DO NOT just list names of items to the customer. When you have an item to recommend, DO NOT tell them about it first — ALWAYS immediately execute getProductDetails to pull it up on their screen! Wait for the tool to finish, then tell a brief, captivating 2-sentence story about why it's perfect, and pause. If the user wants to see another item, you MUST first execute closeProductModal to clear the screen, then repeat the process with the new item. Be a master salesperson. Take your time with each item.

Conversation Ending: When the user says goodbye or is done shopping, politely thank them for shopping at SwaddleShawls before ending the conversation. You MUST execute the closeProductModal tool to clear the screen when finishing the conversation. Do not just verbally say you are closing it — you MUST execute the tool.

Greeting: "Namaste! Welcome to SwaddleShawls. I'm Nani, your personal shopping guide. Are you shopping for your little one, or looking for the perfect gift?"
`.trim();

// ── Client tool definitions ──
const CLIENT_TOOLS = [
  {
    name: "getAllInventory",
    description: "Get the complete product catalog. Call this at the start of the conversation to load all products.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    expects_response: true,
  },
  {
    name: "getAvailableCategories",
    description: "Get a list of all current product categories/collections in the store.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    expects_response: true,
  },
  {
    name: "closeProductModal",
    description: "Close the currently open product modal on the user's screen. Use this before showing a new item if one is already open.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    expects_response: true,
  },
  {
    name: "getProductDetails",
    description: "Get the full details of a specific product and display it on the customer's screen. ALWAYS use this to show an item to the user instead of just talking about it.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "The product name or partial name to search for" },
      },
      required: ["name"],
    },
    expects_response: true,
  },
  {
    name: "setProductSize",
    description: "Visually select a size for the product currently being viewed in the modal. Use this if the user asks to see a different size or selects a size before adding to cart.",
    parameters: {
      type: "object",
      properties: {
        size: { type: "string", description: "The size to select (e.g. '0-3 Months', 'S')" },
      },
      required: ["size"],
    },
    expects_response: true,
  },
  {
    name: "suggestProducts",
    description: "Get product suggestions based on a use case, need, collection, or category (e.g., 'newborn gift', 'nursing cover', 'parenthood collection', 'block print').",
    parameters: {
      type: "object",
      properties: {
        useCase: { type: "string", description: "The use case, need, or search terms" },
        category: { type: "string", description: "The product category to filter by (e.g., 'Newborn Essentials' or 'Parenthood Essentials')" },
      },
      required: [],
    },
    expects_response: true,
  },
  {
    name: "addToCart",
    description: "Add a product to the customer's shopping cart by name.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "The product name to add" },
        qty: { type: "number", description: "Quantity to add (default 1)" },
        size: { type: "string", description: "The size to add (e.g. '0-3 Months', 'S', 'XXL'), if applicable" },
      },
      required: ["name"],
    },
    expects_response: true,
  },
  {
    name: "removeFromCart",
    description: "Remove a product from the customer's shopping cart by name.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "The product name to remove" }
      },
      required: ["name"],
    },
    expects_response: true,
  },
  {
    name: "getCartSummary",
    description: "Get the current contents of the customer's cart including items, quantities, and subtotal.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    expects_response: true,
  },
  {
    name: "openCart",
    description: "Open the cart drawer on the user's screen so they can see their items.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    expects_response: true,
  },
  {
    name: "closeCart",
    description: "Close the cart drawer on the user's screen.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    expects_response: true,
  },
  {
    name: "changeLanguage",
    description: "Change the agent's voice language. Use when the customer speaks a different language. The conversation will restart after the change. Use ISO 639-1 language codes (e.g., 'hi' for Hindi, 'es' for Spanish, 'fr' for French, 'ta' for Tamil, 'ur' for Urdu, 'ar' for Arabic).",
    parameters: {
      type: "object",
      properties: {
        language: { type: "string", description: "ISO 639-1 language code (e.g., 'hi', 'es', 'fr', 'de', 'ar', 'ta')" },
      },
      required: ["language"],
    },
    expects_response: true,
  },
  {
    name: "showNewsletterSignup",
    description: "Show the newsletter signup modal to the customer so they can get a 10% discount code. Use when the customer asks about discounts, deals, or saving money.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    expects_response: true,
  },
];

// ── Main ──
async function main() {
  console.log("🚀 SwaddleShawls — ElevenLabs Agent Provisioning\n");

  const agentPayload = {
    name: "SwaddleShawls Nani",
    conversation_config: {
      agent: {
        prompt: {
          prompt: SYSTEM_PROMPT,
        },
        first_message: "Namaste! Welcome to SwaddleShawls. I'm Nani, your personal shopping guide. Are you shopping for your little one, or looking for the perfect gift?",
        language: "en",
      },
      tts: {
        model_id: "eleven_turbo_v2",
        voice_id: "2qQJWjw5XdG80GreshqG",
      },
    },
    platform_settings: {
      auth: {
        enable_auth: true, // Requires signed URL (keeps API key server-side)
      },
    },
  };

  let agentId = process.env.ELEVENLABS_AGENT_ID;
  
  if (agentId) {
    console.log(`📦 Updating existing agent: ${agentId}...`);
    const updateRes = await fetch(`${API_BASE}/convai/agents/${agentId}`, {
      method: "PATCH",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation_config: agentPayload.conversation_config }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      console.error("❌ Failed to update agent:", updateRes.status, err);
      process.exit(1);
    }
    console.log(`✅ Agent updated: ${agentId}\n`);
  } else {
    console.log("📦 Creating new agent...");
    const createRes = await fetch(`${API_BASE}/convai/agents/create`, {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(agentPayload),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error("❌ Failed to create agent:", createRes.status, err);
      process.exit(1);
    }

    const agentData = await createRes.json();
    agentId = agentData.agent_id || agentData.id;
    console.log(`✅ Agent created: ${agentId}\n`);
  }

  // 2. Create client tools
  console.log("🛠️  Creating client tools...");
  const toolIds = [];

  for (const tool of CLIENT_TOOLS) {
    const payload = {
      name: tool.name,
      type: "client",
      tool_config: {
        type: "client",
        name: tool.name,
        description: tool.description,
        expects_response: tool.expects_response,
        parameters: {
          type: "object",
          required: tool.parameters.required || [],
          properties: tool.parameters.properties || {},
        },
      },
    };

    const res = await fetch(`${API_BASE}/convai/tools`, {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`  ❌ Failed to create ${tool.name}:`, err);
      continue;
    }

    const data = await res.json();
    const toolId = data.tool_id || data.id;
    console.log(`  ✅ ${tool.name}: ${toolId}`);
    toolIds.push(toolId);
  }

  // 3. Link tools to agent
  console.log(`\n🔗 Linking ${toolIds.length} tools to agent ${agentId}...`);
  const patchRes = await fetch(`${API_BASE}/convai/agents/${agentId}`, {
    method: "PATCH",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversation_config: {
        agent: {
          prompt: {
            tool_ids: toolIds,
          },
        },
      },
    }),
  });

  if (!patchRes.ok) {
    const err = await patchRes.text();
    console.error("❌ Failed to link tools:", err);
  } else {
    console.log("✅ Tools linked successfully!");
  }

  // 4. Output instructions
  console.log("\n" + "=".repeat(60));
  console.log("🎉 PROVISIONING COMPLETE!");
  console.log("=".repeat(60));
  console.log(`\nAgent ID: ${agentId}`);
  console.log(`\nAdd this to your .env.local:`);
  console.log(`  ELEVENLABS_AGENT_ID=${agentId}`);
  console.log(`\nThen restart your dev server.`);
  console.log("=".repeat(60));

  // 5. Attempt to auto-update .env.local
  try {
    let envContent = fs.readFileSync(envPath, "utf-8");
    if (envContent.includes("ELEVENLABS_AGENT_ID=")) {
      envContent = envContent.replace(
        /ELEVENLABS_AGENT_ID=.*/,
        `ELEVENLABS_AGENT_ID=${agentId}`
      );
    } else {
      envContent += `\nELEVENLABS_AGENT_ID=${agentId}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ Auto-updated .env.local with ELEVENLABS_AGENT_ID");
  } catch (e) {
    console.warn("\n⚠️  Could not auto-update .env.local:", e.message);
    console.log("   Please add ELEVENLABS_AGENT_ID manually.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
