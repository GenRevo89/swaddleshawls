"use client";
import React, { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Default icon for products without images
function ProductIcon() {
  return (
    <svg className="h-24 w-24 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
    </svg>
  );
}

// CRM Contact Form — imported as shared component
import CrmContactForm from "@/components/CrmContactForm";
import VoiceAssistant from "@/components/VoiceAssistant";
import CartAbandonmentModal from "@/components/CartAbandonmentModal";
import SocialProofTicker from "@/components/SocialProofTicker";

const isPreorder = process.env.NEXT_PUBLIC_PREORDER === "TRUE";

// ── Social Proof: Bestseller SKUs & Seeded Review Data ──
const BESTSELLER_SKUS = new Set(["VSS-001", "HFS-001", "GLS-001"]);

// Mulberry32 PRNG for deterministic review counts
function _m32(s) { return function() { let t = s += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const _rng = _m32(42); // Fixed seed so counts are stable across renders
const REVIEW_DATA = {};
[
  "LPS-001","WNC-001","BRH-001","DNQ3P5HA6","SC55JFH9Z","RK4RWVUTL","EPU39F8P3",
  "MMS-001","GLS-001","EFW-001","MBS-001","DSH-001","JPP-001","KMB-001",
  "RPP-001","GSS-001","KVR-001","HFS-001","VSS-001","JLS-001","GLR-001","HNC-001"
].forEach(sku => {
  REVIEW_DATA[sku] = {
    count: Math.floor(_rng() * 67) + 23, // 23–89
    rating: Math.round((4.8 + _rng() * 0.2) * 10) / 10, // 4.8–5.0
  };
});

// ── localStorage cart helpers ──
const CART_STORAGE_KEY = "ss_cart";
const CART_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function saveCartToStorage(cart) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ cart, ts: Date.now() }));
    }
  } catch {}
}

function loadCartFromStorage() {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const { cart, ts } = JSON.parse(raw);
    if (Date.now() - ts > CART_MAX_AGE_MS) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }
    return Array.isArray(cart) && cart.length > 0 ? cart : null;
  } catch { return null; }
}

function clearCartStorage() {
  try { if (typeof window !== "undefined") localStorage.removeItem(CART_STORAGE_KEY); } catch {}
}

// ── Helpers for Product Detail Modal ──

// Keys to never show in the attribute table
const HIDDEN_ATTRS = new Set(["analytics", "id", "_id", "images", "image", "slug", "sku", "createdAt", "updatedAt", "__v"]);

// Format "CARE_INSTRUCTIONS" → "Care Instructions"
function formatAttrKey(key) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// Check if a value is displayable (not an object/array)
function isDisplayable(val) {
  return val !== null && val !== undefined && typeof val !== "object";
}

