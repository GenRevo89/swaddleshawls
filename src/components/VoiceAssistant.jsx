"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { buildConciergePrompt, buildLanguageTimeInjection } from "@/lib/voiceAgent/conciergePrompt";

// ── Fuzzy product matching ──
function fuzzyMatch(products, query) {
  if (!query || !products?.length) return null;
  const q = String(query).toLowerCase().trim();
  let match = products.find((p) => String(p.name || "").toLowerCase() === q);
  if (match) return match;
  match = products.find((p) => String(p.name || "").toLowerCase().includes(q));
  if (match) return match;
  match = products.find((p) => q.includes(String(p.name || "").toLowerCase()));
  if (match) return match;
  const queryWords = q.split(/\s+/).filter((w) => w.length > 2);
  if (queryWords.length > 0) {
    match = products.find((p) => {
      const name = String(p.name || "").toLowerCase();
      return queryWords.some((word) => name.includes(word));
    });
  }
  return match || null;
}

// ── Canvas Background Visualizer ──
function VoiceVisualizer({ active, micLevel, agentLevel }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const fadeRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const targetFade = active ? 1 : 0;
      fadeRef.current += (targetFade - fadeRef.current) * 0.04;
      const fade = fadeRef.current;

      if (fade < 0.005) {
        ctx.clearRect(0, 0, W, H);
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, W, H);

      // Background gradient overlay (bolder)
      const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.9);
      bgGrad.addColorStop(0, `rgba(42, 112, 112, ${0.15 * fade})`);
      bgGrad.addColorStop(0.5, `rgba(29, 78, 78, ${0.1 * fade})`);
      bgGrad.addColorStop(1, `rgba(26, 69, 68, ${0.05 * fade})`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const level = Math.max(micLevel || 0, agentLevel || 0);
      const isAgent = (agentLevel || 0) > (micLevel || 0);
      phaseRef.current += 0.02 + level * 0.08;

      // ── Waveform stemming from the bottom edge ──
      const waveCount = 5;
      const baseHeight = H;
      
      for (let w = 0; w < waveCount; w++) {
        // Amplitude grows massively when audio level spikes (bolder and higher)
        const amplitude = (150 + level * 500) * fade * (1 - w * 0.15);
        const freq = 0.0015 + w * 0.0005;
        const phaseShift = w * 1.5;
        const alpha = (0.4 + level * 0.6) * fade * (1 - w * 0.15);

        ctx.beginPath();
        ctx.moveTo(0, H);
        
        for (let x = 0; x <= W; x += 5) {
          const wave1 = Math.sin(x * freq + phaseRef.current + phaseShift);
          const wave2 = Math.sin(x * freq * 2.1 - phaseRef.current * 1.2 + phaseShift);
          const wave3 = Math.sin(x * freq * 0.5 + phaseRef.current * 0.8);
          
          // Map sine combined waves (-1 to 1 roughly) to a positive height offset
          const combined = wave1 * 0.6 + wave2 * 0.3 + wave3 * 0.1;
          const y = baseHeight - ((combined + 1.2) * amplitude * 0.6) - (40 * fade);
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(W, H);
        ctx.closePath();

        const wGrad = ctx.createLinearGradient(0, H - amplitude * 3, 0, H);
        if (isAgent) {
          wGrad.addColorStop(0, `rgba(61, 152, 149, ${alpha * 1.2})`); // Bolder teal
          wGrad.addColorStop(0.5, `rgba(42, 112, 112, ${alpha * 0.8})`);
          wGrad.addColorStop(1, `rgba(26, 69, 68, ${alpha * 0.3})`);
        } else {
          wGrad.addColorStop(0, `rgba(219, 181, 92, ${alpha * 1.2})`); // Bolder secondary/gold
          wGrad.addColorStop(0.5, `rgba(200, 150, 70, ${alpha * 0.8})`);
          wGrad.addColorStop(1, `rgba(180, 120, 50, ${alpha * 0.3})`);
        }
        ctx.fillStyle = wGrad;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active, micLevel, agentLevel]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 1, mixBlendMode: "normal" }}
    />
  );
}

import agentInventory from "@/data/agent-inventory.json";

