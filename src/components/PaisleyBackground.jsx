"use client";
import React from "react";

/*
  Animated Paisley Background
  Pure CSS approach — uses a tileable paisley pattern image with a slow drifting animation.
  No Math.random(), no hydration mismatches.
*/

export default function PaisleyBackground({ className = "", opacity = 0.04, speed = 60 }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0, touchAction: "none" }}
    >
      {/* Layer 1 — slow drift right+down */}
      <div
        style={{
          position: "absolute",
          inset: "-50%",
          width: "200%",
          height: "200%",
          backgroundImage: "url(/paisley-pattern.png)",
          backgroundSize: "420px 420px",
          backgroundRepeat: "repeat",
          opacity: opacity,
          animation: `paisleyPanA ${speed}s linear infinite`,
        }}
      />
      {/* Layer 2 — slow drift left+up (creates depth) */}
      <div
        style={{
          position: "absolute",
          inset: "-50%",
          width: "200%",
          height: "200%",
          backgroundImage: "url(/paisley-pattern.png)",
          backgroundSize: "300px 300px",
          backgroundRepeat: "repeat",
          opacity: opacity * 0.5,
          animation: `paisleyPanB ${speed * 1.4}s linear infinite`,
          transform: "rotate(15deg)",
        }}
      />

      <style jsx>{`
        @keyframes paisleyPanA {
          0% { transform: translate(0, 0); }
          100% { transform: translate(420px, 420px); }
        }
        @keyframes paisleyPanB {
          0% { transform: rotate(15deg) translate(0, 0); }
          100% { transform: rotate(15deg) translate(-300px, -300px); }
        }
        @media (prefers-reduced-motion: reduce) {
          div { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
