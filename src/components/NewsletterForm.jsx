"use client";
import React, { useState } from "react";

const FORM_SLUG = "swaddleshawls-newletter-1f21cb3b";
const API_ENDPOINT = "https://crm.basalthq.com//api/forms/submit";

export default function NewsletterForm({ variant = "footer", onSuccess }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === "submitting") return;

    setStatus("submitting");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("form_slug", FORM_SLUG);
    formData.append("source_url", window.location.href);
    if (document.referrer) formData.append("referrer", document.referrer);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("utm_source")) formData.append("utm_source", urlParams.get("utm_source"));
    if (urlParams.has("utm_medium")) formData.append("utm_medium", urlParams.get("utm_medium"));
    if (urlParams.has("utm_campaign")) formData.append("utm_campaign", urlParams.get("utm_campaign"));

    try {
      const res = await fetch(API_ENDPOINT, { method: "POST", body: formData });
      const result = await res.json();
      if (result.success) {
        setStatus("success");
        setMessage(result.message || "Thank you for subscribing!");
        setEmail("");
        if (onSuccess) onSuccess();
      } else {
        setStatus("error");
        setMessage(result.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (status === "success") {
    // If there's an onSuccess handler, we let the parent manage the UI.
    // Otherwise, we just render a simple inline success message for fallback.
    if (onSuccess) return null;

    return (
      <div className={`flex flex-col gap-2 py-3 px-4 rounded-xl ${variant === "modal" ? "bg-white/50 border border-[var(--brown-200)]" : "border border-white/20"}`}>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={variant === "modal" ? "#3d9895" : "#dbb55c"} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-bold"
            style={{ color: variant === "modal" ? "var(--brown-800)" : "#dbb55c" }}>
            {message}
          </span>
        </div>
      </div>
    );
  }

  // ---------- MODAL VARIANT ----------
  if (variant === "modal") {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 border focus:border-[#cc7750] focus:ring-2 focus:ring-[#cc7750]/20"
            style={{
              backgroundColor: "var(--brown-50, #faf6f0)",
              color: "var(--brown-800)",
              borderColor: "var(--brown-200, #e0d5c5)",
            }}
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #cc7750, #974c30)" }}
          >
            {status === "submitting" ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
        {status === "error" && (
          <p className="text-xs mt-2 normal-case tracking-normal" style={{ color: "#cc4444" }}>{message}</p>
        )}
      </form>
    );
  }

  // ---------- FOOTER VARIANT ----------
  return (
    <form onSubmit={handleSubmit} className="flex items-center border-b pb-1 group transition-colors duration-300"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="bg-transparent text-[11px] w-full py-1.5 outline-none normal-case tracking-normal placeholder:text-white/20 focus:placeholder:text-white/40 transition-colors duration-300"
        style={{ color: "white" }}
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="font-bold pl-4 transition-all duration-300 disabled:opacity-50"
        style={{ color: "var(--gold-400)" }}
      >
        {status === "submitting" ? (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        )}
      </button>
    </form>
  );
}
