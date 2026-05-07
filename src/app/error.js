"use client";
import React, { useEffect } from "react";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: "var(--warm-cream)", color: "var(--brown-800)" }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          Oops! Something went wrong.
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--brown-500)" }}>
          We encountered an unexpected error while rendering this page. Our team has been notified.
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-3 px-6 rounded-xl text-white font-bold tracking-wide transition-transform hover:-translate-y-0.5 active:translate-y-0"
          style={{ backgroundColor: "var(--brown-800)" }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
