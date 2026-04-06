"use client";
import React, { useState, useEffect } from "react";

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

const isPreorder = process.env.NEXT_PUBLIC_PREORDER === "TRUE";

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
function ProductDetailModal({ product, onClose, onAddToCart, addedItem }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const pid = product._id || product.id;

  useEffect(() => {
    if (product?.modifierGroups) {
      const initial = {};
      product.modifierGroups.forEach(mg => {
        if (mg.modifiers && mg.modifiers.length > 0) {
          initial[mg.id] = mg.modifiers.slice().sort((a,b) => a.sortOrder - b.sortOrder)[0];
        }
      });
      setSelectedModifiers(initial);
    }
  }, [product]);

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

  return (
    <>
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
                  10% Off Preorder Special
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
                  {product.modifierGroups.slice().sort((a,b) => a.sortOrder - b.sortOrder).map(mg => (
                    <div key={mg.id} className="rounded-xl p-4" style={{ backgroundColor: "var(--brown-50)", border: "1px solid var(--brown-100)" }}>
                      <div className="text-sm font-bold mb-3 uppercase tracking-wider flex items-center justify-between" style={{ color: "var(--brown-700)" }}>
                        <span>{mg.name} {mg.required && <span className="text-red-500 ml-1">*</span>}</span>
                      </div>
                      <div className="space-y-2">
                        {mg.modifiers.slice().sort((a,b) => a.sortOrder - b.sortOrder).map(mod => (
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

              {/* Add to Cart */}
              <button
                onClick={() => onAddToCart(product, Object.values(selectedModifiers))}
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-300 shadow-lg ${
                  addedItem === pid
                    ? "bg-emerald-600 text-white scale-[0.98]"
                    : "text-white hover:-translate-y-0.5"
                }`}
                style={addedItem !== pid ? { backgroundColor: "var(--brown-800)" } : {}}
              >
                {addedItem === pid ? "✓ Added to Cart" : isPreorder ? `Pre-Order — $${currentTotal.toFixed(2)}` : `Add to Cart — $${currentTotal.toFixed(2)}`}
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
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
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


export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", couponCode: "" });
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [addedItem, setAddedItem] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null); // Product detail modal

  // Fetch products from BasaltSurge on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setProductError("Failed to load products");
        }
      } catch {
        setProductError("Failed to connect to server");
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  const addToCart = (product, rawModifiers = []) => {
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
        modifiers
      }];
    });
    setAddedItem(pid);
    setTimeout(() => setAddedItem(null), 1200);
    if (!cartOpen && !selectedProduct) setCartOpen(true);
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => {
    const activePrice = isPreorder ? item.price - (item.basePrice * 0.1) : item.price;
    return sum + activePrice * item.quantity;
  }, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          customerName: formData.name,
          couponCode: formData.couponCode || undefined,
          items: cart.map((item) => {
            const itemModifiers = [...item.modifiers];
            // Automatically apply preorder discount if missing
            if (isPreorder && !itemModifiers.find(m => m.id === "preorder-discount")) {
               itemModifiers.push({
                 id: "preorder-discount",
                 groupId: "discount",
                 modifierId: "preorder",
                 name: "10% Pre-Order Discount",
                 priceAdjustment: -(item.basePrice * 0.1)
               });
            }
            return {
              productName: item.name,
              sku: item.sku,
              quantity: item.quantity,
              price: isPreorder ? item.price - (item.basePrice * 0.1) : item.price,
              modifiers: itemModifiers,
            };
          }),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.data.paymentUrl && data.data.receiptId) {
          setPaymentModal({
            receiptId: data.data.receiptId,
            paymentUrl: data.data.paymentUrl,
            orderNumber: data.data.orderNumber,
            email: formData.email,
          });
          setCartOpen(false);
          setCheckoutMode(false);
        } else {
          setOrderResult(data.data);
          setCart([]);
          setCheckoutMode(false);
          setFormData({ name: "", email: "" });
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

  const handlePaymentSuccess = async (receiptId) => {
    setPaymentModal(null);
    setOrderResult({
      orderNumber: paymentModal?.orderNumber || "—",
      email: paymentModal?.email || formData.email,
      receiptId,
    });
    setCart([]);
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
      <main className="flex-grow pt-36 pb-28 px-6 relative pattern-paisley" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-wider uppercase" style={{ backgroundColor: "var(--henna-50)", color: "var(--henna-600)" }}>
            {isPreorder ? "✦ Limited Pre-Orders ✦" : "✦ Handcrafted with Love ✦"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>{isPreorder ? "Pre-Order Collection" : "Our Collection"}</h1>
          <div className="section-divider mb-8"></div>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: "var(--brown-500)" }}>
            {isPreorder
              ? "Be the first to own our handcrafted collection. Reserve yours today — shipping begins soon."
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
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">{isPreorder ? "Pre-Order Confirmed!" : "Payment Confirmed!"}</h3>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                description: "Pure, gentle swaddles crafted for your baby's first days.",
                items: products.filter(p => !p.category || p.category === "Newborn Essentials")
              },
              {
                title: "Parenthood Essentials",
                description: "Mindfully designed essentials to support you through your parenthood journey.",
                items: products.filter(p => p.category === "Parenthood Essentials")
              }
            ].map((category, idx) => {
              if (category.items.length === 0) return null;
              return (
                <div key={idx}>
                  <div className="mb-10 pb-5 relative" style={{ borderBottom: "2px solid var(--brown-100)" }}>
                    <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-3 tracking-wider uppercase" style={{ backgroundColor: "var(--terra-50)", color: "var(--terra-600)" }}>
                      {category.title}
                    </div>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>{category.title}</h2>
                    <p className="text-lg" style={{ color: "var(--brown-500)" }}>{category.description}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
                    {category.items.map((product) => {
                      const pid = product._id || product.id;
                      return (
                        <div
                  key={pid}
                  className="group heritage-card bg-white rounded-2xl overflow-hidden shadow-md flex flex-col cursor-pointer relative"
                  onClick={() => setSelectedProduct(product)}
                >
                  {isPreorder && (
                    <div className="absolute top-3 left-3 z-[15] px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-md tracking-wider" style={{ backgroundColor: "var(--henna-500)", color: "white" }}>
                      10% Off Preorder Special
                    </div>
                  )}
                  {/* 1:1 Square Image */}
                  <div className="aspect-square overflow-hidden relative" style={{ backgroundColor: "var(--brown-50)" }}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
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
                        {isPreorder ? "Pre-Order" : "View Details"}
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
                    <h3 className="text-base font-bold mb-1.5"
                      style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                      {product.name}
                    </h3>
                    <p className="text-xs mb-4 flex-grow line-clamp-2" style={{ color: "var(--brown-400)" }}>
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
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
                            setSelectedProduct(product);
                          } else {
                            addToCart(product); 
                          }
                        }}
                        className={`btn-primary px-4 py-2.5 text-[11px] transition-all duration-300 ${
                          addedItem === pid
                            ? "!bg-emerald-600 scale-95"
                            : ""
                        }`}
                      >
                        {addedItem === pid ? "✓ Added" : isPreorder ? "Pre-Order" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
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

      {/* Cart Drawer */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all"
            style={{ zIndex: 10000 }}
            onClick={() => { setCartOpen(false); setCheckoutMode(false); }}
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
                {isPreorder ? "Your Pre-Order" : "Your Cart"}
                <span className="text-sm font-normal" style={{ color: "var(--brown-400)" }}>({cartCount} item{cartCount !== 1 ? "s" : ""})</span>
              </h3>
              <button
                onClick={() => { setCartOpen(false); setCheckoutMode(false); }}
                className="p-1 transition-colors" style={{ color: "var(--brown-400)" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12" style={{ color: "var(--brown-300)" }}>
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  <p className="font-medium">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.cartItemId} className="flex items-center justify-between rounded-xl p-4" style={{ backgroundColor: "var(--brown-50)" }}>
                        <div>
                          <h4 className="font-bold" style={{ color: "var(--brown-800)" }}>{item.name}</h4>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="text-xs mb-1 space-y-0.5" style={{ color: "var(--brown-500)" }}>
                              {item.modifiers.map(m => (
                                <div key={m.id}>+ {m.name}</div>
                              ))}
                            </div>
                          )}
                          {isPreorder ? (
                            <p className="text-sm font-medium mt-1">
                              <span className="line-through text-xs mr-2" style={{ color: "var(--brown-400)" }}>${Number(item.price).toFixed(2)}</span>
                              <span style={{ color: "var(--henna-600)" }}>${(Number(item.price) - (item.basePrice * 0.1)).toFixed(2)} each</span>
                            </p>
                          ) : (
                            <p className="text-sm font-medium mt-1" style={{ color: "var(--brown-600)" }}>${Number(item.price).toFixed(2)} each</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold transition-colors"
                            style={{ border: "1px solid var(--brown-200)", color: "var(--brown-500)" }}
                          >
                            −
                          </button>
                          <span className="font-bold w-6 text-center" style={{ color: "var(--brown-800)" }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold transition-colors"
                            style={{ border: "1px solid var(--brown-200)", color: "var(--brown-500)" }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {checkoutMode && (
                    <form onSubmit={handleCheckout} className="space-y-4 rounded-xl p-5" style={{ backgroundColor: "var(--brown-50)", border: "1px solid var(--brown-100)" }}>
                      <h4 className="font-bold mb-1" style={{ color: "var(--brown-800)" }}>Checkout Details</h4>
                      <div>
                        <label htmlFor="checkout-name" className="block text-xs font-bold mb-1" style={{ color: "var(--brown-500)" }}>Full Name</label>
                        <input
                          type="text" id="checkout-name" required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your Full Name"
                          className="w-full px-3 py-2.5 rounded-lg bg-white outline-none transition-all text-sm"
                          style={{ border: "1px solid var(--brown-200)", color: "var(--brown-800)" }}
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-email" className="block text-xs font-bold mb-1" style={{ color: "var(--brown-500)" }}>Email Address</label>
                        <input
                          type="email" id="checkout-email" required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@example.com"
                          className="w-full px-3 py-2.5 rounded-lg bg-white outline-none transition-all text-sm"
                          style={{ border: "1px solid var(--brown-200)", color: "var(--brown-800)" }}
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-coupon" className="block text-xs font-bold mb-1" style={{ color: "var(--brown-500)" }}>Coupon Code (Optional)</label>
                        <input
                          type="text" id="checkout-coupon"
                          value={formData.couponCode}
                          onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                          placeholder="e.g. WELCOME10"
                          className="w-full px-3 py-2.5 rounded-lg bg-white outline-none transition-all text-sm uppercase"
                          style={{ border: "1px solid var(--brown-200)", color: "var(--brown-800)" }}
                        />
                      </div>
                      <button
                        type="submit" disabled={submitting}
                        className="w-full text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 text-sm tracking-wide"
                        style={{ backgroundColor: "var(--henna-500)" }}
                      >
                        {submitting ? "Placing Order..." : isPreorder ? `Confirm Pre-Order — $${cartTotal.toFixed(2)}` : `Place Order — $${cartTotal.toFixed(2)}`}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>

            {cart.length > 0 && !checkoutMode && (
              <div className="p-6" style={{ borderTop: "1px solid var(--brown-100)" }}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold" style={{ color: "var(--brown-800)" }}>Subtotal</span>
                  <span className="text-2xl font-bold" style={{ color: "var(--brown-800)" }}>${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setCheckoutMode(true)}
                  className="w-full text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform tracking-wide"
                  style={{ backgroundColor: "var(--brown-800)" }}
                >
                  {isPreorder ? "Confirm Pre-Order" : "Proceed to Checkout"}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          addedItem={addedItem}
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
    </>
  );
}