// ── Product Detail Modal ──
function ProductDetailModal({ product, onClose, onAddToCart, addedItem, agentDrivingMode, agentSelectedSize }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const pid = product._id || product.id;

  useEffect(() => {
    if (product?.modifierGroups) {
      if (agentSelectedSize) {
        const sizeGroup = product.modifierGroups.find(g => g.name?.toLowerCase().includes("size") || g.title?.toLowerCase().includes("size"));
        if (sizeGroup) {
          const match = sizeGroup.modifiers.find(m => m.name?.toLowerCase() === agentSelectedSize.toLowerCase());
          if (match) {
            setSelectedModifiers(prev => ({ ...prev, [sizeGroup.id]: match }));
            return;
          }
        }
      }
      const initial = {};
      product.modifierGroups.forEach(mg => {
        if (mg.modifiers && mg.modifiers.length > 0) {
          initial[mg.id] = mg.modifiers.slice().sort((a, b) => a.sortOrder - b.sortOrder)[0];
        }
      });
      setSelectedModifiers(initial);
    }
  }, [product, agentSelectedSize]);

  const basePrice = Number(product.price);
  const modifiersPrice = Object.values(selectedModifiers).reduce((sum, mod) => sum + (mod.priceAdjustment || 0), 0);
  const currentTotal = basePrice + modifiersPrice;

  // Gather all available images (deduplicated)
  const allImages = [];
  if (product.image) allImages.push(product.image);
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img && !allImages.includes(img)) allImages.push(img);
    });
  }

  // Extract care instructions from attributes if present
  const attrs = product.attributes || {};
  const careInstructions = attrs.CARE_INSTRUCTIONS || attrs.care_instructions || attrs.careInstructions || null;

  // Filter displayable attributes
  const displayAttrs = Object.entries(attrs).filter(
    ([key, val]) => !HIDDEN_ATTRS.has(key) && !HIDDEN_ATTRS.has(key.toLowerCase())
      && !key.toLowerCase().includes("care_instruction")
      && !key.toLowerCase().includes("careinstructions")
      && isDisplayable(val)
      && String(val).trim() !== ""
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && activeImageIndex > 0) setActiveImageIndex(activeImageIndex - 1);
      if (e.key === "ArrowRight" && activeImageIndex < allImages.length - 1) setActiveImageIndex(activeImageIndex + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, activeImageIndex, allImages.length]);

  // Master Sales Person Auto-Rotate
  useEffect(() => {
    if (!agentDrivingMode || allImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3500); // Rotate every 3.5 seconds
    return () => clearInterval(interval);
  }, [agentDrivingMode, allImages.length]);

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: allImages.length > 0 ? allImages : ["https://swaddleshawls.com/SwaddleShawlsLogo.png"],
    description: product.description || "Handcrafted with care using 100% pure cotton. Every piece comes with a Certificate of Authenticity.",
    sku: product.sku || product._id || product.id,
    brand: {
      "@type": "Brand",
      "name": "SwaddleShawls"
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: isPreorder ? (currentTotal * 0.9).toFixed(2) : currentTotal.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all"
        style={{ zIndex: 10200 }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 md:p-8" style={{ zIndex: 10201 }}>
        <div
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden payment-modal-enter"
          style={{ maxHeight: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--brown-600)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <div className="grid md:grid-cols-2 max-h-[90vh] overflow-y-auto">
            {/* Image Gallery Side */}
            <div className="p-6 md:p-8 flex flex-col relative" style={{ backgroundColor: "var(--brown-50)" }}>
              {isPreorder && (
                <div className="absolute top-10 left-10 z-[15] px-3 py-1 rounded-md text-xs font-bold uppercase shadow-lg tracking-wider" style={{ backgroundColor: "var(--henna-500)", color: "white" }}>
                  10% Off Launch Special
                </div>
              )}
              {/* Main Image */}
              <div className="aspect-square rounded-xl overflow-hidden" style={{ backgroundColor: "var(--brown-100)" }}>
                {allImages.length > 0 ? (
                  <img
                    src={allImages[activeImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--brown-300)" }}>
                    <ProductIcon />
                  </div>
                )}
              </div>

              {/* Thumbnail Strip — only when multiple images */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pt-4 pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200"
                      style={{
                        borderColor: idx === activeImageIndex ? "var(--henna-500)" : "var(--brown-200)",
                        opacity: idx === activeImageIndex ? 1 : 0.6,
                      }}
                    >
                      <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Side */}
            <div className="p-6 md:p-8 flex flex-col overflow-y-auto">
              <div className="uppercase text-xs font-bold tracking-wider mb-3" style={{ color: "var(--henna-500)" }}>
                {product.category || "Swaddle"}
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                {product.name}
              </h2>

              <div className="text-3xl font-bold mb-5 flex items-center gap-3" style={{ color: "var(--brown-800)" }}>
                {isPreorder ? (
                  <div className="flex flex-col">
                    <span className="text-base line-through text-opacity-60" style={{ color: "var(--brown-400)" }}>${currentTotal.toFixed(2)}</span>
                    <span style={{ color: "var(--henna-600)" }}>${(currentTotal * 0.9).toFixed(2)}</span>
                  </div>
                ) : (
                  <span>${currentTotal.toFixed(2)}</span>
                )}
                {modifiersPrice > 0 && <span className="text-sm font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Includes +${modifiersPrice.toFixed(2)} options</span>}
              </div>

              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--brown-500)" }}>
                {product.description || "Handcrafted with care using 100% pure cotton. Every piece comes with a Certificate of Authenticity."}
              </p>

              {/* Clean attributes (only displayable, non-internal ones) */}
              {displayAttrs.length > 0 && (
                <div className="mb-5 rounded-lg p-4 space-y-2" style={{ backgroundColor: "var(--brown-50)", border: "1px solid var(--brown-100)" }}>
                  {displayAttrs.map(([key, value]) => (
                    <div key={key} className="flex text-sm gap-3">
                      <span className="font-bold text-xs shrink-0 pt-0.5" style={{ color: "var(--brown-400)" }}>{formatAttrKey(key)}</span>
                      <span style={{ color: "var(--brown-600)" }}>{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Modifier Groups UI */}
              {product.modifierGroups && product.modifierGroups.length > 0 && (
                <div className="mb-5 space-y-4">
                  {product.modifierGroups.slice().sort((a, b) => a.sortOrder - b.sortOrder).map(mg => (
                    <div key={mg.id} className="rounded-xl p-4" style={{ backgroundColor: "var(--brown-50)", border: "1px solid var(--brown-100)" }}>
                      <div className="text-sm font-bold mb-3 uppercase tracking-wider flex items-center justify-between" style={{ color: "var(--brown-700)" }}>
                        <span>{mg.name} {mg.required && <span className="text-red-500 ml-1">*</span>}</span>
                      </div>
                      <div className="space-y-2">
                        {mg.modifiers.slice().sort((a, b) => a.sortOrder - b.sortOrder).map(mod => (
                          <label key={mod.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name={mg.id}
                              value={mod.id}
                              checked={selectedModifiers[mg.id]?.id === mod.id}
                              onChange={() => setSelectedModifiers(prev => ({ ...prev, [mg.id]: mod }))}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="text-sm font-medium transition-colors group-hover:text-black" style={{ color: "var(--brown-800)" }}>
                              {mod.name}
                              {mod.priceAdjustment > 0 && <span className="ml-2 text-xs font-semibold" style={{ color: "var(--brown-500)" }}>(+${mod.priceAdjustment.toFixed(2)})</span>}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Care Instructions — dedicated callout */}
              {careInstructions && (
                <div className="mb-5 rounded-lg p-4 flex gap-3" style={{ backgroundColor: "var(--henna-50)", border: "1px solid var(--henna-100)" }}>
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--henna-500)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--henna-600)" }}>Care Instructions</div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--henna-700)" }}>{careInstructions}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "var(--brown-50)", color: "var(--brown-500)", border: "1px solid var(--brown-200)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Trust badges */}
              <div className="border-t pt-4 mb-5 space-y-2" style={{ borderColor: "var(--brown-100)" }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--brown-400)" }}>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--henna-500)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  100% Pure Cotton
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--brown-400)" }}>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--henna-500)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Certificate of Authenticity Included
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--brown-400)" }}>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--henna-500)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Gift-Ready Packaging
                </div>
              </div>

              <button
                onClick={() => onAddToCart(product, Object.values(selectedModifiers))}
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-300 shadow-lg ${addedItem === pid
                  ? "bg-emerald-600 text-white scale-[0.98]"
                  : "text-white hover:-translate-y-0.5"
                  }`}
                style={addedItem !== pid ? { backgroundColor: "var(--brown-800)" } : {}}
              >
                {addedItem === pid ? "✓ Added to Cart" : `Add to Cart — $${(isPreorder ? currentTotal * 0.9 : currentTotal).toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


// ── Payment Modal ── Embeds BasaltSurge portal in an iframe
function PaymentModal({ receiptId, paymentUrl, onSuccess, onCancel }) {
  const [iframeHeight, setIframeHeight] = useState(600);
  const [paymentDone, setPaymentDone] = useState(false);

  useEffect(() => {
    function handleMessage(event) {
      // Only trust messages from BasaltSurge
      if (event.origin !== "https://surge.basalthq.com") return;

      switch (event.data?.type) {
        case "gateway-preferred-height":
          setIframeHeight(event.data.height);
          break;
        case "gateway-card-success":
          setPaymentDone(true);
          // Poll status to confirm, then notify parent
          pollPaymentStatus(event.data.receiptId || receiptId).then(() => {
            onSuccess(event.data.receiptId || receiptId);
          });
          break;
        case "gateway-card-cancel":
          onCancel();
          break;
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [receiptId, onSuccess, onCancel]);

  async function pollPaymentStatus(rid) {
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(`/api/receipts/status?receiptId=${encodeURIComponent(rid)}`);
        const data = await res.json();
        if (data.status === "paid" || data.status === "completed") return;
      } catch { /* keep polling */ }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (paymentDone) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" style={{ zIndex: 10100 }}></div>
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 10101 }}>
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm mx-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Processing...</h3>
            <p className="text-slate-500 text-sm">Confirming your payment. This won&#39;t take long.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ zIndex: 10100 }}
        onClick={onCancel}
      ></div>
      <div className="fixed inset-0 flex items-center justify-center p-4 lg:p-8" style={{ zIndex: 10101 }}>
        <div className="relative w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden payment-modal-enter transition-all duration-300">

          <iframe
            src={paymentUrl}
            width="100%"
            height={iframeHeight}
            frameBorder="0"
            title="BasaltSurge Payment"
            allow="payment; clipboard-write"
            style={{ border: "none", display: "block" }}
          />
        </div>
      </div>
    </>
  );
}

function getProductColor(sku) {
  const colors = {
    "LPS-001": "160, 90, 180",  // Bold Lavender (Tartan)
    "VSS-001": "240, 140, 100", // Peach/Terracotta (Heritage Paisley)
    "HFS-001": "20, 60, 120",   // Navy (Snowflake)
    "KVR-001": "130, 40, 60",   // Plum Burgundy (Floral Vine)
    "GSS-001": "200, 130, 60",  // Mustard Rust (Sunrise)
    "RPP-001": "110, 40, 130",  // Peacock Purple (Peacock)
    "KMB-001": "100, 180, 80",  // Vibrant Green (Monstera)
    "JPP-001": "200, 40, 120",  // Fuchsia (Peony)
    "BRH-001": "170, 50, 40",   // Brick Red (Agra Henna)
    "WNC-001": "200, 80, 70",   // Terracotta Red (Bindi Dots)
    "HNC-001": "20, 80, 160",   // Indigo Blue (Heritage Nursing Cover)
    "DSH-001": "190, 110, 60",  // Warm Tan (Tribal)
    "MBS-001": "230, 120, 20",  // Marigold Orange (Floral)
    "EFW-001": "10, 90, 50",    // Emerald Green (Gold Floral)
    "GLS-001": "230, 160, 40",  // Mustard Yellow (Lotus)
    "MMS-001": "40, 80, 140",   // Deep Blue (Rain/Stars)
    "EPU39F8P3": "120, 100, 80", // Brown Linen
    "RK4RWVUTL": "20, 120, 140", // Teal Border
    "SC55JFH9Z": "220, 100, 30", // Orange Paisley
    "DNQ3P5HA6": "180, 50, 40",  // Red Paisley
  };
  return colors[sku] || "219, 181, 92"; // Default gold
}

function ProductCard({ product, viewProduct, isPreorder, addedItem, addToCart }) {
  const pid = product._id || product.id;
  const color = getProductColor(product.sku);
  const isBestseller = BESTSELLER_SKUS.has(product.sku);
  const review = REVIEW_DATA[product.sku];

  return (
    <div
      className="group relative rounded-2xl flex flex-col cursor-pointer transition-all duration-500 shadow-md hover:shadow-xl hover:-translate-y-1"
      onClick={() => viewProduct(product)}
      style={{ "--card-color": color || "219, 181, 92" }}
    >
      {/* Animated Glowing Border */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none opacity-60 md:opacity-40 group-hover:opacity-100 transition-opacity duration-700">
        <div
          className="absolute inset-[-50%] animate-[spin_4s_linear_infinite]"
          style={{ background: `conic-gradient(from 0deg, rgba(var(--card-color), 0.3) 0%, rgba(var(--card-color), 0.3) 75%, rgba(var(--card-color), 1) 90%, rgba(var(--card-color), 0.3) 100%)` }}
        ></div>
      </div>

      {/* Inner Content Wrapper */}
      <div className="relative z-10 m-[2px] bg-white rounded-[14px] overflow-hidden flex flex-col h-full flex-grow">
        {isPreorder && (
          <div className="absolute top-3 left-3 z-[15] px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-md tracking-wider" style={{ backgroundColor: "var(--henna-500)", color: "white" }}>
            10% Off Launch Special
          </div>
        )}
        {isBestseller && (
          <div className="absolute top-3 right-3 z-[15] px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-md tracking-wider flex items-center gap-1" style={{ background: "linear-gradient(135deg, #dbb55c, #c49a2a)", color: "white" }}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Bestseller
          </div>
        )}
        {/* 1:1 Square Image */}
        <div className="aspect-square overflow-hidden relative" style={{ backgroundColor: "var(--brown-50)" }}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transform scale-[1.08] group-hover:scale-[1.15] transition-transform duration-1000"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--brown-300)" }}>
              <ProductIcon />
            </div>
          )}

          {/* Hover overlay with "View Details" */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
            <span className="px-5 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold shadow-lg translate-y-3 group-hover:translate-y-0 transition-transform duration-500"
              style={{ color: "var(--brown-800)" }}>
              {isPreorder ? "Launch Special" : "View Details"}
            </span>
          </div>

          {/* Image count badge */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-bold flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {product.images.length}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="uppercase text-[10px] font-bold tracking-wider mb-1.5" style={{ color: "var(--henna-500)" }}>
            {product.category || "Swaddle"}
          </div>
          <h3 className="text-base font-bold mb-1"
            style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
            {product.name}
          </h3>
          {review && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="flex items-center" style={{ color: "#dbb55c" }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <span className="text-[10px] font-medium" style={{ color: "var(--brown-400)" }}>
                {review.rating} ({review.count})
              </span>
            </div>
          )}
          <p className="text-xs mb-4 flex-grow line-clamp-2" style={{ color: "var(--brown-400)" }}>
            {product.description}
          </p>
          <div className="flex flex-col xl:flex-row xl:items-center justify-between mt-auto gap-3 pt-2">
            <div className="flex flex-col items-start mt-auto">
              {isPreorder ? (
                <>
                  <span className="text-xs line-through text-opacity-60" style={{ color: "var(--brown-400)" }}>
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-xl font-bold" style={{ color: "var(--henna-600)" }}>
                    ${(Number(product.price) * 0.9).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold" style={{ color: "var(--brown-800)" }}>
                  ${Number(product.price).toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const hasRequredModifiers = product.modifierGroups && product.modifierGroups.some(mg => mg.required);
                if (hasRequredModifiers) {
                  viewProduct(product);
                } else {
                  addToCart(product);
                }
              }}
              className={`w-full xl:w-auto btn-primary px-4 py-2.5 text-[11px] transition-all duration-300 ${addedItem === pid
                ? "!bg-emerald-600 scale-95"
                : ""
                }`}
            >
              {addedItem === pid ? "✓ Added" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [cart, setCart] = useState([]);
  const [cartRestoredFromStorage, setCartRestoredFromStorage] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", couponCode: "" });
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [addedItem, setAddedItem] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null); // Product detail modal
  const [agentDrivingMode, setAgentDrivingMode] = useState(false); // Master Sales Person Mode
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState(null); // Embedded checkout
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [agentSelectedSize, setAgentSelectedSize] = useState(null);
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  // ── Close Cart with Abandonment Intercept ──
  const closeCart = useCallback(() => {
    if (checkoutMode && cart.length > 0) {
      // Only show once per session
      if (typeof window !== "undefined" && !sessionStorage.getItem("ss_abandon_shown")) {
        sessionStorage.setItem("ss_abandon_shown", "1");
        setCartOpen(false);
        setCheckoutMode(false);
        setShowAbandonModal(true);
        return;
      }
    }
    setCartOpen(false);
    setCheckoutMode(false);
  }, [checkoutMode, cart.length]);

  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    setCouponError("");
    const code = formData.couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "PREORDER-10" || code === "NWSLTR-10") {
      setAppliedCoupon({ code, type: "percent", value: 10, name: "10% Discount" });
    } else {
      setCouponError("Invalid coupon code.");
      setAppliedCoupon(null);
    }
  };

  // ── Handle Stripe success/cancel redirect ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");
    if (payment === "success" && sessionId) {
      setOrderResult({
        orderNumber: "Processing...",
        email: "Your confirmation email is on the way.",
        stripeSessionId: sessionId,
      });

      // Trigger CRM sync via /api/orders/confirm (mirrors Surge flow)
      // The webhook may also fire, but /confirm is idempotent so this is safe
      (async () => {
        try {
          // Retrieve session metadata to get the receiptId
          const res = await fetch(`/api/checkout/stripe/session?session_id=${sessionId}`);
          const data = await res.json();
          if (data?.receiptId) {
            await fetch("/api/orders/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ receiptId: data.receiptId }),
            });
          }
        } catch (e) {
          console.error("Post-Stripe CRM confirm failed:", e);
        }
      })();

      // Clear cart on successful payment
      setCart([]);
      clearCartStorage();
      setStripeClientSecret(null);

      // Clean URL
      window.history.replaceState({}, "", "/shop");
    } else if (payment === "cancelled") {
      window.history.replaceState({}, "", "/shop");
    }
  }, []);

  // ── Restore cart from localStorage on mount ──
  useEffect(() => {
    const saved = loadCartFromStorage();
    if (saved) {
      setCart(saved);
      setCartRestoredFromStorage(true);
    }
  }, []);

  // ── Persist cart to localStorage on every change (skip initial empty) ──
  useEffect(() => {
    if (cart.length > 0) {
      saveCartToStorage(cart);
    } else if (cartRestoredFromStorage) {
      // Cart was cleared (order placed), clean up storage
      clearCartStorage();
    }
  }, [cart, cartRestoredFromStorage]);

  // Wrapper to fire Meta Pixel ViewContent when opening product detail
  const viewProduct = (product) => {
    setSelectedProduct(product);
    try {
      if (typeof window !== "undefined" && window.fbq && product) {
        window.fbq('track', 'ViewContent', {
          content_ids: [product.sku || product._id || product.id],
          content_name: product.name,
          content_type: 'product',
          value: Number(product.price),
          currency: 'USD',
        });
      }
    } catch (e) { console.error('Meta ViewContent failed:', e); }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setProductError("Failed to load products");
        }
      } catch (err) {
        console.error("Failed to load products", err);
        setProductError("Failed to connect to server");
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  const onAgentViewProduct = useCallback((sku) => {
    const product = products.find(p => p.sku === sku);
    if (product) {
      setAgentDrivingMode(true);
      setSelectedProduct(product);
    }
  }, [products]);

  const onAgentCloseModal = useCallback(() => {
    setSelectedProduct(null);
    setAgentDrivingMode(false);
    setAgentSelectedSize(null);
  }, []);

  const addToCart = useCallback((product, rawModifiers = []) => {
    const pid = product._id || product.id;
    // ensure modifiers map strictly to what Surge wants: `{ id, name, priceAdjustment }`
    const modifiers = rawModifiers.map(m => ({ id: m.id, name: m.name, priceAdjustment: m.priceAdjustment || 0 }));

    // create a unique cart signature by sorting modifier IDs
    const modifierHash = modifiers.map(m => m.id).sort().join('_');
    const cartItemId = modifierHash ? `${pid}_${modifierHash}` : pid;

    // calculate total price for this unit
    const modifierPriceTotal = modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0);
    const unitPrice = Number(product.price) + modifierPriceTotal;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        cartItemId,
        productId: pid,
        name: product.name,
        sku: product.sku || product.name,
        price: unitPrice,
        basePrice: Number(product.price),
        quantity: 1,
        modifiers,
        image: product.image
      }];
    });
    setAddedItem(pid);
    setTimeout(() => setAddedItem(null), 1200);
    if (!cartOpen && !selectedProduct) setCartOpen(true);

    // Meta Pixel — AddToCart
    try {
      if (typeof window !== "undefined" && window.fbq) {
        window.fbq('track', 'AddToCart', {
          content_ids: [product.sku || pid],
          content_name: product.name,
          content_type: 'product',
          value: unitPrice,
          currency: 'USD',
        });
      }
    } catch (e) { console.error('Meta AddToCart failed:', e); }

    // Google Ads — Add to Cart conversion
    try {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-18072236543/YdbUCJK-s5gcEP_jwalD',
          'value': unitPrice,
          'currency': 'USD',
        });
      }
    } catch (e) { console.error('GTM add_to_cart failed:', e); }
  }, [cartOpen, selectedProduct]);

  const agentAddToCart = useCallback((sku, qty, rawModifiers = []) => {
    const product = products.find(p => p.sku === sku);
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addToCart(product, rawModifiers);
    }
  }, [products, addToCart]);

  const agentRemoveFromCart = useCallback((sku) => {
    setCart((prev) => prev.filter(item => item.sku !== sku));
  }, []);

  const onAgentOpenCart = useCallback(() => {
    setCartOpen(true);
  }, []);

  const onAgentCloseCart = useCallback(() => {
    setCartOpen(false);
  }, []);

  const onAgentSetSize = useCallback((size) => {
    setAgentSelectedSize(size);
  }, []);

  const updateQuantity = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const baseTotal = cart.reduce((sum, item) => {
    const activePrice = isPreorder ? item.price - (item.price * 0.1) : item.price;
    return sum + activePrice * item.quantity;
  }, 0);

  // Apply active coupon to cartTotal
  let cartTotal = baseTotal;
  if (appliedCoupon && appliedCoupon.type === "percent") {
    cartTotal = Math.round(baseTotal * (1 - appliedCoupon.value / 100) * 100) / 100;
  }

  const surgeTotal = Math.round(cartTotal * 0.95 * 100) / 100; // 5% Surge discount
  const surgeSavings = Math.round((cartTotal - surgeTotal) * 100) / 100;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Shared: build cart items for order submission ──
  const buildOrderItems = ({ surgeDiscount = false } = {}) => {
    return cart.map((item) => {
      const itemModifiers = [...item.modifiers];
      if (isPreorder && !itemModifiers.find(m => m.id === "preorder-discount")) {
        itemModifiers.push({
          id: "preorder-discount",
          groupId: "discount",
          modifierId: "preorder",
          name: "10% Launch Special Discount",
          priceAdjustment: -(item.price * 0.1)
        });
      }
      let unitPrice = isPreorder ? item.price - (item.price * 0.1) : item.price;

      // Apply User Coupon Discount
      if (appliedCoupon && appliedCoupon.type === "percent" && !itemModifiers.find(m => m.id === "user-coupon")) {
        const couponAdj = -(unitPrice * (appliedCoupon.value / 100));
        itemModifiers.push({
          id: "user-coupon",
          groupId: "discount",
          modifierId: appliedCoupon.code,
          name: appliedCoupon.name,
          priceAdjustment: Math.round(couponAdj * 100) / 100,
        });
        unitPrice = Math.round(unitPrice * (1 - appliedCoupon.value / 100) * 100) / 100;
      }

      // Apply 5% Surge discount
      if (surgeDiscount && !itemModifiers.find(m => m.id === "surge-discount")) {
        const surgeAdj = -(unitPrice * 0.05);
        itemModifiers.push({
          id: "surge-discount",
          groupId: "discount",
          modifierId: "surge",
          name: "5% Surge Payment Discount",
          priceAdjustment: Math.round(surgeAdj * 100) / 100,
        });
        unitPrice = Math.round(unitPrice * 0.95 * 100) / 100;
      }

      return {
        productName: item.name,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: unitPrice,
        modifiers: itemModifiers,
        image: item.image,
      };
    });
  };

  // ── Create order in Surge + DB, then open Surge portal ──
  const handleSurgeCheckout = async (e) => {
    e?.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "pending@checkout.local",
          customerName: "Pending Customer",
          couponCode: appliedCoupon?.code || undefined,
          paymentMethod: "surge",
          items: buildOrderItems({ surgeDiscount: true }),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.data.paymentUrl && data.data.receiptId) {
          setPaymentModal({
            receiptId: data.data.receiptId,
            paymentUrl: data.data.paymentUrl,
            orderNumber: data.data.orderNumber,
            email: "pending@checkout.local",
          });
          setCartOpen(false);
          setCheckoutMode(false);
        } else {
          setOrderResult(data.data);
          setCart([]);
          clearCartStorage();
          setCheckoutMode(false);
          setFormData({ ...formData, couponCode: "" });
        }
      } else {
        alert(data.error || "Order failed. Please try again.");
      }
    } catch {
      alert("Failed to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Create order in DB, then redirect to Stripe Checkout ──
  const handleStripeCheckout = async (e) => {
    e?.preventDefault();
    if (cart.length === 0) return;
    setStripeLoading(true);

    try {
      // Step 1: Create the order in Surge + DB so we have a receiptId for reconciliation
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "pending@checkout.local",
          customerName: "Pending Customer",
          couponCode: appliedCoupon?.code || undefined,
          paymentMethod: "stripe",
          items: buildOrderItems(),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        alert(orderData.error || "Order creation failed.");
        setStripeLoading(false);
        return;
      }

      // Step 2: Create Stripe Checkout Session
      const stripeRes = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: undefined,
          customerName: "Pending Customer",
          orderId: orderData.data._id,
          receiptId: orderData.data.receiptId || "",
          couponCode: appliedCoupon?.code || undefined,
          items: buildOrderItems(),
        }),
      });
      const stripeData = await stripeRes.json();
      if (stripeRes.ok && stripeData.success && stripeData.clientSecret) {
        // Meta Pixel — InitiateCheckout
        try {
          if (typeof window !== "undefined" && window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
              content_ids: cart.map(item => item.sku),
              content_type: 'product',
              value: cartTotal,
              currency: 'USD',
              num_items: cart.reduce((sum, item) => sum + item.quantity, 0),
            });
          }
        } catch (e) { console.error('Meta InitiateCheckout failed:', e); }

        setStripeClientSecret(stripeData.clientSecret);
        setCartOpen(false);
        setStripeLoading(false);
      } else {
        alert(stripeData.error || "Failed to create Stripe session.");
        setStripeLoading(false);
      }
    } catch {
      alert("Failed to connect to payment server.");
      setStripeLoading(false);
    }
  };

  const handlePaymentSuccess = async (receiptId) => {
    // Fire Google Ads Purchase Conversion
    try {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-18072236543/TOJ3CIzm8ZccEP_jwalD',
          'value': cartTotal,
          'currency': 'USD',
          'transaction_id': receiptId
        });
      }
    } catch (e) {
      console.error("GTM Conversion failed:", e);
    }

    // Meta Pixel — Purchase
    try {
      if (typeof window !== "undefined" && window.fbq) {
        window.fbq('track', 'Purchase', {
          content_ids: cart.map(item => item.sku),
          content_type: 'product',
          value: cartTotal,
          currency: 'USD',
          num_items: cart.reduce((sum, item) => sum + item.quantity, 0),
        });
      }
    } catch (e) {
      console.error("Meta Purchase failed:", e);
    }

    setPaymentModal(null);
    setOrderResult({
      orderNumber: paymentModal?.orderNumber || "—",
      email: paymentModal?.email || formData.email,
      receiptId,
    });
    setCart([]);
    clearCartStorage();
    setFormData({ name: "", email: "" });

    try {
      await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptId }),
      });
    } catch {
      console.error("Failed to confirm order server-side");
    }
  };

  const handlePaymentCancel = () => {
    setPaymentModal(null);
  };

  return (
    <>
      {/* Zeigarnik Mini-Banner — sits flush below navbar */}
      {cart.length > 0 && !cartOpen && (
        <div
          className="fixed left-0 right-0 z-[998] transition-all duration-500 animate-[slideDown_0.4s_ease-out]"
          style={{
            top: (typeof document !== 'undefined' && document.querySelector('header')?.offsetHeight
              ? document.querySelector('header').offsetHeight + 3
              : 69) + 'px',
            background: "linear-gradient(135deg, #4A3B32, #3a2d24)",
          }}
        >
          <button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-white hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4 flex-shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"></path>
            </svg>
            <span className="text-[12px] sm:text-[13px] font-medium">
              You have <strong>{cartCount} item{cartCount !== 1 ? "s" : ""}</strong> in your cart — <strong>${cartTotal.toFixed(2)}</strong>
            </span>
            <span className="text-[11px] sm:text-[12px] font-bold px-3 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--henna-500)" }}>
              Complete Checkout &rarr;
            </span>
          </button>
        </div>
      )}

      <main className="flex-grow pt-36 pb-40 px-6 relative pattern-paisley" style={{ zIndex: 1 }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://swaddleshawls.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Shop",
                  "item": "https://swaddleshawls.com/shop"
                }
              ]
            })
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-wider uppercase" style={{ backgroundColor: "var(--henna-50)", color: "var(--henna-600)" }}>
              {isPreorder ? "✦ Limited Launch Special ✦" : "✦ Handcrafted with Love ✦"}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-5" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>{isPreorder ? "The Inaugural Collection" : "Our Collection"}</h1>
            <div className="section-divider mb-8"></div>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: "var(--brown-500)" }}>
              {isPreorder
                ? "Welcome to our highly anticipated launch! Enjoy exclusive, limited-time pricing on our premier collection of authentic, handcrafted Indian muslin swaddles."
                : "Browse our handcrafted collection of authentic Indian baby shawls and swaddles."}
            </p>
          </div>

          {/* Order Success Banner */}
          {orderResult && (
            <div className="mb-10 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-lg">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-emerald-900 mb-2">{isPreorder ? "Launch Special Confirmed!" : "Payment Confirmed!"}</h3>
              <p className="text-emerald-700 mb-1">
                Your order number is <span className="font-mono font-bold text-lg">{orderResult.orderNumber}</span>
              </p>
              {orderResult.receiptId && (
                <p className="text-emerald-600 text-xs mb-1">
                  Receipt: <span className="font-mono">{orderResult.receiptId}</span>
                </p>
              )}
              <p className="text-emerald-600 text-sm">
                A confirmation has been recorded for <span className="font-medium">{orderResult.email}</span>.
                You can view your order anytime in the{" "}
                <a href="/portal" className="underline font-bold hover:text-emerald-800">Client Portal</a>.
              </p>
              <button onClick={() => setOrderResult(null)} className="mt-4 text-emerald-600 text-sm underline hover:text-emerald-800">
                Dismiss
              </button>
            </div>
          )}

          {/* Product Grid — Loading */}
          {loadingProducts && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse" style={{ border: "1px solid var(--brown-100)" }}>
                  <div className="aspect-square" style={{ backgroundColor: "var(--brown-100)" }}></div>
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-16 rounded" style={{ backgroundColor: "var(--brown-100)" }}></div>
                    <div className="h-5 w-3/4 rounded" style={{ backgroundColor: "var(--brown-100)" }}></div>
                    <div className="h-4 rounded" style={{ backgroundColor: "var(--brown-100)" }}></div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-6 w-14 rounded" style={{ backgroundColor: "var(--brown-100)" }}></div>
                      <div className="h-9 w-20 rounded-lg" style={{ backgroundColor: "var(--brown-100)" }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Product Grid — Error */}
          {productError && !loadingProducts && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--terra-50)" }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--terra-500)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--brown-800)" }}>Unable to load products</h3>
              <p className="mb-4" style={{ color: "var(--brown-400)" }}>{productError}</p>
              <button onClick={() => window.location.reload()}
                className="px-6 py-2 text-white rounded-lg font-bold text-sm transition-colors"
                style={{ backgroundColor: "var(--brown-800)" }}>
                Retry
              </button>
            </div>
          )}

          {/* Product Grid — Empty */}
          {!loadingProducts && !productError && products.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--brown-800)" }}>No products available</h3>
              <p style={{ color: "var(--brown-400)" }}>Check back soon for new inventory.</p>
            </div>
          )}

          {/* Product Grid — Items by Category */}
          {!loadingProducts && !productError && products.length > 0 && (
            <div className="space-y-16">
              {[
                {
                  title: "Newborn Essentials",
                  badge: "For The Little Ones",
                  description: "Pure, gentle swaddles crafted for your baby's first days.",
                  items: products.filter(p => !p.category || p.category === "Newborn Essentials")
                },
                {
                  title: "Parenthood Essentials",
                  badge: "For The Parents",
                  description: "Mindfully designed essentials to support you through your parenthood journey.",
                  items: products.filter(p => p.category === "Parenthood Essentials")
                }
              ].map((category, idx) => {
                if (category.items.length === 0) return null;
                return (
                  <div key={idx}>
                    <div className="mb-10 pb-5 relative" style={{ borderBottom: "2px solid var(--brown-100)" }}>
                      {category.badge && (
                        <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-3 tracking-wider uppercase" style={{ backgroundColor: "var(--terra-50)", color: "var(--terra-600)" }}>
                          {category.badge}
                        </div>
                      )}
                      <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>{category.title}</h2>
                      <p className="text-lg" style={{ color: "var(--brown-500)" }}>{category.description}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
                      {category.items.map((product) => {
                        const pid = product._id || product.id;
                        return (
                          <ProductCard
                            key={pid}
                            product={product}
                            viewProduct={viewProduct}
                            isPreorder={isPreorder}
                            addedItem={addedItem}
                            addToCart={addToCart}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CONTACT FORM SECTION */}
        <CrmContactForm heading="Need Help Choosing?" subtitle="Our team can help you find the perfect swaddle for your little one — or create the ideal gift set." />
      </main>

      {/* Floating Cart Badge */}
      {cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-8 right-8 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{ zIndex: 9999, backgroundColor: "var(--brown-800)" }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"></path>
          </svg>
          <span className="absolute -top-1 -right-1 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--henna-500)" }}>
            {cartCount}
          </span>
        </button>
      )}

      {/* Social Proof Ticker */}
      <SocialProofTicker bannerActive={cart.length > 0 && !cartOpen} />

      {/* Voice Assistant — Nani */}
      <VoiceAssistant
        agentAddToCart={agentAddToCart}
        agentRemoveFromCart={agentRemoveFromCart}
        onAgentViewProduct={onAgentViewProduct}
        onAgentCloseModal={onAgentCloseModal}
        onAgentOpenCart={onAgentOpenCart}
        onAgentCloseCart={onAgentCloseCart}
        onAgentSetSize={onAgentSetSize}
        cart={cart}
        cartTotal={cartTotal}
        appliedCoupon={appliedCoupon}
      />

      {/* Cart Drawer */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all"
            style={{ zIndex: 10000 }}
            onClick={closeCart}
          ></div>

          <div
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col cart-drawer-enter"
            style={{ zIndex: 10001 }}
          >
            <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid var(--brown-100)" }}>
              <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--henna-500)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"></path>
                </svg>
                Your Cart
                <span className="text-sm font-normal" style={{ color: "var(--brown-400)" }}>({cartCount} item{cartCount !== 1 ? "s" : ""})</span>
              </h3>
              <button
                onClick={closeCart}
                className="p-1 transition-colors" style={{ color: "var(--brown-400)" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* ── Scrollable cart items ── */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ WebkitOverflowScrolling: "touch" }}>
              {cart.length === 0 ? (
                <div className="text-center py-12" style={{ color: "var(--brown-300)" }}>
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  <p className="font-medium">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="flex items-center justify-between rounded-xl p-3 sm:p-4 gap-3 sm:gap-4" style={{ backgroundColor: "var(--brown-50)" }}>
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        {item.image && (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-white" style={{ border: "1px solid var(--brown-100)" }}>
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm sm:text-base truncate" style={{ color: "var(--brown-800)" }}>{item.name}</h4>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="text-xs mb-1 space-y-0.5" style={{ color: "var(--brown-500)" }}>
                              {item.modifiers.map(m => (
                                <div key={m.id}>+ {m.name}</div>
                              ))}
                            </div>
                          )}
                          {isPreorder ? (
                            <p className="text-xs sm:text-sm font-medium mt-1">
                              <span className="line-through text-xs mr-2" style={{ color: "var(--brown-400)" }}>${Number(item.price).toFixed(2)}</span>
                              <span style={{ color: "var(--henna-600)" }}>${(Number(item.price) - (item.price * 0.1)).toFixed(2)} each</span>
                            </p>
                          ) : (
                            <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: "var(--brown-600)" }}>${Number(item.price).toFixed(2)} each</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white flex items-center justify-center font-bold transition-colors text-sm"
                          style={{ border: "1px solid var(--brown-200)", color: "var(--brown-500)" }}
                        >
                          −
                        </button>
                        <span className="font-bold w-5 sm:w-6 text-center text-sm" style={{ color: "var(--brown-800)" }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white flex items-center justify-center font-bold transition-colors text-sm"
                          style={{ border: "1px solid var(--brown-200)", color: "var(--brown-500)" }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Sticky bottom payment panel ── */}
            {cart.length > 0 && (
              <div className="shrink-0 border-t p-4 sm:p-5 space-y-3 bg-white overflow-y-auto" style={{ borderColor: "var(--brown-100)", maxHeight: "60vh" }}>
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold" style={{ color: "var(--brown-800)" }}>Subtotal</span>
                  <span className="text-xl sm:text-2xl font-bold" style={{ color: "var(--brown-800)" }}>${cartTotal.toFixed(2)}</span>
                </div>
                <div>
                  <label htmlFor="checkout-coupon" className="block text-xs font-bold mb-1" style={{ color: "var(--brown-500)" }}>Coupon Code (Optional)</label>
                  <div className="flex gap-2">
                    <input type="text" id="checkout-coupon" value={formData.couponCode} onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })} disabled={appliedCoupon} placeholder="e.g. WELCOME10" className="flex-1 px-3 py-2 rounded-lg bg-white outline-none transition-all text-sm uppercase disabled:opacity-50" style={{ border: "1px solid var(--brown-200)", color: "var(--brown-800)" }} />
                    {appliedCoupon ? (
                      <button type="button" onClick={() => { setAppliedCoupon(null); setFormData({ ...formData, couponCode: "" }); }} className="px-3 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">Remove</button>
                    ) : (
                      <button type="button" onClick={handleApplyCoupon} disabled={!formData.couponCode} className="px-3 py-2 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50" style={{ backgroundColor: "var(--henna-500)" }}>Apply</button>
                    )}
                  </div>
                  {couponError && <div className="text-red-500 text-xs mt-1 font-bold">{couponError}</div>}
                  {appliedCoupon && <div className="text-emerald-600 text-xs mt-1 font-bold">✓ {appliedCoupon.name} applied!</div>}
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--brown-400)" }}>Choose Payment Method</div>

                <button type="button" disabled={stripeLoading || submitting} onClick={handleStripeCheckout} className="w-full font-bold py-3 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50 text-sm tracking-wide flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5" style={{ backgroundColor: "#635BFF", color: "#fff" }}>
                  {stripeLoading ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>Redirecting to Stripe...</>) : (<><svg className="h-5 w-auto" viewBox="54 36 360.02 149.84" fill="currentColor"><path d="M414,113.4c0-25.6-12.4-45.8-36.1-45.8c-23.8,0-38.2,20.2-38.2,45.6c0,30.1,17,45.3,41.4,45.3 c11.9,0,20.9-2.7,27.7-6.5v-20c-6.8,3.4-14.6,5.5-24.5,5.5c-9.7,0-18.3-3.4-19.4-15.2h48.9C413.8,121,414,115.8,414,113.4z M364.6,103.9c0-11.3,6.9-16,13.2-16c6.1,0,12.6,4.7,12.6,16H364.6z" /><path d="M301.1,67.6c-9.8,0-16.1,4.6-19.6,7.8l-1.3-6.2h-22v116.6l25-5.3l0.1-28.3c3.6,2.6,8.9,6.3,17.7,6.3 c17.9,0,34.2-14.4,34.2-46.1C335.1,83.4,318.6,67.6,301.1,67.6z M295.1,136.5c-5.9,0-9.4-2.1-11.8-4.7l-0.1-37.1 c2.6-2.9,6.2-4.9,11.9-4.9c9.1,0,15.4,10.2,15.4,23.3C310.5,126.5,304.3,136.5,295.1,136.5z" /><polygon points="223.8,61.7 248.9,56.3 248.9,36 223.8,41.3" /><rect x="223.8" y="69.3" width="25.1" height="87.5" /><path d="M196.9,76.7l-1.6-7.4h-21.6v87.5h25V97.5c5.9-7.7,15.9-6.3,19-5.2v-23C214.5,68.1,202.8,65.9,196.9,76.7z" /><path d="M146.9,47.6l-24.4,5.2l-0.1,80.1c0,14.8,11.1,25.7,25.9,25.7c8.2,0,14.2-1.5,17.5-3.3V135 c-3.2,1.3-19,5.9-19-8.9V90.6h19V69.3h-19L146.9,47.6z" /><path d="M79.3,94.7c0-3.9,3.2-5.4,8.5-5.4c7.6,0,17.2,2.3,24.8,6.4V72.2c-8.3-3.3-16.5-4.6-24.8-4.6 C67.5,67.6,54,78.2,54,95.9c0,27.6,38,23.2,38,35.1c0,4.6-4,6.1-9.6,6.1c-8.3,0-18.9-3.4-27.3-8v23.8c9.3,4,18.7,5.7,27.3,5.7 c20.8,0,35.1-10.3,35.1-28.2C117.4,100.6,79.3,105.9,79.3,94.7z" /></svg>Pay with Card — ${cartTotal.toFixed(2)}</>)}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ backgroundColor: "var(--brown-200)" }}></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--brown-400)" }}>or</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: "var(--brown-200)" }}></div>
                </div>

                <button type="button" disabled={submitting || stripeLoading} onClick={handleSurgeCheckout} className="w-full font-bold py-3 rounded-xl transition-all duration-300 shadow-md disabled:opacity-50 text-sm tracking-wide flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5" style={{ backgroundColor: "#f97316", color: "#fff" }}>
                  {submitting ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>Processing...</>) : (<><img src="/Surge.png" alt="Surge Shield" className="h-7 w-auto object-contain my-[-4px]" /><span className="flex flex-col items-center leading-tight"><span>Pay with Surge — ${surgeTotal.toFixed(2)}</span><span className="text-[10px] font-normal opacity-80">Save ${surgeSavings.toFixed(2)} (5% off)</span></span></>)}
                </button>

                <div className="text-[10px] text-center leading-relaxed" style={{ color: "var(--brown-400)" }}>
                  <svg className="w-3 h-3 inline mr-0.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Secured by 256-bit SSL encryption
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => { setSelectedProduct(null); setAgentDrivingMode(false); setAgentSelectedSize(null); }}
          onAddToCart={addToCart}
          addedItem={addedItem}
          agentDrivingMode={agentDrivingMode}
          agentSelectedSize={agentSelectedSize}
        />
      )}

      {/* BasaltSurge Payment Modal */}
      {paymentModal && (
        <PaymentModal
          receiptId={paymentModal.receiptId}
          paymentUrl={paymentModal.paymentUrl}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      {/* Stripe Embedded Checkout Modal */}
      {stripeClientSecret && (
        <div className="fixed inset-0 z-[10101] flex items-center justify-center p-4 lg:p-8">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setStripeClientSecret(null)}></div>
          <div className="relative w-full max-w-lg md:max-w-2xl bg-white rounded-2xl shadow-2xl payment-modal-enter transition-all duration-300 max-h-[90vh] min-h-[400px] overflow-y-auto" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {/* Close button */}
            <button
              onClick={() => setStripeClientSecret(null)}
              className="sticky top-0 right-0 z-10 ml-auto flex items-center gap-1.5 mr-3 mt-3 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:bg-slate-200"
              style={{ backgroundColor: "rgba(241,245,249,0.95)", color: "#475569" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              Cancel
            </button>
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
              <EmbeddedCheckout className="w-full" />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      )}

      {/* Cart Abandonment Modal */}
      <CartAbandonmentModal
        isOpen={showAbandonModal}
        onClose={() => setShowAbandonModal(false)}
      />
    </>
  );
}
