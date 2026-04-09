"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import CrmContactForm from "@/components/CrmContactForm";
import PaisleyBackground from "@/components/PaisleyBackground";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "SwaddleShawls";
const isPreorder = process.env.NEXT_PUBLIC_PREORDER === "TRUE";

const FEATURED_PRODUCTS = [
  {
    name: "The Heritage Paisley Swaddle",
    image: "/The Heritage Paisley Swaddle.webp",
    description: "Rich paisley patterns inspired by centuries-old Indian textile art. A masterpiece of traditional block printing.",
  },
  {
    name: "The 'Ancients' Raw Brown Swaddle",
    image: "/The 'Ancients' Raw Brown Swaddle.webp",
    description: "Pure undyed cotton in its natural state — the gentlest embrace for newborn skin.",
  },
  {
    name: "The Simplicity Heritage Shawl",
    image: "/The Simplicity Heritage Shawl.webp",
    description: "Clean lines meet heritage craft. A teal-accented linen shawl for the minimalist parent.",
  },
  {
    name: "The Sunrise Heritage Swaddle",
    image: "/The Sunrise Heritage Swaddle.webp",
    description: "Vivid terracotta and paisley motifs evoking the warmth of an Indian sunrise.",
  },
];

/* ═══════════════════════════════════════
   Scroll-reveal hook
   ═══════════════════════════════════════ */
function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ═══════════════════════════════════════
   Wave SVG divider component
   ═══════════════════════════════════════ */
