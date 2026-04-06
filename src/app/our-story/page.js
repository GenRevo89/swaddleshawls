"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import PaisleyBackground from "@/components/PaisleyBackground";

export default function OurStoryPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative pt-36 pb-24 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2c1810 0%, #1a3a3a 50%, #1a0f09 100%)" }}>
        <PaisleyBackground opacity={0.04} speed={55} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-block px-5 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-8 border"
            style={{ backgroundColor: "rgba(219,181,92,0.12)", borderColor: "rgba(219,181,92,0.25)", color: "#dbb55c" }}>
            ✦ Since Generations ✦
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Our Story
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
            A legacy of pure comfort, handcrafted for the most precious moments in life.
          </p>
        </div>
      </section>

      {/* Origin Story — Meet Karishma */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "var(--warm-cream)" }}>
        <PaisleyBackground opacity={0.035} speed={60} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-wider uppercase"
                style={{ backgroundColor: "var(--henna-50)", color: "var(--henna-600)" }}>
                Meet Our Founder
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                Born from a Mother&apos;s Love
              </h2>
              <div className="space-y-6 text-lg leading-relaxed" style={{ color: "var(--brown-600)" }}>
                <p>
                  <strong style={{ color: "var(--brown-800)" }}>Karishma Bhutani</strong> grew up surrounded by the rich textile traditions of India — the magnificent paisley patterns, the impossibly soft hand-loomed cottons, the shawls that told stories of generations past. These fabrics were more than cloth; they were family heirlooms, carrying the warmth and wisdom of her heritage.
                </p>
                <p>
                  When Karishma became a mother to her daughter <strong style={{ color: "var(--brown-800)" }}>Chandra</strong>, she did what any new parent does — she stocked up on swaddles. Hospital blankets, store-bought wraps, highly-rated synthetics. Nothing felt right. Nothing felt like <em>home</em>.
                </p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image src="/Karishma.jpeg" alt="Karishma Bhutani — Founder of SwaddleShawls" width={800} height={900} className="w-full h-auto object-cover" />
              <div className="absolute inset-0 flex items-end p-8" style={{ background: "linear-gradient(to top, rgba(44,24,16,0.85) 0%, rgba(44,24,16,0.3) 40%, transparent 70%)" }}>
                <div className="text-white">
                  <div className="font-bold text-2xl" style={{ fontFamily: "var(--font-heading)" }}>Karishma Bhutani</div>
                  <div style={{ color: "#dbb55c" }}>Founder, SwaddleShawls</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Discovery — Chandra's Story */}
      <section className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2c1810 0%, #1a3a3a 50%, #1a0f09 100%)" }}>
        <PaisleyBackground opacity={0.06} speed={50} />
        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-wider uppercase border"
              style={{ backgroundColor: "rgba(219,181,92,0.12)", borderColor: "rgba(219,181,92,0.25)", color: "#dbb55c" }}>
              The Moment Everything Changed
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: "var(--font-heading)" }}>
              A Shawl, a Baby, a Miracle
            </h2>
            <div className="w-20 h-[3px] mx-auto rounded-full" style={{ background: "linear-gradient(90deg, #cc7750, #dbb55c, #3d9895)" }}></div>
          </div>

          <div className="space-y-8 text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.80)" }}>
            <p>
              One restless evening, when nothing seemed to soothe little Chandra, Karishma reached for the only thing she hadn&apos;t tried — one of her own traditional Indian shawls. A soft, hand-woven cotton piece her mother had given her, rich with the intricate paisley patterns of her homeland.
            </p>
            <p>
              She wrapped Chandra in it gently, and something extraordinary happened.
            </p>
            <p className="text-xl font-medium text-white text-center py-6" style={{ fontFamily: "var(--font-heading)" }}>
              &ldquo;Chandra calmed down <em>immediately</em>. It was like the shawl knew exactly what she needed.&rdquo;
            </p>
            <p>
              Karishma tested it again and again. Every time she swaddled Chandra in the traditional shawl instead of the hospital blankets or the synthetic store-bought wraps, the effect was the same — almost <em>miraculous</em>. The pure cotton breathed with her baby&apos;s skin. The familiar weight and texture created an embrace that felt ancient and instinctive. Chandra would settle, her breathing would slow, and peace would wash over the room.
            </p>
            <p>
              It wasn&apos;t magic — it was <strong className="text-white">heritage</strong>. Generations of Indian mothers had known what modern manufacturers had forgotten: that the best comfort comes from pure, natural materials treated with intention and crafted with love.
            </p>
            <p>
              That evening, SwaddleShawls was born. Karishma made it her mission to bring the same transformative comfort to every parent and every baby — authentic Indian cotton, traditional craftsmanship, and the kind of softness that turns fussy nights into peaceful ones.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 relative overflow-hidden"
        style={{ backgroundColor: "var(--warm-cream)" }}>
        <PaisleyBackground opacity={0.03} speed={50} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
              Our Values
            </h2>
            <div className="w-20 h-[3px] mx-auto rounded-full" style={{ background: "linear-gradient(90deg, #cc7750, #dbb55c, #3d9895)" }}></div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
                title: "100% Pure Cotton",
                desc: "We source only the finest cotton from India's premier textile regions. No synthetic blends, no shortcuts — just pure, breathable comfort that's gentle on even the most sensitive newborn skin."
              },
              {
                icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
                title: "Artisan Craftsmanship",
                desc: "Every shawl is crafted by skilled artisans using traditional Indian techniques — from hand-block printing to intricate paisley weaving. These aren't just products; they're works of art."
              },
              {
                icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
                title: "Certified Authenticity",
                desc: "Every SwaddleShawl comes with a signed Certificate of Authenticity, guaranteeing traditional craftsmanship and premium materials. Gift-ready in our signature keepsake packaging."
              },
            ].map((value) => (
              <div key={value.title} className="p-8 rounded-2xl text-center transition-all duration-500 hover:translate-y-[-4px] bg-white shadow-lg"
                style={{ border: "1px solid var(--brown-100)" }}>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #cc7750, #974c30)" }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={value.icon}></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>{value.title}</h3>
                <p className="leading-relaxed text-[15px]" style={{ color: "var(--brown-500)" }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center relative overflow-hidden" style={{ backgroundColor: "var(--warm-cream)" }}>
        <PaisleyBackground opacity={0.03} speed={65} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
            Ready to Experience the Difference?
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: "var(--brown-500)" }}>
            Discover our handcrafted collection and wrap your little one in authentic Indian luxury.
          </p>
          <Link href="/shop" className="btn-primary px-12 py-4 text-base tracking-wide">
            Shop Collection
          </Link>
        </div>
      </section>
    </main>
  );
}
