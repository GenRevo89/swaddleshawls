"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";
import CouponModal from "./CouponModal";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "SwaddleShawls";
const brandEntity = process.env.NEXT_PUBLIC_BRAND_ENTITY || "SwaddleShawls";
const isPreorder = process.env.NEXT_PUBLIC_PREORDER === "TRUE";

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer className="relative text-white pt-16 pb-8 text-[10px] uppercase tracking-widest overflow-hidden"
        style={{ backgroundColor: "var(--brown-900)" }}>
        
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--henna-500)] via-[var(--gold-400)] to-[var(--terra-500)]"></div>

        {/* Subtle pattern */}
        <div className="pattern-mandala absolute inset-0"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 items-start">
            {/* Brand */}
            <div className="space-y-5">
              <Image src="/SwaddleShawlsLogoTransparent.png" alt={brandName} width={280} height={60} className="h-16 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300" />
              <p className="leading-relaxed normal-case tracking-normal text-[11px] max-w-[240px]"
                style={{ color: "var(--brown-400)" }}>
                Pure comfort from India, handcrafted for your little ones. Traditional 100% cotton baby shawls woven with heritage.
              </p>
              {/* Social hint */}
              <div className="flex gap-3 pt-2">
                {/* Instagram */}
                <a href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[var(--gold-400)] hover:border-[var(--gold-400)]/40 transition-all duration-300 hover:scale-110">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                {/* Email */}
                <a href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[var(--gold-400)] hover:border-[var(--gold-400)]/40 transition-all duration-300 hover:scale-110">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-bold mb-5" style={{ color: "var(--gold-400)" }}>Navigation</h4>
              <ul className="space-y-3" style={{ color: "var(--brown-400)" }}>
                {[
                  { href: "/", label: "Home" },
                  { href: "/shop", label: isPreorder ? "Pre-Order" : "Shop" },
                  { href: "/#heritage", label: "Our Story" },
                  { href: "/#reviews", label: "Reviews" },
                  { href: "/#faq", label: "FAQs" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group inline-flex items-center gap-2 hover:text-white transition-all duration-300">
                      <span className="w-0 h-[1px] bg-[var(--gold-400)] transition-all duration-300 group-hover:w-3"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-5" style={{ color: "var(--gold-400)" }}>Support</h4>
              <ul className="space-y-3" style={{ color: "var(--brown-400)" }}>
                {[
                  { href: "/#contact", label: "Contact Us" },
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/privacy", label: "Privacy Policy" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group inline-flex items-center gap-2 hover:text-white transition-all duration-300">
                      <span className="w-0 h-[1px] bg-[var(--gold-400)] transition-all duration-300 group-hover:w-3"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold mb-5" style={{ color: "var(--gold-400)" }}>Newsletter</h4>
              <p className="mb-5 normal-case tracking-normal text-[11px]" style={{ color: "var(--brown-400)" }}>Heritage tips, artisan stories & new arrivals — delivered beautifully.</p>
              <NewsletterForm variant="footer" onSuccess={() => setShowCouponModal(true)} />
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderColor: "rgba(255,255,255,0.05)", color: "var(--brown-500)" }}>
            <span>© {new Date().getFullYear()} {brandEntity}</span>
            <div className="flex gap-8 opacity-50">
              <span className="flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--henna-400)" }}>
                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                </svg>
                100% Pure Cotton
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--henna-400)" }}>
                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                </svg>
                Handcrafted in India
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className={`back-to-top ${showBackToTop ? "visible" : ""}`}
        aria-label="Back to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
      </button>

      {/* Global Footer Coupon Modal */}
      <CouponModal isOpen={showCouponModal} onClose={() => setShowCouponModal(false)} />
    </>
  );
}
