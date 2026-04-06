import React from 'react';

export default function AuthorBox() {
  return (
    <div className="mt-16 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-center md:items-start transition-all" style={{ backgroundColor: "var(--brown-50)", border: "1px solid var(--brown-100)" }}>
      <img 
        src="/krishna.png" 
        alt="Krishna Patel" 
        className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg shrink-0 object-cover"
        style={{ border: "2px solid var(--warm-cream)" }}
      />
      <div className="flex-grow text-center md:text-left">
        <h4 className="text-xl font-bold mb-1" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
          Krishna Patel
        </h4>
        <div className="text-xs uppercase font-bold tracking-wider mb-3" style={{ color: "var(--henna-600)" }}>
          Artisanal Sourcing Director
        </div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--brown-600)" }}>
          With deep roots in generational fabric trading, Krishna bridges traditional Indian craftsmanship with modern sustainability standards. Dedicated to ethically sourced, artisanal block-printing and infant wellness.
        </p>
        <a 
          href="https://www.linkedin.com/in/krishna-patel-89039120" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
          style={{ color: "var(--brown-800)" }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          Connect on LinkedIn
        </a>
      </div>
    </div>
  );
}
