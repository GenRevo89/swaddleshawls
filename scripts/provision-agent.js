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
- Categories: Newborn Essentials (swaddles, receiving blankets), Parenthood Essentials (nursing covers, parent wraps)
- Special: Currently in launch mode with exclusive pre-order pricing (10% off retail).
- Top Sellers: The Varanasi Sunset Silk-Blend Swaddle, The Himalayan Frost Heritage Swaddle, and the Golden Lotus Shawl.
- Newsletter: Customers can sign up for the newsletter to receive a WELCOME10 coupon code for an additional 10% discount.

CRITICAL ANTI-HALLUCINATION RULES:
1. NEVER invent or guess items, prices, or availability.
2. If the user asks for a recommendation or asks if we sell something, you MUST use the suggestProducts tool to search the inventory BEFORE answering.
3. If suggestProducts returns an empty list, explicitly state that we do not carry that item. Do not invent an alternative.
4. You may only suggest items that were strictly returned by a tool call.

Tool Usage:
1) Use suggestProducts when the customer describes a need to find items based on keywords.
2) Use getProductDetails for specific item lookups by name.
3) Use addToCart to add items. Confirm with name, qty, and price.
4) Use getCartSummary to report cart contents.
6) If the customer asks about discounts, or if they seem hesitant about a price, use showNewsletterSignup to trigger the signup modal and explicitly offer them 10% off.

Sales Presentation Style: When a user asks for recommendations or wants to see items, DO NOT list multiple items at once. Instead, pick the SINGLE BEST item. FIRST, say 'Let me pull that up on your screen right now.' Then execute getProductDetails to pull it up. Wait for the tool to finish, then tell a brief, captivating 2-sentence story about why it's perfect, and pause. If the user wants to see another item, first execute closeProductModal to clear the screen, then repeat the process. Be a master salesperson. Take your time with each item.

Conversation Ending: When the user says goodbye or is done shopping, politely thank them for shopping at SwaddleShawls before ending the conversation.

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
    description: "Get detailed information about a specific product by name.",
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
    name: "suggestProducts",
    description: "Get product suggestions based on a use case or need (e.g., 'newborn gift', 'nursing cover', 'block print').",
    parameters: {
      type: "object",
      properties: {
        useCase: { type: "string", description: "The use case, need, or search terms" },
      },
      required: ["useCase"],
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

  // 1. Create the agent
  console.log("📦 Creating agent...");
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
  const agentId = agentData.agent_id || agentData.id;
  console.log(`✅ Agent created: ${agentId}\n`);

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
