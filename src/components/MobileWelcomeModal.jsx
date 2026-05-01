"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";
import CouponModal from "./CouponModal";

/**
 * MobileWelcomeModal — mobile-only welcome offer
 *
 * Appears immediately (with a brief delay for paint) on touch devices.
 * Offers an additional 10% off in exchange for newsletter signup.
 * Slides up from the bottom like a native mobile sheet for a natural feel.
 * Shown once per session via sessionStorage.
 */
export default function MobileWelcomeModal() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false); // controls animation state
  const [dismissed, setDismissed] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only show on mobile / touch devices
    const isMobile =
      "ontouchstart" in window ||
      window.innerWidth < 768 ||
      /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Once per session
    if (sessionStorage.getItem("ss_mobile_welcome_shown")) return;

    // Small delay so the page paints first and the animation feels intentional
    const timer = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem("ss_mobile_welcome_shown", "1");
      // Trigger entrance animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    // Wait for exit animation to finish before unmounting
    setTimeout(() => {
      setShow(false);
      setDismissed(true);
    }, 350);
  };

  const handleSuccess = () => {
    setVisible(false);
    setTimeout(() => {
      setShow(false);
      setShowCouponModal(true);
    }, 300);
  };

  if (showCouponModal) {
    return (
      <CouponModal
        isOpen={true}
        onClose={() => {
          setShowCouponModal(false);
          setDismissed(true);
        }}
      />
    );
  }

  if (!show || dismissed) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal — slides up from bottom on mobile */}
      <div
        className={`relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-[400ms] ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-full sm:translate-y-8 scale-[0.96] opacity-0"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile sheet feel */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden" style={{ backgroundColor: "var(--warm-cream, #faf7f2)" }}>
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--brown-300, #c9b69a)" }} />
        </div>

        {/* Decorative top gradient bar */}
        <div
          className="h-1 w-full hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, #3d9895, #dbb55c, #cc7750, #dbb55c, #3d9895)",
          }}
        />

        <div
          className="px-6 pb-8 pt-4 sm:p-8 sm:pt-10"
          style={{ backgroundColor: "var(--warm-cream, #faf7f2)" }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-black/5 active:scale-90"
            style={{ color: "var(--brown-400)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <Image
              src="/SwaddleShawlsSymbolLogo.png"
              alt="SwaddleShawls"
              width={48}
              height={48}
              className="h-10 sm:h-12 w-auto"
            />
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
              style={{
                background: "linear-gradient(135deg, rgba(61,152,149,0.12), rgba(219,181,92,0.12))",
                color: "var(--henna-500, #2a7070)",
                border: "1px solid rgba(61,152,149,0.2)",
              }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Limited-Time Offer
            </span>
          </div>

          {/* Headline */}
          <div className="text-center mb-5 sm:mb-6">
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2.5 leading-tight"
              style={{
                color: "var(--brown-800, #2c1810)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Welcome! Here&apos;s{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #cc7750, #974c30)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                10% Off
              </span>
            </h2>
            <p
              className="text-sm leading-relaxed max-w-xs mx-auto"
              style={{ color: "var(--brown-500, #8a7254)" }}
            >
              Sign up for our newsletter and get an{" "}
              <strong style={{ color: "var(--henna-500, #2a7070)" }}>
                extra 10% off
              </strong>{" "}
              your first order — plus early access to new arrivals and heritage artisan stories.
            </p>
          </div>

          {/* What you get */}
          <div
            className="flex items-center justify-center gap-4 text-[11px] mb-5 sm:mb-6 py-2.5 px-4 rounded-xl mx-auto max-w-xs"
            style={{
              background: "rgba(61,152,149,0.06)",
              border: "1px solid rgba(61,152,149,0.1)",
              color: "var(--brown-600, #5c3d2e)",
            }}
          >
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#3d9895]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              10% Off
            </span>
            <span className="w-px h-3 bg-current opacity-20" />
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#3d9895]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Early Access
            </span>
            <span className="w-px h-3 bg-current opacity-20" />
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#3d9895]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Free Tips
            </span>
          </div>

          {/* Newsletter Form */}
          <NewsletterForm variant="modal" onSuccess={handleSuccess} />

          {/* No-thanks link */}
          <button
            onClick={handleClose}
            className="block w-full text-center text-[11px] mt-4 transition-colors duration-200"
            style={{ color: "var(--brown-300, #c9b69a)" }}
          >
            No thanks, I&apos;ll pay full price
          </button>

          <p
            className="text-[9px] text-center mt-3 uppercase tracking-widest"
            style={{ color: "var(--brown-300, #bfae96)" }}
          >
            No spam, ever · Unsubscribe anytime
          </p>
        </div>
      </div>
    </div>
  );
}
