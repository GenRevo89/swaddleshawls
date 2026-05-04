import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/voice/signed-url
 *
 * Fetches a signed WebSocket URL from ElevenLabs for the Conversational AI agent.
 * Keeps the API key server-side so the agent can remain private.
 */
export async function POST() {
  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
    const AGENT_ID = process.env.ELEVENLABS_AGENT_ID || "";

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }
    if (!AGENT_ID) {
      return NextResponse.json(
        { error: "ElevenLabs Agent ID not configured" },
        { status: 500 }
      );
    }

    // Get signed URL from ElevenLabs with retry logic (fixes Node.js Undici IPv6 timeout)
    let signedUrlRes;
    let retries = 3;
    while (retries > 0) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 4000);
        
        signedUrlRes = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
          {
            method: "GET",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
            },
            signal: controller.signal,
          }
        );
        clearTimeout(id);
        if (signedUrlRes.ok || signedUrlRes.status < 500) break;
      } catch (err) {
        console.warn(`[voice/signed-url] Fetch failed, retries left: ${retries - 1}. Error:`, err.message);
        if (retries === 1) throw err;
      }
      retries--;
      await new Promise(r => setTimeout(r, 500));
    }

    if (!signedUrlRes.ok) {
      const errText = await signedUrlRes.text().catch(() => "");
      console.error("[voice/signed-url] ElevenLabs error:", signedUrlRes.status, errText);
      return NextResponse.json(
        { error: "elevenlabs_signed_url_failed", status: signedUrlRes.status, detail: errText },
        { status: 502 }
      );
    }

    const signedUrlData = await signedUrlRes.json();
    const signedUrl = signedUrlData?.signed_url || "";

    if (!signedUrl) {
      return NextResponse.json(
        { error: "elevenlabs_empty_signed_url" },
        { status: 502 }
      );
    }

    return NextResponse.json({ signedUrl, agentId: AGENT_ID });
  } catch (e) {
    console.error("[voice/signed-url] Error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to get signed URL" },
      { status: 500 }
    );
  }
}