// ── Inner Component (Requires Provider) ──
function VoiceAssistantInner({ agentAddToCart, agentRemoveFromCart, onAgentViewProduct, onAgentCloseModal, onAgentOpenCart, onAgentCloseCart, onAgentSetSize, cart = [], cartTotal = 0, appliedCoupon = null }) {
  const [status, setStatus] = useState("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [agentLevel, setAgentLevel] = useState(0);
  const [error, setError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Point users to the agent for the first 6 seconds
    setShowTooltip(true);
    const timer = setTimeout(() => setShowTooltip(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const isListeningRef = useRef(false);
  const rafRef = useRef(null);
  const tooltipTimer = useRef(null);
  
  // Keep stable references to props to prevent clientTools from changing reference
  const propsRef = useRef({ cart, cartTotal, appliedCoupon, agentAddToCart, agentRemoveFromCart, onAgentViewProduct, onAgentCloseModal, onAgentOpenCart, onAgentCloseCart, onAgentSetSize });
  useEffect(() => {
    propsRef.current = { cart, cartTotal, appliedCoupon, agentAddToCart, agentRemoveFromCart, onAgentViewProduct, onAgentCloseModal, onAgentOpenCart, onAgentCloseCart, onAgentSetSize };
  }, [cart, cartTotal, appliedCoupon, agentAddToCart, agentRemoveFromCart, onAgentViewProduct, onAgentCloseModal, onAgentOpenCart, onAgentCloseCart, onAgentSetSize]);

  // ── Client Tools ──
  const clientTools = useMemo(() => ({
    getAllInventory: async () => {
      return JSON.stringify({ ok: true, data: { totalItems: agentInventory.length, items: agentInventory } });
    },
    getAvailableCategories: async () => {
      const categories = [...new Set(agentInventory.map(p => p.category))].filter(Boolean);
      return JSON.stringify({ ok: true, data: { categories } });
    },
    closeProductModal: async () => {
      console.log("[Nani] Executing closeProductModal client tool!");
      if (propsRef.current.onAgentCloseModal) propsRef.current.onAgentCloseModal();
      return JSON.stringify({ ok: true, data: { message: "Product modal closed." } });
    },
    getProductDetails: async (params) => {
      const name = String(params?.name || params?.product_name || "");
      const match = fuzzyMatch(agentInventory, name);
      if (!match) return JSON.stringify({ ok: false, error: `Could not find product matching "${name}"` });
      if (propsRef.current.onAgentViewProduct) propsRef.current.onAgentViewProduct(match.sku);
      return JSON.stringify({ ok: true, data: { product: match } });
    },
    setProductSize: async (params) => {
      const sizeParam = params?.size;
      if (sizeParam && propsRef.current.onAgentSetSize) {
        propsRef.current.onAgentSetSize(sizeParam);
        return JSON.stringify({ ok: true, data: { message: `Size set to ${sizeParam}` } });
      }
      return JSON.stringify({ ok: false, error: "Size parameter is required" });
    },
    suggestProducts: async (params) => {
      const useCase = String(params?.useCase || params?.use_case || "").toLowerCase();
      const category = String(params?.category || "").toLowerCase();
      let filtered = agentInventory;
      if (category) {
        filtered = filtered.filter((p) => String(p.category).toLowerCase().includes(category));
      }
      if (useCase) {
        const words = useCase.split(/\s+/).filter(w => w.length > 2);
        filtered = filtered.map((p) => {
          const text = `${p.name} ${p.description} ${p.category} ${(p.tags || []).join(" ")}`.toLowerCase();
          const score = words.reduce((acc, word) => acc + (text.includes(word) ? 1 : 0), 0);
          return { p, score };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(x => x.p);
      }
      if (!useCase && !category) {
        filtered = agentInventory;
      }
      return JSON.stringify({ ok: true, data: { suggestions: filtered, count: filtered.length } });
    },
    addToCart: async (params) => {
      const name = String(params?.name || params?.product_name || "");
      const qty = Math.max(1, Number(params?.qty || params?.quantity || 1));
      const sizeParam = params?.size;
      const match = fuzzyMatch(agentInventory, name);
      if (!match) return JSON.stringify({ ok: false, error: `No product found matching "${name}"` });
      
      const rawModifiers = [];
      if (sizeParam && match.modifierGroups) {
        const sizeGroup = match.modifierGroups.find(g => g.name?.toLowerCase().includes("size") || g.title?.toLowerCase().includes("size"));
        if (sizeGroup && sizeGroup.modifiers) {
          const sizeMatch = sizeGroup.modifiers.find(m => m.name?.toLowerCase() === sizeParam.toLowerCase());
          if (sizeMatch) rawModifiers.push(sizeMatch);
        }
      }
      
      const modifiersPrice = rawModifiers.reduce((sum, mod) => sum + (mod.priceAdjustment || 0), 0);
      const itemPrice = Number(match.price) + modifiersPrice;

      try { 
        if (propsRef.current.agentAddToCart) propsRef.current.agentAddToCart(match.sku, qty, rawModifiers); 
        if (propsRef.current.onAgentCloseModal) propsRef.current.onAgentCloseModal();
      } catch (e) { return JSON.stringify({ ok: false, error: e?.message || "Failed to add" }); }
      
      return JSON.stringify({ 
        ok: true, 
        data: { 
          added: { name: match.name, qty, size: sizeParam || null, price: itemPrice }, 
          message: `Successfully added ${qty}x ${match.name} to the cart. The price before discounts is $${itemPrice.toFixed(2)} each.`
        } 
      });
    },
    removeFromCart: async (params) => {
      const name = String(params?.name || params?.product_name || "");
      const match = fuzzyMatch(agentInventory, name);
      if (!match) return JSON.stringify({ ok: false, error: `No product found matching "${name}"` });
      
      const itemInCart = propsRef.current.cart.find(it => it.sku === match.sku);
      if (!itemInCart) return JSON.stringify({ ok: false, error: `Product "${match.name}" is not in the cart.` });

      try { 
        if (propsRef.current.agentRemoveFromCart) propsRef.current.agentRemoveFromCart(match.sku); 
      } catch (e) { return JSON.stringify({ ok: false, error: e?.message || "Failed to remove" }); }
      
      return JSON.stringify({ 
        ok: true, 
        data: { 
          removed: { name: match.name }, 
          message: `Successfully removed ${match.name} from the cart.`
        } 
      });
    },
    getCartSummary: async () => {
      const items = propsRef.current.cart.map((item) => {
        const mods = item.modifiers && item.modifiers.length > 0 ? ` [${item.modifiers.map(m => m.name).join(', ')}]` : "";
        return { name: item.name + mods, qty: item.quantity };
      });
      return JSON.stringify({ 
        ok: true, 
        data: { 
          items, 
          cartTotal: propsRef.current.cartTotal, 
          itemCount: items.length,
          discountApplied: propsRef.current.appliedCoupon ? propsRef.current.appliedCoupon.name : null
        } 
      });
    },
    openCart: async () => {
      if (propsRef.current.onAgentOpenCart) propsRef.current.onAgentOpenCart();
      return JSON.stringify({ ok: true, data: { message: "Cart opened." } });
    },
    closeCart: async () => {
      if (propsRef.current.onAgentCloseCart) propsRef.current.onAgentCloseCart();
      return JSON.stringify({ ok: true, data: { message: "Cart closed." } });
    },
    changeLanguage: async (params) => {
      const language = String(params?.language || "").toLowerCase().trim();
      if (!language) return JSON.stringify({ ok: false, error: "missing_language_code" });
      try {
        const res = await fetch("/api/voice/language", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language }) });
        const json = await res.json();
        if (!res.ok) return JSON.stringify({ ok: false, error: json?.error || "language_change_failed" });
        setTimeout(() => { handleStop(); setTimeout(() => handleStart(), 1000); }, 2000);
        return JSON.stringify({ ok: true, data: { language: json?.language, languageName: json?.languageName, message: json?.message || `Language switched to ${json?.languageName}. Restarting...` } });
      } catch (e) { return JSON.stringify({ ok: false, error: e?.message || "language_change_failed" }); }
    },
    showNewsletterSignup: async () => {
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("swaddleshawls:show-welcome"));
      return JSON.stringify({ ok: true, data: { message: "I've opened the newsletter signup! Sign up for a 10% welcome discount code (NWSLTR-10)." } });
    },
  }), []);

  // ── ElevenLabs Conversation ──
  const conversation = useConversation({
    clientTools,
    onConnect: () => { setStatus("listening"); },
    onDisconnect: () => { setStatus("idle"); isListeningRef.current = false; },
    onError: (message) => { setError(typeof message === "string" ? message : "Voice agent error"); setStatus("error"); },
    onModeChange: ({ mode }) => { console.info("[Nani] Mode:", mode); },
  });

  // ── Audio Level Polling ──
  useEffect(() => {
    if (status !== "listening") {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      setMicLevel(0); setAgentLevel(0);
      return;
    }
    const poll = () => {
      if (!isListeningRef.current) return;
      try {
        setMicLevel(Math.min(1, Math.max(0, conversation.getInputVolume?.() ?? 0)));
        setAgentLevel(Math.min(1, Math.max(0, conversation.getOutputVolume?.() ?? 0)));
      } catch {}
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [status, conversation]);

  // ── Start / Stop / Mute ──
  const handleStart = useCallback(async () => {
    if (status === "connecting" || status === "listening") return;
    setError(null); setStatus("connecting");
    try { const AudioCtx = window.AudioContext || window.webkitAudioContext; if (AudioCtx) { const ctx = new AudioCtx(); ctx.resume().catch(() => {}); } } catch {}
    try {
      const basePrompt = buildConciergePrompt();
      const langInfo = buildLanguageTimeInjection();
      const fullPrompt = `${basePrompt}\n\n${langInfo.instruction}`;
      const res = await fetch("/api/voice/signed-url", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.signedUrl) throw new Error(json?.error || "Failed to get voice session");
      await conversation.startSession({
        signedUrl: json.signedUrl,
      });
      isListeningRef.current = true; setIsMuted(false);
      try { conversation.setVolume?.({ volume: 1 }); } catch {}
    } catch (e) {
      console.error("[Nani] Start error:", e);
      setError(e?.message || "Failed to start voice"); setStatus("error");
      try { await conversation.endSession(); } catch {}
    }
  }, [status, conversation]);

  const handleStop = useCallback(() => {
    try { conversation.endSession(); } catch {}
    setStatus("idle"); isListeningRef.current = false; setMicLevel(0); setAgentLevel(0);
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, [conversation]);

  const handleToggleMute = useCallback(() => {
    const next = !isMuted; setIsMuted(next);
    try { conversation.setVolume?.({ volume: next ? 0 : 1 }); } catch {}
  }, [isMuted, conversation]);

  const handleClick = useCallback(async () => {
    if (status === "connecting") return;
    if (status === "idle" || status === "error") await handleStart();
    else if (status === "listening") handleToggleMute();
  }, [status, handleStart, handleToggleMute]);

  useEffect(() => { return () => { handleStop(); }; }, []); // eslint-disable-line

  // ── Tooltip ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("ss_voice_tooltip_shown")) return;
    tooltipTimer.current = setTimeout(() => {
      setShowTooltip(true);
      sessionStorage.setItem("ss_voice_tooltip_shown", "1");
      setTimeout(() => setShowTooltip(false), 5000);
    }, 3000);
    return () => clearTimeout(tooltipTimer.current);
  }, []);

  const isActive = status === "listening";
  const isConnecting = status === "connecting";
  const dominantLevel = Math.max(micLevel, agentLevel);
  const isAgentSpeaking = agentLevel > micLevel && agentLevel > 0.02;

  return (
    <>
      <VoiceVisualizer active={isActive} micLevel={micLevel} agentLevel={agentLevel} />

      {/* Tooltip */}
      {showTooltip && status === "idle" && (
        <div className="fixed z-[9998] pointer-events-none" style={{ bottom: "6.5rem", left: "2rem" }}>
          <div className="px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg" style={{ backgroundColor: "var(--brown-800)", color: "var(--warm-cream)", fontFamily: "var(--font-heading)", animation: "fadeInUp 0.3s ease-out" }}>
            <span className="mr-1.5">✦</span>Ask Nani — your personal shopping guide
            <div className="absolute -bottom-1.5 left-6 w-3 h-3 rotate-45" style={{ backgroundColor: "var(--brown-800)" }} />
          </div>
        </div>
      )}

      {/* Voice Orb */}
      <button
        id="voice-assistant-btn"
        onClick={handleClick}
        onMouseEnter={() => !isActive && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={isActive ? (isMuted ? "Unmute Nani" : "Mute Nani") : "Talk to Nani"}
        className="fixed z-[9998] flex items-center justify-center transition-all duration-300"
        style={{
          bottom: "2rem", left: "2rem",
          width: isActive ? "72px" : "60px", height: isActive ? "72px" : "60px",
          borderRadius: "9999px",
          background: isActive
            ? isAgentSpeaking
              ? "linear-gradient(135deg, var(--henna-400), #D4A373, var(--henna-600))"
              : "linear-gradient(135deg, var(--henna-500), var(--terra-500))"
            : "linear-gradient(135deg, var(--brown-700), var(--brown-800))",
          boxShadow: isActive
            ? `0 0 ${20 + dominantLevel * 30}px rgba(42, 112, 112, ${0.3 + dominantLevel * 0.4}), 0 8px 32px rgba(0,0,0,0.3)`
            : "0 4px 20px rgba(0,0,0,0.25)",
          border: isActive ? "2px solid rgba(109, 184, 182, 0.4)" : "2px solid rgba(255,255,255,0.15)",
          transform: isActive ? `scale(${1 + dominantLevel * 0.08})` : "scale(1)",
        }}
      >
        {isConnecting && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        )}
        {!isConnecting && (
          <svg style={{ width: isActive ? "26px" : "22px", height: isActive ? "26px" : "22px", color: "white", opacity: isMuted ? 0.5 : 1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMuted && isActive ? (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 19L5 5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16.95A7 7 0 015 12m14 0a7 7 0 01-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="23" x2="16" y2="23" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="23" x2="16" y2="23" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        )}
        {isActive && !isConnecting && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: "var(--henna-400)", opacity: 0.15 + dominantLevel * 0.15, animationDuration: "2s" }} />
            <span className="absolute rounded-full" style={{ inset: "-4px", border: "1px solid rgba(42, 112, 112, 0.3)", borderRadius: "9999px", animation: "pulse 2.5s ease-in-out infinite" }} />
          </>
        )}
      </button>

      {/* Stop button */}
      {isActive && (
        <button
          onClick={(e) => { e.stopPropagation(); handleStop(); }}
          aria-label="Stop Nani"
          className="fixed z-[9999] flex items-center justify-center rounded-full bg-white shadow-lg transition-all duration-200 hover:scale-110"
          style={{ bottom: "5.5rem", left: "4.5rem", width: "24px", height: "24px", border: "1px solid var(--brown-200)" }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--henna-600)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Error indicator */}
      {error && status === "error" && (
        <div className="fixed z-[9998] px-3 py-2 rounded-lg text-xs font-medium shadow-lg" style={{ bottom: "6.5rem", left: "2rem", backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", maxWidth: "220px" }}>
          {error}
          <button onClick={() => { setError(null); setStatus("idle"); }} className="ml-2 underline">Dismiss</button>
        </div>
      )}
    </>
  );
}

// ── Export wrapper that provides the context ──
export default function VoiceAssistant({ agentAddToCart, agentRemoveFromCart, onAgentViewProduct, onAgentCloseModal, onAgentOpenCart, onAgentCloseCart, onAgentSetSize, cart, cartTotal, appliedCoupon }) {
  return (
    <ConversationProvider>
      <VoiceAssistantInner agentAddToCart={agentAddToCart} agentRemoveFromCart={agentRemoveFromCart} onAgentViewProduct={onAgentViewProduct} onAgentCloseModal={onAgentCloseModal} onAgentOpenCart={onAgentOpenCart} onAgentCloseCart={onAgentCloseCart} onAgentSetSize={onAgentSetSize} cart={cart} cartTotal={cartTotal} appliedCoupon={appliedCoupon} />
    </ConversationProvider>
  );
}
