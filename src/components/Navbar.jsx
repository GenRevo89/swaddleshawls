"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "SwaddleShawls";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 w-full text-white shadow-lg border-b transition-all duration-500 ${
          scrolled
            ? "bg-[#2c1810]/95 backdrop-blur-md border-white/10"
            : "bg-[#2c1810]/80 backdrop-blur-sm border-white/5"
        }`}
        style={{ zIndex: 100000 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center group" onClick={closeMenu}>
            <div className="rounded-full border border-[var(--gold-400)]/30 p-1 transition-all duration-300 group-hover:border-[var(--gold-400)] group-hover:scale-105 shadow-md">
              <div className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] bg-white rounded-full flex items-center justify-center overflow-hidden p-[6px] shadow-sm">
                <Image
                  src="/SwaddleShawlsLogo.png"
                  alt={`${brandName} Logo`}
                  width={150}
                  height={48}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            id="menu-toggle"
            onClick={toggleMenu}
            className="md:hidden text-5xl focus:outline-none hover:text-gold-400 transition-colors z-[110] relative"
            aria-label="Toggle Navigation Menu"
          >
            <span id="menu-icon" className="text-white flex -mt-2">
              {isMobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>

          {/* Desktop Nav */}
          <nav id="menu" className="hidden md:flex items-center space-x-8">
            <Link href="/" className="nav-link text-sm font-medium hover:text-gold-400 transition-colors tracking-wide">HOME</Link>
            <Link href="/shop" className="nav-link text-sm font-medium hover:text-gold-400 transition-colors tracking-wide">SHOP</Link>
            <Link href="/#heritage" className="nav-link text-sm font-medium hover:text-gold-400 transition-colors tracking-wide">OUR STORY</Link>
            <Link href="/#faq" className="nav-link text-sm font-medium hover:text-gold-400 transition-colors tracking-wide">FAQ</Link>
            <Link href="/#reviews" className="nav-link text-sm font-medium hover:text-gold-400 transition-colors tracking-wide">REVIEWS</Link>
            <Link
              href="/portal"
              className="px-5 py-2.5 border border-white/20 rounded text-sm font-bold tracking-wider hover:bg-white/10 transition-all"
            >
              LOGIN
            </Link>
            <Link
              href="/#contact"
              className="px-5 py-2.5 rounded text-sm font-bold tracking-wider transition-all shadow-lg"
              style={{ backgroundColor: "var(--henna-500)" }}
            >
              CONTACT US
            </Link>
          </nav>
        </div>
      </header>

      {/* Full Screen Mobile Menu */}
      <div
        id="mobile-menu-overlay"
        className={`fixed inset-0 z-[2147483647] backdrop-blur-2xl transform transition-transform duration-500 ease-in-out md:hidden flex justify-center items-center overflow-y-auto ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 2147483647, backgroundColor: "rgb(26 15 9 / 0.98)" }}
      >
        <div className="w-full flex flex-col items-center py-20 px-6">
          {/* Logo */}
          <div className="mb-12 flex justify-center">
            <div className="rounded-full border border-[var(--gold-400)]/30 p-1.5 shadow-2xl">
              <div className="w-[84px] h-[84px] bg-white rounded-full flex items-center justify-center overflow-hidden p-3 shadow-inner">
                <Image src="/SwaddleShawlsLogo.png" alt={brandName} width={150} height={40} className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>

          <nav className="flex flex-col space-y-6 text-center w-full mb-12">
            <Link href="/" onClick={closeMenu} className="text-3xl font-light text-white hover:text-gold-400 transition-colors tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>Home</Link>
            <Link href="/shop" onClick={closeMenu} className="text-3xl font-light text-white hover:text-gold-400 transition-colors tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>Shop</Link>
            <Link href="/#heritage" onClick={closeMenu} className="text-3xl font-light text-white hover:text-gold-400 transition-colors tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>Our Story</Link>
            <Link href="/#faq" onClick={closeMenu} className="text-3xl font-light text-white hover:text-gold-400 transition-colors tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>FAQ</Link>
            <Link href="/#reviews" onClick={closeMenu} className="text-3xl font-light text-white hover:text-gold-400 transition-colors tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>Reviews</Link>
          </nav>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Link
              href="/portal"
              onClick={closeMenu}
              className="w-full py-5 border-2 border-white/20 rounded-full text-xl font-bold text-center text-white tracking-widest uppercase hover:bg-white/10 transition-all"
            >
              LOGIN
            </Link>
            <Link
              href="/#contact"
              onClick={closeMenu}
              className="w-full py-5 rounded-full text-xl font-bold text-center text-white tracking-widest uppercase transition-all shadow-xl border border-white/10"
              style={{ backgroundColor: "var(--henna-500)" }}
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
