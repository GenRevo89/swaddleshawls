"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";
import CouponModal from "./CouponModal";

export default function ExitIntentModal() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  const handleMouseLeave = useCallback((e) => {
    // Only trigger when mouse moves toward the top of the viewport (leaving)
    if (e.clientY <= 5 && !dismissed) {
      // Check if already shown this session
      if (typeof window !== "undefined" && sessionStorage.getItem("ss_exit_shown")) return;
      setShow(true);
      if (typeof window !== "undefined") sessionStorage.setItem("ss_exit_shown", "1");
    }
  }, [dismissed]);

  useEffect(() => {
    // Don't fire on mobile (no mouse leave concept)
    if (typeof window === "undefined" || "ontouchstart" in window) return;
    // Delay listener to avoid immediate trigger
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000); // Wait 5s before arming
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const handleClose = () => {
    setShow(false);
    setDismissed(true);
  };

  const handleSuccess = () => {
    setShow(false); // Hide the exit-intent form
    setShowCouponModal(true); // Show the coupon modal
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

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ animation: "modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #cc7750, #dbb55c, #3d9895)" }} />

        <div className="p-8 md:p-10" style={{ backgroundColor: "var(--warm-cream, #faf6f0)" }}>
          {/* Close button */}
          <button onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-black/5"
            style={{ color: "var(--brown-400)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image src="/SwaddleShawlsSymbolLogo.png" alt="SwaddleShawls" width={48} height={48} className="h-12 w-auto" />
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--brown-800, #2c1810)", fontFamily: "var(--font-heading)" }}>
              Wait — Don&apos;t Miss Out!
            </h2>
            <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "var(--brown-500, #8a7254)" }}>
              Join our family for exclusive early access to new collections, artisan stories, and heritage parenting tips. Plus, get <strong style={{ color: "var(--henna-500, #cc7750)" }}>10% off</strong> your first order.
            </p>
          </div>

          {/* Newsletter Form */}
          <NewsletterForm variant="modal" onSuccess={handleSuccess} />

          <p className="text-[10px] text-center mt-5 uppercase tracking-widest" style={{ color: "var(--brown-300, #bfae96)" }}>
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
