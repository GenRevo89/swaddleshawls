"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CrmContactForm from "@/components/CrmContactForm";

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

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    const benefitCards = document.querySelectorAll('.benefit-card');
    if (benefitCards.length > 0) {
      const observerOptions = { threshold: 0.2, rootMargin: '0px 0px -50px 0px' };
      const benefitCardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const delay = index * 200;
            setTimeout(() => {
              entry.target.classList.remove('opacity-0');
              entry.target.classList.add('opacity-100');
              entry.target.style.transform = 'translateY(0)';
              entry.target.style.transition = 'all 0.6s ease-out';
            }, delay);
            benefitCardObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);

      benefitCards.forEach((card, index) => {
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        card.style.transitionDelay = `${index * 0.1}s`;
        card.classList.add('opacity-0');
        benefitCardObserver.observe(card);
      });
    }
  }, []);

  return (
    <main>
      {/* ══════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center text-center text-white overflow-hidden pt-20">
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/hero_cover.png"
            alt="SwaddleShawls — Authentic Indian Luxury for Little Ones"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(44,24,16,0.65) 0%, rgba(44,24,16,0.45) 50%, rgba(44,24,16,0.75) 100%)" }}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-8 border"
            style={{ backgroundColor: "rgba(200,149,76,0.15)", borderColor: "rgba(200,149,76,0.3)", color: "var(--gold-400)" }}>
            {isPreorder ? "Pre-Orders Now Open" : "Pure Comfort from India"}
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight text-white drop-shadow-md"
            style={{ fontFamily: "var(--font-heading)" }}>
            Authentic Indian Luxury{" "}
            <span className="block" style={{ color: "var(--gold-400)" }}>for Little Ones</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium opacity-90"
            style={{ color: "var(--brown-200)" }}>
            A legacy of pure comfort, handcrafted for the most precious moments. Traditional 100% cotton baby shawls, woven with heritage.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/shop"
              className="text-white border-2 px-8 py-4 rounded hover:opacity-90 transition-all duration-300 shadow-xl text-lg font-bold tracking-wide uppercase"
              style={{ backgroundColor: "var(--henna-500)", borderColor: "var(--henna-500)" }}>
              {isPreorder ? "PRE-ORDER NOW" : "SHOP COLLECTION"}
            </Link>
            <Link href="#heritage"
              className="bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded hover:bg-white hover:text-[var(--brown-800)] transition-all duration-300 shadow-xl text-lg font-bold tracking-wide uppercase">
              Our Story
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            <div className="flex items-center gap-3">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-white font-bold text-sm tracking-widest uppercase">100% Pure Cotton</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
              </svg>
              <span className="text-white font-bold text-sm tracking-widest uppercase">Handcrafted in India</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
              <span className="text-white font-bold text-sm tracking-widest uppercase">Certificate of Authenticity</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HERITAGE / OUR STORY SECTION
          ══════════════════════════════════════ */}
      <section id="heritage" className="py-24 relative overflow-hidden" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="absolute top-0 right-0 w-1/3 h-full -skew-x-12 opacity-30 pointer-events-none" style={{ backgroundColor: "var(--brown-100)" }}></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 benefit-card">
              <div className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-6 tracking-wider uppercase"
                style={{ backgroundColor: "var(--henna-50)", color: "var(--henna-600)" }}>
                The Art of Cotton Care
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                A Heritage of{" "}
                <span style={{ color: "var(--henna-500)" }}>Pure Comfort</span>
              </h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: "var(--brown-500)" }}>
                At {brandName}, we believe every baby deserves to be wrapped in the same timeless elegance and gentle care that has graced generations. Inspired by the rich textile history of India, our designs feature iconic motifs like the paisley and lotus — symbolizing protection, purity, and comfort.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: "var(--brown-800)" }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-xl font-bold" style={{ color: "var(--brown-800)" }}>100% Pure Cotton</h3>
                    <p className="mt-2" style={{ color: "var(--brown-500)" }}>Only the softest, breathable natural fibers — gentle on newborn skin and perfect for every season.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: "var(--brown-800)" }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-xl font-bold" style={{ color: "var(--brown-800)" }}>Traditional Artistry</h3>
                    <p className="mt-2" style={{ color: "var(--brown-500)" }}>Patterns inspired by classic Indian block prints and intricate paisley designs, bringing global heritage to your nursery.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: "var(--brown-800)" }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-xl font-bold" style={{ color: "var(--brown-800)" }}>Certificate of Authenticity</h3>
                    <p className="mt-2" style={{ color: "var(--brown-500)" }}>Every shawl includes a signed certificate guaranteeing traditional craftsmanship and premium materials.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 benefit-card">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <Image src="/The 'Ancients' Raw Brown Swaddle.webp" alt="Baby wrapped in SwaddleShawls" width={800} height={600} className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 flex flex-col justify-end items-end p-8 text-right" style={{ background: "linear-gradient(to top, rgba(44,24,16,0.85) 0%, rgba(44,24,16,0.5) 40%, transparent 100%)" }}>
                  <h3 className="text-white text-3xl font-bold drop-shadow-md" style={{ fontFamily: "var(--font-heading)" }}>Woven with Love</h3>
                  <p className="text-xl mt-2 tracking-wide drop-shadow-sm" style={{ color: "var(--gold-400)", fontWeight: 600 }}>Since generations, from India</p>
                </div>
              </div>

              <div className="hidden lg:flex absolute -top-6 left-4 bg-white p-6 rounded-xl shadow-xl items-center gap-4 max-w-xs z-20" style={{ border: "1px solid var(--brown-100)" }}>
                <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl" style={{ backgroundColor: "var(--terra-50)", color: "var(--terra-600)" }}>
                  ❤
                </div>
                <div>
                  <div className="font-bold text-lg" style={{ color: "var(--brown-800)" }}>Loved by Parents</div>
                  <div className="text-sm" style={{ color: "var(--brown-400)" }}>Trusted Worldwide</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HERITAGE QUOTE
          ══════════════════════════════════════ */}
      <section className="py-16" style={{ backgroundColor: "var(--brown-100)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="heritage-quote">
            From the heart of India to the arms of a mother, SwaddleShawls provides the ultimate embrace of safety and warmth.
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED COLLECTION
          ══════════════════════════════════════ */}
      <section id="collection" className="py-24" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-6 tracking-wider uppercase" style={{ backgroundColor: "var(--terra-50)", color: "var(--terra-600)" }}>
              Handcrafted Collection
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
              Our Heritage Shawls
            </h2>
            <div className="section-divider mb-6"></div>
            <p className="max-w-2xl mx-auto text-lg" style={{ color: "var(--brown-500)" }}>
              Each piece tells a story of tradition, crafted with the same techniques passed down through generations of Indian artisans.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURED_PRODUCTS.map((product, index) => (
              <Link key={index} href="/shop" className="group block h-full">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border h-full flex flex-col relative" style={{ borderColor: "var(--brown-100)" }}>
                  {isPreorder && (
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md text-xs font-bold uppercase shadow-md tracking-wider" style={{ backgroundColor: "var(--henna-500)", color: "white" }}>
                      10% Off Preorder Special
                    </div>
                  )}
                  <div className="h-72 overflow-hidden flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold mb-2" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>{product.name}</h3>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--brown-400)" }}>{product.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold" style={{ color: "var(--henna-500)" }}>
                      <span>{isPreorder ? "Pre-Order" : "View Details"}</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/shop" className="inline-block text-white font-bold px-10 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transform tracking-wide uppercase"
              style={{ backgroundColor: "var(--henna-500)" }}>
              {isPreorder ? "View Pre-Order Collection" : "View Full Collection"}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS SECTION
          ══════════════════════════════════════ */}
      <section id="reviews" className="py-24 text-white" style={{ backgroundColor: "var(--brown-800)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>Loved by Parents Everywhere</h2>
          <div className="section-divider mb-16" style={{ background: "linear-gradient(90deg, var(--terra-400), var(--gold-400), var(--henna-400))" }}></div>

          <div className="grid md:grid-cols-3 gap-8 pt-10">
            <div className="p-8 rounded-2xl border hover:transition-colors shadow-2xl relative"
              style={{ backgroundColor: "var(--brown-700)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="absolute -top-6 left-8 h-12 w-12 flex items-center justify-center rounded-lg shadow-lg text-2xl font-serif" style={{ backgroundColor: "var(--terra-500)" }}>&quot;</div>
              <p className="mb-6 mt-4 leading-relaxed italic" style={{ color: "var(--brown-300)" }}>&quot;The Heritage Paisley Swaddle is absolutely stunning. My daughter looks like royalty in it, and the cotton is so incredibly soft. It&apos;s become our go-to for every outing. Worth every penny!&quot;</p>
              <div className="pt-6 flex items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold" style={{ background: "linear-gradient(135deg, var(--terra-400), var(--terra-600))", color: "var(--brown-800)" }}>PS</div>
                <div className="ml-3 text-left">
                  <h4 className="font-bold text-white">Priyanka Sharma</h4>
                  <p className="text-sm" style={{ color: "var(--gold-400)" }}>Verified Buyer</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border shadow-2xl relative mt-8 md:mt-0"
              style={{ backgroundColor: "var(--brown-700)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="absolute -top-6 left-8 h-12 w-12 flex items-center justify-center rounded-lg shadow-lg text-2xl font-serif" style={{ backgroundColor: "var(--terra-500)" }}>&quot;</div>
              <p className="mb-6 mt-4 leading-relaxed italic" style={{ color: "var(--brown-300)" }}>&quot;I ordered the Ancients Raw Brown Swaddle as a baby shower gift, and the packaging alone had the mother-to-be in tears. The wooden box, the certificate — it all feels so premium and special.&quot;</p>
              <div className="pt-6 flex items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold" style={{ background: "linear-gradient(135deg, var(--terra-400), var(--terra-600))", color: "var(--brown-800)" }}>EM</div>
                <div className="ml-3 text-left">
                  <h4 className="font-bold text-white">Emily Martinez</h4>
                  <p className="text-sm" style={{ color: "var(--gold-400)" }}>Verified Buyer</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border shadow-2xl relative mt-8 md:mt-0"
              style={{ backgroundColor: "var(--brown-700)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="absolute -top-6 left-8 h-12 w-12 flex items-center justify-center rounded-lg shadow-lg text-2xl font-serif" style={{ backgroundColor: "var(--terra-500)" }}>&quot;</div>
              <p className="mb-6 mt-4 leading-relaxed italic" style={{ color: "var(--brown-300)" }}>&quot;Finally, a baby product that honors our Indian heritage while being genuinely practical. The cotton quality is exceptional — breathable, soft, and holds up beautifully wash after wash.&quot;</p>
              <div className="pt-6 flex items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold" style={{ background: "linear-gradient(135deg, var(--terra-400), var(--terra-600))", color: "var(--brown-800)" }}>RK</div>
                <div className="ml-3 text-left">
                  <h4 className="font-bold text-white">Rachna Krishnan</h4>
                  <p className="text-sm" style={{ color: "var(--gold-400)" }}>Verified Buyer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ SECTION
          ══════════════════════════════════════ */}
      <section id="faq" className="py-24" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 md:items-center items-start">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
                Frequently Asked Questions
              </h2>
              <div className="section-divider mb-6" style={{ margin: "0" }}></div>
              <p className="text-lg mb-10" style={{ color: "var(--brown-500)" }}>Everything you need to know about our handcrafted shawls, care instructions, and ordering.</p>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-square md:aspect-[4/3]" style={{ backgroundColor: "var(--brown-50)" }}>
                <Image src="/The Heritage Paisley Swaddle2.webp" alt="Heritage Paisley Detail" width={600} height={450} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-end p-8" style={{ background: "linear-gradient(to top, rgba(44,24,16,0.6) 0%, transparent 50%)" }}>
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
                  a: "Our swaddles measure approximately 47\" × 47\" (120cm × 120cm), the ideal size for swaddling newborns and wrapping toddlers. Our heritage shawls are larger at 55\" × 35\" (140cm × 90cm), perfect as a nursing cover or stroller blanket.",
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
                <div key={index} className="rounded-xl overflow-hidden hover:transition-colors" style={{ border: "1px solid var(--brown-200)" }}>
                  <button onClick={() => toggleFaq(index)} className="w-full flex items-center justify-between p-6 bg-white transition-colors text-left focus:outline-none"
                    style={{ fontFamily: "var(--font-heading)" }}>
                    <span className="font-bold text-lg" style={{ color: "var(--brown-800)" }}>{faq.q}</span>
                    <span className={`text-2xl font-light transform transition-transform duration-300 ${openFaq === index ? 'rotate-45' : ''}`} style={{ color: "var(--henna-500)" }}>+</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-[500px]' : 'max-h-0'}`} style={{ backgroundColor: "var(--brown-50)" }}>
                    <div className="p-6 pt-0" style={{ color: "var(--brown-500)" }}>
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-8 rounded-2xl p-8 border text-center" style={{ backgroundColor: "var(--brown-50)", borderColor: "var(--brown-100)" }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>Still have questions?</h3>
                <p className="mb-6" style={{ color: "var(--brown-500)" }}>Can&apos;t find the answer you&apos;re looking for? We&apos;d love to help.</p>
                <Link href="#contact" className="inline-block px-6 py-3 text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                  style={{ backgroundColor: "var(--henna-500)" }}>
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
