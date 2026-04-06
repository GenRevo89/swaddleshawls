"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "SwaddleShawls";
const brandEntity = process.env.NEXT_PUBLIC_BRAND_ENTITY || "SwaddleShawls";
const isPreorder = process.env.NEXT_PUBLIC_PREORDER === "TRUE";

export default function Footer() {
  return (
    <footer className="text-white pt-12 pb-8 border-t text-[10px] uppercase tracking-widest"
      style={{ backgroundColor: "var(--brown-900)", borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 items-start">
          {/* Brand */}
          <div className="space-y-4">
            <Image src="/SwaddleShawlsLogo.png" alt={brandName} width={120} height={24} className="h-8 w-auto opacity-80" />
            <p className="leading-relaxed normal-case tracking-normal text-[11px] max-w-[220px]"
              style={{ color: "var(--brown-400)" }}>
              Pure comfort from India, handcrafted for your little ones. Traditional 100% cotton baby shawls.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold mb-4" style={{ color: "var(--gold-400)" }}>Navigation</h4>
            <ul className="space-y-2" style={{ color: "var(--brown-400)" }}>
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">{isPreorder ? "Pre-Order" : "Shop"}</Link></li>
              <li><Link href="/#heritage" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/#reviews" className="hover:text-white transition-colors">Reviews</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4" style={{ color: "var(--gold-400)" }}>Support</h4>
            <ul className="space-y-2" style={{ color: "var(--brown-400)" }}>
              <li><Link href="/#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-4" style={{ color: "var(--gold-400)" }}>Newsletter</h4>
            <p className="mb-4 normal-case tracking-normal" style={{ color: "var(--brown-400)" }}>Heritage tips &amp; new arrivals.</p>
            <form className="flex border-b focus-within:transition-colors pb-1"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
              onSubmit={(e) => { e.preventDefault(); alert("Newsletter Subscribed!"); }}>
              <input
                type="email"
                placeholder="Email"
                required
                className="bg-transparent text-[11px] w-full py-1 outline-none normal-case tracking-normal"
                style={{ color: "white" }}
              />
              <button type="submit" className="font-bold pl-4 newsletter-submit" style={{ color: "var(--gold-400)" }}>
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: "rgba(255,255,255,0.05)", color: "var(--brown-500)" }}>
          <span>© {new Date().getFullYear()} {brandEntity}</span>
          <div className="flex gap-8 italic opacity-40">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--henna-400)" }}>
                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
              </svg>
              100% Pure Cotton
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--henna-400)" }}>
                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
              </svg>
              Handcrafted in India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
