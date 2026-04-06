"use client";
import React from 'react';

export default function InlineProductAd({ productId, title, subtitle, image, price }) {
  return (
    <div 
      className="my-10 w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-lg flex flex-col sm:flex-row group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1" 
      style={{ backgroundColor: "white", border: "1px solid var(--brown-100)" }} 
      onClick={() => window.location.href='/shop'}
    >
      <div className="w-full sm:w-2/5 aspect-video sm:aspect-auto sm:h-auto overflow-hidden relative">
        <img 
          src={image} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--henna-600)" }}>
          Featured
        </div>
      </div>
      <div className="w-full sm:w-3/5 p-6 md:p-8 flex flex-col justify-center">
        <h4 className="text-xl md:text-2xl font-bold mb-2" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>{title}</h4>
        <p className="text-sm line-clamp-2 md:line-clamp-3 mb-6 leading-relaxed" style={{ color: "var(--brown-500)" }}>{subtitle}</p>
        <div className="mt-auto flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--brown-100)" }}>
          <span className="font-bold text-xl md:text-2xl" style={{ color: "var(--henna-600)"}}>{price}</span>
          <button className="px-5 py-2.5 rounded-full text-xs font-bold text-white uppercase tracking-wider transition-colors shadow-md hover:bg-emerald-600" style={{ backgroundColor: "var(--brown-800)" }}>
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}
