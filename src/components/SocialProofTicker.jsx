"use client";
import React, { useState, useEffect, useRef } from "react";

/**
 * SocialProofTicker — floating purchase notification toast
 *
 * Uses a time-seeded PRNG (Mulberry32) so the sequence is deterministic
 * per hour-window but never repeats names within a single cycle.
 * Cycles every 15–25 seconds with a slide-in/out animation.
 */

import { NAMES } from '../data/names';
import { CITIES } from '../data/cities';

// ── Product names from the actual SwaddleShawls catalog ──
const PRODUCT_NAMES = [
  "The Heritage Paisley Swaddle",
  "The Sunrise Heritage Swaddle",
  "The Golden Lotus Shawl",
  "The Jaipur Pink Peony Swaddle",
  "The Midnight Monsoon Swaddle",
  "The Varanasi Sunset Silk-Blend Swaddle",
  "The Himalayan Frost Heritage Swaddle",
  "The Kerala Monsoon Bamboo Swaddle",
  "The Royal Peacock Plum Swaddle",
  "The Agra Brick Rose Swaddle",
  "The Emerald Forest Winter Quilt",
  "The Marigold Bloom Summer Swaddle",
  "The Desert Sand Heritage Swaddle",
  "The Kashmir Valley Rose Swaddle",
  "The Lavender Madras Shawl",
  "The Simplicity Heritage Shawl",
  "The Heritage Block-Print Nursing Cover",
  "The Golden Lotus Maternity Robe",
  "The Royal Jaipur Loungewear Set",
  "The Pure White Bindi Nursing Cover",
  "The 'Ancients' Raw Brown Swaddle",
  "The Goa Sandalwood Sunset Swaddle",
];

// ── Mulberry32 PRNG (deterministic, seedable) ──
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle with seeded RNG
function seededShuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SocialProofTicker() {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const indexRef = useRef(0);
  const shuffledRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Seed = current hour (deterministic per hour window, changes every hour)
    const seed = Math.floor(Date.now() / 3600000);
    const rng = mulberry32(seed);

    // Shuffle names, cities, and products independently — then pair them
    const shuffledNames = seededShuffle(NAMES, rng);
    const shuffledCities = seededShuffle(CITIES, rng);
    const shuffledProducts = seededShuffle(PRODUCT_NAMES, rng);

    // Build randomized entries by pairing shuffled names with shuffled cities
    const count = Math.max(shuffledNames.length, shuffledCities.length);
    shuffledRef.current = Array.from({ length: count }, (_, i) => ({
      name: shuffledNames[i % shuffledNames.length],
      city: shuffledCities[i % shuffledCities.length],
      product: shuffledProducts[i % shuffledProducts.length],
      minutesAgo: Math.floor(rng() * 45) + 1, // 1–45 min ago
    }));

    indexRef.current = 0;

    const showNext = () => {
      const item = shuffledRef.current[indexRef.current % shuffledRef.current.length];
      setCurrent(item);
      setVisible(true);

      // Auto-hide after 4 seconds
      setTimeout(() => setVisible(false), 4000);

      indexRef.current++;
    };

    // First notification after 8 seconds
    const initialTimer = setTimeout(() => {
      showNext();
      // Then every 15–25 seconds
      timerRef.current = setInterval(() => {
        showNext();
      }, 15000 + Math.floor(rng() * 10000));
    }, 8000);

    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!current) return null;

  return (
    <div
      className={`fixed top-24 left-6 z-[9990] max-w-xs transition-all duration-500 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md"
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderColor: "var(--brown-100)",
        }}
      >
        {/* Cart icon */}
        <div
          className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: "var(--henna-50)", color: "var(--henna-500)" }}
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="text-[12px] leading-snug" style={{ color: "var(--brown-700)" }}>
            <strong>{current.name}</strong> from{" "}
            <strong>{current.city}</strong> just purchased
          </p>
          <p
            className="text-[11px] font-bold truncate"
            style={{ color: "var(--henna-600)" }}
          >
            {current.product}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--brown-400)" }}>
            {current.minutesAgo} min ago
          </p>
        </div>
      </div>
    </div>
  );
}
