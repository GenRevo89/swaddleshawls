"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "SwaddleShawls";
const isPreorder = process.env.NEXT_PUBLIC_PREORDER === "TRUE";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    // Clean up on unmount — prevents stuck scroll lock on page navigation
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/shop", label: "SHOP" },
    { href: "/journal", label: "JOURNAL" },
    { href: "/our-story", label: "OUR STORY" },
    { href: "/faq", label: "FAQ" },
    { href: "/reviews", label: "REVIEWS" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full text-white transition-all duration-500"
        style={{ 
          zIndex: 999,
          background: "linear-gradient(135deg, rgba(44,24,16,0.85) 0%, rgba(26,58,58,0.80) 50%, rgba(44,24,16,0.85) 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShift 12s ease-in-out infinite",
          backdropFilter: "blur(20px) saturate(1.6)",
          WebkitBackdropFilter: "blur(20px) saturate(1.6)",
          borderBottom: "1px solid rgba(219,181,92,0.15)",
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.15)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-2.5">
          {/* Logo */}
          <Link href="/" className="flex items-center group focus:outline-none" onClick={closeMenu}>
            <Image
              src="/SwaddleShawlsSymbolLogo.png"
              alt={`${brandName} Logo`}
              width={48}
              height={48}
              className="w-[40px] h-[40px] md:w-[46px] md:h-[46px] object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-lg"
              priority
            />
            <div className="flex flex-col ml-3">
              <span className="text-base font-bold tracking-wide" style={{ fontFamily: "var(--font-heading)", color: "var(--gold-300)" }}>SwaddleShawls</span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-medium hidden sm:block">Pure Comfort from India</span>
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            id="menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-300 hover:bg-white/10 z-[110] relative focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between relative">
              <span className={`block h-[2px] w-full bg-white rounded-full transition-all duration-500 origin-center ${isMobileMenuOpen ? 'rotate-45 translate-y-[9px]' : ''}`}></span>
              <span className={`block h-[2px] w-full bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`}></span>
              <span className={`block h-[2px] w-full bg-white rounded-full transition-all duration-500 origin-center ${isMobileMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav id="menu" className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link text-[13px] font-semibold tracking-[0.08em] transition-colors duration-300 focus:outline-none ${
                  isActive(link.href) ? "text-[var(--gold-400)] active" : "text-white/75 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Divider and Action Buttons Group */}
            <div className="flex items-center gap-4 ml-4">
              <div className="w-[1px] h-5 bg-white/15"></div>
              <div className="flex items-center gap-3">
                <Link
                  href="/portal"
                  className="px-4 py-2 border border-sky-300/30 bg-sky-900/40 backdrop-blur-md rounded-lg text-[13px] font-bold tracking-wider text-sky-50 shadow-[0_4px_20px_rgba(14,165,233,0.15)] hover:bg-sky-800/50 hover:border-sky-300/60 hover:text-white hover:shadow-[0_4px_25px_rgba(14,165,233,0.25)] transition-all duration-300 focus:outline-none"
                >
                  LOGIN
                </Link>
                <Link
                  href="/#contact"
                  className="btn-primary px-5 py-2 text-[13px] focus:outline-none"
                >
                  CONTACT US
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Full Screen Mobile Menu */}
      <div
        id="mobile-menu-overlay"
        className={`fixed inset-0 z-[2147483647] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden flex justify-center items-center overflow-y-auto ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 2147483647, backgroundColor: "rgb(26 15 9 / 0.98)" }}
      >
        <div className="w-full flex flex-col items-center py-20 px-6">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Image src="/SwaddleShawlsSymbolLogo.png" alt={brandName} width={80} height={80} className="w-[72px] h-[72px] object-contain drop-shadow-2xl" />
          </div>
          
          <span className="text-lg font-bold tracking-wide mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--gold-300)" }}>SwaddleShawls</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-medium mb-10">Pure Comfort from India</span>

          {/* Decorative divider */}
          <div className="w-28 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold-400)]/40 to-transparent mb-8"></div>

          <nav className="flex flex-col space-y-5 text-center w-full mb-12">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`mobile-link-reveal text-2xl font-light hover:text-[var(--gold-400)] transition-colors duration-300 tracking-[0.15em] uppercase focus:outline-none ${
                  isActive(link.href) ? "text-[var(--gold-400)]" : "text-white/80"
                }`}
                style={{
                  fontFamily: "var(--font-heading)",
                  animationDelay: isMobileMenuOpen ? `${i * 0.08 + 0.15}s` : "0s",
                }}
              >
                {link.label.charAt(0) + link.label.slice(1).toLowerCase()}
              </Link>
            ))}
          </nav>

          {/* Decorative divider */}
          <div className="w-28 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold-400)]/40 to-transparent mb-8"></div>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Link
              href="/portal"
              onClick={closeMenu}
              className="mobile-link-reveal w-full py-4 border-2 border-white/15 rounded-xl text-lg font-bold text-center text-white/90 tracking-widest uppercase hover:bg-white/5 hover:border-white/30 transition-all duration-300"
              style={{ animationDelay: isMobileMenuOpen ? "0.6s" : "0s" }}
            >
              LOGIN
            </Link>
            <Link
              href="/#contact"
              onClick={closeMenu}
              className="mobile-link-reveal btn-primary w-full py-4 text-lg tracking-widest"
              style={{ animationDelay: isMobileMenuOpen ? "0.7s" : "0s" }}
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
