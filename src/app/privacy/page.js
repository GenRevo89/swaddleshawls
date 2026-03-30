import React from "react";

const brandEmail = process.env.NEXT_PUBLIC_BRAND_EMAIL || "support@example.com";

export default function PrivacyPolicy() {
  return (
    <main className="flex-grow pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">Privacy Policy</h1>
        <p className="text-slate-600 mb-4">Last updated: February 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you fill out a form, make a purchase, or
              communicate with us via third-party platforms. This includes your name, email address, phone number, and
              any preferences you choose to share.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, including to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Process your orders and manage your account.</li>
              <li>Send you technical notices, updates, security alerts, and support messages.</li>
              <li>Respond to your comments, questions, and customer service requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">3. Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized
              access, disclosure, alteration and destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at {brandEmail}.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
