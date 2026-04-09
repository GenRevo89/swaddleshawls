"use client";
import React, { useState } from "react";
import Link from "next/link";
import PaisleyBackground from "@/components/PaisleyBackground";
import CrmContactForm from "@/components/CrmContactForm";

const ALL_FAQS = [
  {
    category: "Products",
    items: [
      { q: "What materials are used in your shawls?", a: "All SwaddleShawls are made from 100% pure cotton, sourced from India's finest textile regions. Our fabrics are naturally breathable, hypoallergenic, and gentle on even the most sensitive newborn skin. We use no synthetic blends — ever." },
      { q: "What sizes are available?", a: 'Our swaddles measure approximately 47" × 47" (120cm × 120cm), the ideal size for swaddling newborns and wrapping toddlers. Our heritage shawls are larger at 55" × 35" (140cm × 90cm), perfect as a nursing cover or stroller blanket.' },
      { q: "Are your products safe for newborns?", a: "Absolutely. Our products are made from 100% natural cotton with no synthetic dyes or chemicals. They are hypoallergenic and have been tested to meet the highest safety standards for infant products." },
      { q: "What makes SwaddleShawls different from other brands?", a: "Every SwaddleShawl is handcrafted by skilled artisans using traditional Indian textile techniques. Our patterns are inspired by centuries of heritage, and each piece comes with a Certificate of Authenticity. We never use synthetic materials or mass-production methods." },
    ]
  },
  {
    category: "Care & Maintenance",
    items: [
      { q: "How do I care for my SwaddleShawl?", a: "Machine wash cold on a gentle cycle with mild detergent. Lay flat to dry for best results, or tumble dry on low heat. The colors are set with natural dyes and will soften beautifully with each wash while retaining their vibrancy." },
      { q: "Will the colors fade after washing?", a: "Our natural dyes are set using traditional methods that ensure color longevity. The shawls will soften with each wash but retain their beautiful vibrancy for years. We recommend cold water washing to maintain optimal color." },
      { q: "Can I iron my SwaddleShawl?", a: "Yes! Cotton loves a gentle iron. Use a medium heat setting and iron while slightly damp for best results. This will restore the fabric's smooth finish and make the patterns look crisp." },
    ]
  },
  {
    category: "Ordering & Shipping",
    items: [
      { q: "Do you ship internationally?", a: "Yes! We ship worldwide. Standard shipping typically takes 5-10 business days depending on your location. Expedited options are available at checkout. All orders include tracking." },
      { q: "Do you offer gift packaging?", a: "Absolutely! Every SwaddleShawl arrives in our signature eco-friendly packaging — a beautifully printed keepsake box with a drawstring muslin pouch and a signed Certificate of Authenticity. It's gift-ready straight out of the box." },
      { q: "What is your return policy?", a: "We offer a 30-day satisfaction guarantee. If you're not completely delighted with your SwaddleShawl, contact us for a full refund or exchange. We want every parent to feel confident in their purchase." },
      { q: "Can I track my order?", a: "Yes, all orders include tracking. You'll receive a confirmation email with your tracking number once your order ships. You can track your package in real-time through our carrier's website." },
    ]
  },
];

export default function FaqPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (key) => setOpenFaq(openFaq === key ? null : key);

  return (
    <main>
      {/* Hero */}
      <section className="relative pt-36 pb-20 text-white"
        style={{ background: "linear-gradient(135deg, #2c1810 0%, #1a3a3a 50%, #1a0f09 100%)", overflowX: "clip" }}>
        <PaisleyBackground opacity={0.04} speed={55} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-block px-5 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-8 border"
            style={{ backgroundColor: "rgba(219,181,92,0.12)", borderColor: "rgba(219,181,92,0.25)", color: "#dbb55c" }}>
            ✦ Help Center ✦
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
            Everything you need to know about our handcrafted shawls, care, and ordering.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-24 relative" style={{ backgroundColor: "var(--warm-cream)", overflowX: "clip" }}>
        <PaisleyBackground opacity={0.035} speed={60} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          {ALL_FAQS.map((category, ci) => (
            <div key={category.category} className="mb-14">
              <div className="mb-6 pb-4" style={{ borderBottom: "2px solid var(--brown-100)" }}>
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-2"
                  style={{ backgroundColor: "var(--terra-50)", color: "var(--terra-600)" }}>
                  {category.category}
                </div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                  {category.category}
                </h2>
              </div>

              <div className="space-y-3">
                {category.items.map((faq, fi) => {
                  const key = `${ci}-${fi}`;
                  return (
                    <div key={key} className="rounded-xl overflow-hidden transition-all duration-500"
                      style={{ border: "1px solid var(--brown-200)" }}>
                      <button onClick={() => toggleFaq(key)}
                        className="w-full flex items-center justify-between p-6 bg-white transition-all duration-300 text-left focus:outline-none hover:bg-[var(--brown-50)]"
                        style={{ fontFamily: "var(--font-heading)" }}>
                        <span className="font-bold text-lg pr-4" style={{ color: "var(--brown-800)" }}>{faq.q}</span>
                        <span className={`text-2xl font-light transform transition-transform duration-500 flex-shrink-0 ${openFaq === key ? 'rotate-45' : ''}`}
                          style={{ color: "var(--henna-500)" }}>+</span>
                      </button>
                      <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${openFaq === key ? 'max-h-[500px]' : 'max-h-0'}`}
                        style={{ backgroundColor: "var(--brown-50)" }}>
                        <div className="p-6 pt-2 leading-relaxed" style={{ color: "var(--brown-500)" }}>
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <CrmContactForm
        heading="Still Have Questions?"
        subtitle="Can't find what you're looking for? Our team is here to help."
      />
    </main>
  );
}
