"use client";
import React, { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Critical Layout Error Caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 text-center" style={{ backgroundColor: "#faf6f0", color: "#4A3B32", fontFamily: "sans-serif" }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-3">Critical System Error</h2>
          <p className="text-sm text-gray-500 mb-8">
            The application failed to load correctly. Please refresh the page.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 px-6 rounded-xl text-white font-bold"
            style={{ backgroundColor: "#4A3B32" }}
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