function WaveDivider({ color = "var(--warm-cream)", flip = false }) {
  return (
    <div className={`absolute ${flip ? 'top-0' : 'bottom-0'} left-0 w-full`} style={{ zIndex: 1 }}>
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, rgba(219,181,92,0.25), transparent)` }}></div>
    </div>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const heroRef = useRef(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useScrollReveal();

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Parallax on hero
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setParallaxOffset(scrollY * 0.3);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main>
      {/* ══════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════ */}
      <section ref={heroRef} id="hero" className="relative min-h-screen flex items-center justify-center text-center text-white pt-20" style={{ overflowX: "clip" }}>
        {/* Background with parallax */}
        <div className="absolute inset-0 w-full h-full z-0" style={{ transform: `translateY(${parallaxOffset}px)` }}>
          <Image
            src="/hero_cover.png"
            alt="SwaddleShawls — Authentic Indian Luxury for Little Ones"
            fill
            className="object-cover object-center scale-110"
            priority
          />
        </div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 z-[1] gradient-animate" 
          style={{ background: "linear-gradient(135deg, rgba(44,24,16,0.70) 0%, rgba(26,58,58,0.55) 30%, rgba(44,24,16,0.50) 60%, rgba(44,24,16,0.75) 100%)", backgroundSize: "300% 300%" }}>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          {/* Paisley SVG floaters */}
          <div className="absolute top-[15%] left-[8%] w-20 h-20 float-slow opacity-[0.06]" style={{ animationDelay: "0s" }}>
            <svg viewBox="0 0 80 80" fill="white"><path d="M40 10c0 16.57-13.43 30-30 30C26.57 40 40 53.43 40 70c0-16.57 13.43-30 30-30C53.43 40 40 26.57 40 10z" /></svg>
          </div>
          <div className="absolute top-[60%] right-[5%] w-16 h-16 float-medium opacity-[0.05]" style={{ animationDelay: "2s" }}>
            <svg viewBox="0 0 80 80" fill="white"><path d="M40 10c0 16.57-13.43 30-30 30C26.57 40 40 53.43 40 70c0-16.57 13.43-30 30-30C53.43 40 40 26.57 40 10z" /></svg>
          </div>
          <div className="absolute top-[80%] left-[25%] w-12 h-12 float-fast opacity-[0.04]" style={{ animationDelay: "1s" }}>
            <svg viewBox="0 0 80 80" fill="white"><path d="M40 10c0 16.57-13.43 30-30 30C26.57 40 40 53.43 40 70c0-16.57 13.43-30 30-30C53.43 40 40 26.57 40 10z" /></svg>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
          <div className="hero-reveal hero-reveal-1 inline-block px-5 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-8 border"
            style={{ backgroundColor: "rgba(219,181,92,0.12)", borderColor: "rgba(219,181,92,0.25)", color: "var(--gold-400)" }}>
            {isPreorder ? "✦  Pre-Orders Now Open  ✦" : "✦  Pure Comfort from India  ✦"}
          </div>

          <h1 className="hero-reveal hero-reveal-2 text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1] tracking-tight text-white drop-shadow-md"
            style={{ fontFamily: "var(--font-heading)" }}>
            Authentic Indian Luxury{" "}
            <span className="block text-gradient" style={{ WebkitTextFillColor: "unset", color: "var(--gold-400)" }}>for Little Ones</span>
          </h1>

          <p className="hero-reveal hero-reveal-3 text-lg md:text-xl mb-14 max-w-2xl mx-auto leading-relaxed font-light"
            style={{ color: "rgba(255,255,255,0.80)" }}>
            A legacy of pure comfort, handcrafted for the most precious moments. Traditional 100% cotton baby shawls, woven with heritage.
          </p>

          <div className="hero-reveal hero-reveal-4 flex flex-col sm:flex-row justify-center gap-5">
            <Link href="/shop" className="btn-primary px-10 py-4 text-lg tracking-wide">
              {isPreorder ? "PRE-ORDER NOW" : "SHOP COLLECTION"}
            </Link>
            <Link href="#heritage" className="btn-outline px-10 py-4 text-lg tracking-wide">
              Our Story
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="hero-reveal hero-reveal-5 mt-20 pt-8 border-t border-white/10 flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {[
              { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "100% Pure Cotton" },
              { icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", label: "Handcrafted in India" },
              { icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", label: "Certificate of Authenticity" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
                <svg className="h-6 w-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={badge.icon}></path>
                </svg>
                <span className="text-white/80 font-semibold text-xs tracking-widest uppercase">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 scroll-indicator">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-semibold">Scroll</span>
            <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>

        {/* Wave divider into next section */}
        <WaveDivider color="var(--warm-cream)" />
      </section>

      {/* ══════════════════════════════════════
          HERITAGE / OUR STORY SECTION
          ══════════════════════════════════════ */}
      <section id="heritage" className="py-28 relative" style={{ backgroundColor: "var(--warm-cream)", overflowX: "clip" }}>
        <PaisleyBackground opacity={0.035} speed={60} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="reveal stagger-1 inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-8 tracking-wider uppercase"
                style={{ backgroundColor: "var(--henna-50)", color: "var(--henna-600)" }}>
                The Art of Cotton Care
              </div>
              <h2 className="reveal stagger-2 text-4xl md:text-5xl font-bold mb-8 leading-tight"
                style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                A Heritage of{" "}
                <span style={{ color: "var(--henna-500)" }}>Pure Comfort</span>
              </h2>
              <p className="reveal stagger-3 text-lg mb-10 leading-relaxed" style={{ color: "var(--brown-500)" }}>
                At {brandName}, we believe every baby deserves to be wrapped in the same timeless elegance and gentle care that has graced generations. Inspired by the rich textile history of India, our designs feature iconic motifs like the paisley and lotus — symbolizing protection, purity, and comfort.
              </p>

              <div className="space-y-7">
                {[
                  {
                    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
                    title: "100% Pure Cotton",
                    desc: "Only the softest, breathable natural fibers — gentle on newborn skin and perfect for every season.",
                  },
                  {
                    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
                    title: "Traditional Artistry",
                    desc: "Patterns inspired by classic Indian block prints and intricate paisley designs, bringing global heritage to your nursery.",
                  },
                  {
                    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
                    title: "Certificate of Authenticity",
                    desc: "Every shawl includes a signed certificate guaranteeing traditional craftsmanship and premium materials.",
                  },
                ].map((feature, i) => (
                  <div key={feature.title} className={`reveal stagger-${i + 3} flex items-start group`}>
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl"
                      style={{ background: "linear-gradient(135deg, var(--brown-700), var(--brown-800))" }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon}></path>
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-xl font-bold" style={{ color: "var(--brown-800)" }}>{feature.title}</h3>
                      <p className="mt-2 leading-relaxed" style={{ color: "var(--brown-500)" }}>{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="reveal stagger-6 mt-10">
                <Link href="/our-story" className="btn-primary px-8 py-3.5 text-sm">
                  Read Our Full Story →
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2 reveal-right">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80">
                <Image src="/The 'Ancients' Raw Brown Swaddle.webp" alt="Baby wrapped in SwaddleShawls" width={800} height={600} className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 flex flex-col justify-end items-end p-8 text-right" style={{ background: "linear-gradient(to top, rgba(44,24,16,0.85) 0%, rgba(44,24,16,0.4) 40%, transparent 100%)" }}>
                  <h3 className="text-white text-3xl font-bold drop-shadow-md" style={{ fontFamily: "var(--font-heading)" }}>Woven with Love</h3>
                  <p className="text-xl mt-2 tracking-wide drop-shadow-sm" style={{ color: "var(--gold-400)", fontWeight: 600 }}>Since generations, from India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HERITAGE QUOTE
          ══════════════════════════════════════ */}
      <section className="py-20 relative pattern-mandala" style={{ backgroundColor: "var(--brown-100)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="reveal heritage-quote">
            From the heart of India to the arms of a mother, SwaddleShawls provides the ultimate embrace of safety and warmth.
          </div>
          <div className="reveal stagger-2 mt-6">
            <div className="section-divider"></div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED COLLECTION
          ══════════════════════════════════════ */}
      <section id="collection" className="py-28 relative" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="reveal inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wider uppercase" style={{ backgroundColor: "var(--terra-50)", color: "var(--terra-600)" }}>
              Handcrafted Collection
            </div>
            <h2 className="reveal stagger-1 text-3xl md:text-5xl font-bold mb-5 tracking-tight" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
              Our Heritage Shawls
            </h2>
            <div className="reveal stagger-2 section-divider mb-8"></div>
            <p className="reveal stagger-3 max-w-2xl mx-auto text-lg" style={{ color: "var(--brown-500)" }}>
              Each piece tells a story of tradition, crafted with the same techniques passed down through generations of Indian artisans.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURED_PRODUCTS.map((product, index) => (
              <Link key={index} href="/shop" className={`reveal stagger-${index + 1} group block h-full`}>
                <div className="heritage-card bg-white rounded-2xl overflow-hidden shadow-lg h-full flex flex-col relative">
                  {isPreorder && (
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md text-xs font-bold uppercase shadow-md tracking-wider" style={{ backgroundColor: "var(--henna-500)", color: "white" }}>
                      10% Off Preorder
                    </div>
                  )}
                  <div className="h-72 overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
                      <span className="px-5 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                        style={{ color: "var(--brown-800)" }}>
                        {isPreorder ? "Pre-Order" : "View Details"}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold mb-2" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>{product.name}</h3>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--brown-400)" }}>{product.description}</p>
                    <div className="mt-5 flex items-center gap-2 text-sm font-bold" style={{ color: "var(--henna-500)" }}>
                      <span>{isPreorder ? "Pre-Order" : "View Details"}</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="reveal text-center mt-14">
            <Link href="/shop" className="btn-primary px-12 py-4 text-base tracking-wide">
              {isPreorder ? "View Pre-Order Collection" : "View Full Collection"}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS SECTION
          ══════════════════════════════════════ */}
      <section id="reviews" className="py-28 text-white relative"
        style={{ background: "linear-gradient(135deg, #2c1810 0%, #1a3a3a 50%, #1a0f09 100%)", overflowX: "clip" }}>
        <WaveDivider color="var(--warm-cream)" flip={true} />
        <PaisleyBackground opacity={0.1} speed={55} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="reveal text-3xl md:text-5xl font-bold mb-5 tracking-tight text-white drop-shadow-lg" style={{ fontFamily: "var(--font-heading)" }}>Loved by Parents Everywhere</h2>
          <div className="reveal stagger-1 w-20 h-[3px] mx-auto mb-16 rounded-full" style={{ background: "linear-gradient(90deg, #cc7750, #dbb55c, #3d9895)" }}></div>

          <div className="grid md:grid-cols-3 gap-8 pt-6">
            {[
              {
                quote: "The Heritage Paisley Swaddle is absolutely stunning. My daughter looks like royalty in it, and the cotton is so incredibly soft. It's become our go-to for every outing. Worth every penny!",
                name: "Priyanka Sharma",
                initials: "PS",
              },
              {
                quote: "I ordered the Ancients Raw Brown Swaddle as a baby shower gift, and the packaging alone had the mother-to-be in tears. The wooden box, the certificate — it all feels so premium and special.",
                name: "Emily Martinez",
                initials: "EM",
              },
              {
                quote: "Finally, a baby product that honors our Indian heritage while being genuinely practical. The cotton quality is exceptional — breathable, soft, and holds up beautifully wash after wash.",
                name: "Rachna Krishnan",
                initials: "RK",
              },
            ].map((review, i) => (
              <div key={review.name} className={`reveal stagger-${i + 1} p-8 rounded-2xl border shadow-2xl relative transition-all duration-500 hover:translate-y-[-4px]`}
                style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.10)", backdropFilter: "blur(12px)" }}>
                <div className="absolute -top-5 left-8 h-10 w-10 flex items-center justify-center rounded-lg shadow-lg text-xl font-serif"
                  style={{ background: "linear-gradient(135deg, #cc7750, #974c30)", color: "white" }}>&quot;</div>
                <p className="mb-6 mt-3 leading-relaxed italic text-[15px]" style={{ color: "rgba(255,255,255,0.85)" }}>&quot;{review.quote}&quot;</p>
                <div className="pt-5 flex items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, #cc7750, #974c30)", color: "white" }}>{review.initials}</div>
                  <div className="ml-3 text-left">
                    <h4 className="font-bold text-white text-sm">{review.name}</h4>
                    <p className="text-xs" style={{ color: "#dbb55c" }}>Verified Buyer</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, si) => (
                      <svg key={si} className="w-3.5 h-3.5" fill="#dbb55c" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal mt-14">
            <Link href="/reviews" className="btn-outline px-10 py-3.5 text-sm">
              Read All Reviews →
            </Link>
          </div>
        </div>

        <WaveDivider color="var(--warm-cream)" />
      </section>

      {/* ══════════════════════════════════════
          FAQ SECTION
          ══════════════════════════════════════ */}
      <section id="faq" className="py-28 relative" style={{ backgroundColor: "var(--warm-cream)", overflowX: "clip" }}>
        <PaisleyBackground opacity={0.03} speed={70} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-20 md:items-center items-start">
            <div>
              <h2 className="reveal text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                Frequently Asked Questions
              </h2>
              <div className="reveal stagger-1 section-divider mb-8" style={{ margin: "0" }}></div>
              <p className="reveal stagger-2 text-lg mb-12" style={{ color: "var(--brown-500)" }}>Everything you need to know about our handcrafted shawls, care instructions, and ordering.</p>
              <div className="reveal stagger-3 relative rounded-2xl overflow-hidden shadow-2xl aspect-square md:aspect-[4/3]" style={{ backgroundColor: "var(--brown-50)" }}>
                <Image src="/The Heritage Paisley Swaddle2.webp" alt="Heritage Paisley Detail" width={600} height={450} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 flex items-end p-8" style={{ background: "linear-gradient(to top, rgba(44,24,16,0.7) 0%, transparent 50%)" }}>
                  <div className="text-white">
                    <div className="font-bold text-2xl" style={{ fontFamily: "var(--font-heading)" }}>Heritage Craftsmanship</div>
                    <div style={{ color: "var(--gold-400)" }}>Every detail matters</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What materials are used in your shawls?",
                  a: "All SwaddleShawls are made from 100% pure cotton, sourced from India's finest textile regions. Our fabrics are naturally breathable, hypoallergenic, and gentle on even the most sensitive newborn skin. We use no synthetic blends — ever.",
                },
                {
                  q: "How do I care for my SwaddleShawl?",
                  a: "Machine wash cold on a gentle cycle with mild detergent. Lay flat to dry for best results, or tumble dry on low heat. The colors are set with natural dyes and will soften beautifully with each wash while retaining their vibrancy.",
                },
                {
                  q: "What sizes are available?",
                  a: 'Our swaddles measure approximately 47" × 47" (120cm × 120cm), the ideal size for swaddling newborns and wrapping toddlers. Our heritage shawls are larger at 55" × 35" (140cm × 90cm), perfect as a nursing cover or stroller blanket.',
                },
                {
                  q: "Do you offer gift packaging?",
                  a: "Absolutely! Every SwaddleShawl arrives in our signature eco-friendly packaging — a beautifully printed keepsake box with a drawstring muslin pouch and a signed Certificate of Authenticity. It's gift-ready straight out of the box.",
                },
                {
                  q: "Do you ship internationally?",
                  a: "Yes! We ship worldwide. Standard shipping typically takes 5-10 business days depending on your location. Expedited options are available at checkout. All orders include tracking.",
                },
              ].map((faq, index) => (
                <div key={index} className={`reveal stagger-${Math.min(index + 1, 5)} rounded-xl overflow-hidden transition-all duration-500 group`}
                  style={{ border: "1px solid var(--brown-200)" }}>
                  <button onClick={() => toggleFaq(index)} className="w-full flex items-center justify-between p-6 bg-white transition-all duration-300 text-left focus:outline-none hover:bg-[var(--brown-50)] group"
                    style={{ fontFamily: "var(--font-heading)" }}>
                    <span className="font-bold text-lg pr-4" style={{ color: "var(--brown-800)" }}>{faq.q}</span>
                    <span className={`text-2xl font-light transform transition-transform duration-500 flex-shrink-0 ${openFaq === index ? 'rotate-45' : ''}`}
                      style={{ color: "var(--henna-500)" }}>+</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${openFaq === index ? 'max-h-[500px]' : 'max-h-0'}`}
                    style={{ backgroundColor: "var(--brown-50)" }}>
                    <div className="p-6 pt-2 leading-relaxed" style={{ color: "var(--brown-500)" }}>
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}

              <div className="reveal mt-10 rounded-2xl p-8 border text-center glass-card" style={{ borderColor: "var(--brown-100)" }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>Still have questions?</h3>
                <p className="mb-6" style={{ color: "var(--brown-500)" }}>Can&apos;t find the answer you&apos;re looking for? We&apos;d love to help.</p>
                <Link href="/faq" className="inline-block mb-3 text-sm font-bold transition-colors duration-300" style={{ color: "var(--henna-500)" }}>
                  View All FAQs →
                </Link>
                <br />
                <Link href="#contact" className="btn-primary px-8 py-3 text-sm">
                  Get In Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CrmContactForm
        heading="Let Us Help You"
        subtitle="Whether it's a custom design, wholesale inquiry, or finding the perfect gift — we're here for you."
      />
    </main>
  );
}
