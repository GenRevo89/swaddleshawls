"use client";
import React from "react";
import Image from "next/image";

export default function CouponModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-opacity duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-[#faf6f0] border border-[#e0d5c5]"
        style={{ animation: "popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center relative z-10">
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-black/5"
            style={{ color: "var(--brown-400)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#cc7750] to-[#974c30] rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-2xl font-bold mb-2 font-serif" style={{ color: "var(--brown-800)" }}>
            You&apos;re on the list!
          </h3>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--brown-600)" }}>
            Thank you for joining our family. Use the code below at checkout to get <strong style={{ color: "var(--henna-600)" }}>10% off</strong> your first order.
          </p>

          <div className="bg-white border-2 border-dashed border-[#cc7750]/50 rounded-xl p-4 mb-8">
            <span className="text-3xl font-mono tracking-widest font-bold" style={{ color: "#cc7750" }}>
              NWSLTR-10
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 tracking-wide"
            style={{ backgroundColor: "var(--brown-800)" }}
          >
            Continue Shopping
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
