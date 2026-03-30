"use client";
import React, { useState } from "react";

const FORM_SLUG = process.env.NEXT_PUBLIC_BRAND_FORM_SLUG || process.env.BRAND_FORM_SLUG || "contact-form";
const API_ENDPOINT = "https://crm.basalthq.com/api/forms/submit";

const INQUIRY_OPTIONS = [
  { value: "", label: "Select Inquiry Type" },
  { value: "product_info", label: "Product Information" },
  { value: "bulk_wholesale", label: "Wholesale / Boutique Partnership" },
  { value: "custom_design", label: "Custom Design Request" },
  { value: "gift_order", label: "Gift Order" },
  { value: "care_instructions", label: "Care & Maintenance" },
  { value: "partnership", label: "Collaboration / Press" },
  { value: "other", label: "Other" },
];

export default function CrmContactForm({ heading, subtitle }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    inquiry_type: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const body = new FormData();
      Object.entries(formData).forEach(([k, v]) => body.append(k, v));
      body.append("form_slug", FORM_SLUG);
      body.append("source_url", window.location.href);
      if (document.referrer) body.append("referrer", document.referrer);

      const params = new URLSearchParams(window.location.search);
      if (params.has("utm_source")) body.append("utm_source", params.get("utm_source"));
      if (params.has("utm_medium")) body.append("utm_medium", params.get("utm_medium"));
      if (params.has("utm_campaign")) body.append("utm_campaign", params.get("utm_campaign"));

      const res = await fetch(API_ENDPOINT, { method: "POST", body });
      const result = await res.json();

      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(result.error || "Submission failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Failed to connect. Please try again.");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border outline-none transition-all text-sm"
    + " bg-[var(--warm-cream)] border-[var(--brown-200)] text-[var(--brown-800)]"
    + " focus:border-[var(--henna-500)] focus:bg-white focus:ring-2 focus:ring-[rgba(45,106,106,0.15)]";

  return (
    <section id="contact" className="py-24 border-t" style={{ backgroundColor: "var(--brown-50)", borderColor: "var(--brown-100)" }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
            {heading || "Get In Touch"}
          </h2>
          <div className="section-divider mb-6"></div>
          <p style={{ color: "var(--brown-500)" }}>
            {subtitle || "We'd love to hear from you. Send us a message and we'll respond promptly."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12" style={{ boxShadow: "var(--shadow-xl)" }}>
          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--henna-50)" }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--henna-500)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--brown-800)" }}>Thank you!</h3>
              <p style={{ color: "var(--brown-500)" }}>We&apos;ve received your message and will get back to you shortly.</p>
            </div>
          ) : (
            <>
              {status === "error" && (
                <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: "var(--terra-50)", border: "1px solid var(--terra-200)" }}>
                  <p className="text-sm text-center font-medium" style={{ color: "var(--terra-700)" }}>{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "var(--brown-600)" }}>Full Name *</label>
                    <input type="text" name="full_name" required placeholder="Your Full Name"
                      value={formData.full_name} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "var(--brown-600)" }}>Email Address *</label>
                    <input type="email" name="email" required placeholder="you@example.com"
                      value={formData.email} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "var(--brown-600)" }}>Contact Phone</label>
                    <input type="tel" name="phone" placeholder="+1 (555) 123-4567"
                      value={formData.phone} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "var(--brown-600)" }}>Company / Organization</label>
                    <input type="text" name="company" placeholder="Your Company Name"
                      value={formData.company} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: "var(--brown-600)" }}>Inquiry Type *</label>
                  <select name="inquiry_type" required value={formData.inquiry_type} onChange={handleChange} className={inputClass}>
                    {INQUIRY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={!opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: "var(--brown-600)" }}>Detailed Message *</label>
                  <textarea name="message" rows={4} required
                    placeholder="Tell us about your needs — specific designs, quantities, gift inquiries, or any questions..."
                    value={formData.message} onChange={handleChange} className={inputClass} />
                </div>

                <button type="submit" disabled={status === "submitting"}
                  className="w-full text-white font-bold py-4 rounded-lg transform hover:-translate-y-1 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:transform-none"
                  style={{ backgroundColor: "var(--brown-800)" }}>
                  {status === "submitting" ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
