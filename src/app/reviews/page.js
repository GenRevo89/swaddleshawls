"use client";
import React from "react";
import Link from "next/link";
import PaisleyBackground from "@/components/PaisleyBackground";

const REVIEWS = [
  {
    quote: "The Heritage Paisley Swaddle is absolutely stunning. My daughter looks like royalty in it, and the cotton is so incredibly soft. It's become our go-to for every outing. Worth every penny!",
    name: "Priyanka Sharma",
    initials: "PS",
    product: "Heritage Paisley Swaddle",
  },
  {
    quote: "I ordered the Ancients Raw Brown Swaddle as a baby shower gift, and the packaging alone had the mother-to-be in tears. The wooden box, the certificate — it all feels so premium and special.",
    name: "Emily Martinez",
    initials: "EM",
    product: "Ancients Raw Brown Swaddle",
  },
  {
    quote: "Finally, a baby product that honors our Indian heritage while being genuinely practical. The cotton quality is exceptional — breathable, soft, and holds up beautifully wash after wash.",
    name: "Rachna Krishnan",
    initials: "RK",
    product: "Simplicity Heritage Shawl",
  },
  {
    quote: "We bought the Sunrise Heritage for our first child and loved it so much we came back for two more in different patterns. The quality is unmatched — nothing else even comes close.",
    name: "David Chen",
    initials: "DC",
    product: "Sunrise Heritage Swaddle",
  },
  {
    quote: "As a midwife, I've seen hundreds of swaddles. SwaddleShawls are in a league of their own — the breathability and softness are remarkable. I recommend them to every new parent.",
    name: "Sarah Thompson",
    initials: "ST",
    product: "Heritage Paisley Swaddle",
  },
  {
    quote: "The attention to detail is incredible. From the hand-block printed patterns to the Certificate of Authenticity, everything about this brand screams quality and care. A true heirloom piece.",
    name: "Anita Gupta",
    initials: "AG",
    product: "Simplicity Heritage Shawl",
  },
];

export default function ReviewsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative pt-36 pb-20 text-white"
        style={{ background: "linear-gradient(135deg, #2c1810 0%, #1a3a3a 50%, #1a0f09 100%)", overflowX: "clip" }}>
        <PaisleyBackground opacity={0.04} speed={55} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-block px-5 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-8 border"
            style={{ backgroundColor: "rgba(219,181,92,0.12)", borderColor: "rgba(219,181,92,0.25)", color: "#dbb55c" }}>
            ✦ Customer Love ✦
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            What Parents Say
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
            Real stories from real families who trust SwaddleShawls for their little ones.
          </p>

          {/* Aggregate rating */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6" fill="#dbb55c" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
            <span className="text-white font-bold text-lg">5.0</span>
            <span style={{ color: "rgba(255,255,255,0.50)" }}>from {REVIEWS.length} reviews</span>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-24 relative" style={{ backgroundColor: "var(--warm-cream)", overflowX: "clip" }}>
        <PaisleyBackground opacity={0.035} speed={60} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {REVIEWS.map((review, i) => (
              <div key={review.name} className="bg-white p-8 rounded-2xl shadow-lg border transition-all duration-500 hover:translate-y-[-4px] hover:shadow-xl relative"
                style={{ borderColor: "var(--brown-100)" }}>
                {/* Quote mark */}
                <div className="absolute -top-4 left-6 h-8 w-8 flex items-center justify-center rounded-lg shadow-md text-lg font-serif text-white"
                  style={{ background: "linear-gradient(135deg, #cc7750, #974c30)" }}>&quot;</div>
                
                {/* Stars */}
                <div className="flex gap-0.5 mb-5 mt-1">
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} className="w-4 h-4" fill="#dbb55c" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>

                <p className="mb-6 leading-relaxed italic" style={{ color: "var(--brown-600)" }}>&quot;{review.quote}&quot;</p>

                <div className="pt-5 flex items-center" style={{ borderTop: "1px solid var(--brown-100)" }}>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                    style={{ background: "linear-gradient(135deg, #cc7750, #974c30)" }}>{review.initials}</div>
                  <div className="ml-3">
                    <h4 className="font-bold text-sm" style={{ color: "var(--brown-800)" }}>{review.name}</h4>
                    <p className="text-xs" style={{ color: "var(--henna-500)" }}>Verified Buyer · {review.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center relative"
        style={{ background: "linear-gradient(135deg, #2c1810 0%, #1a3a3a 50%, #1a0f09 100%)", overflowX: "clip" }}>
        <PaisleyBackground opacity={0.04} speed={50} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Join Our Family
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>
            Experience the SwaddleShawls difference for yourself and your little one.
          </p>
          <Link href="/shop" className="btn-primary px-12 py-4 text-base tracking-wide">
            Shop Collection
          </Link>
        </div>
      </section>
    </main>
  );
}
