import React from "react";

const brandName   = process.env.NEXT_PUBLIC_BRAND_NAME   || "SurgeShop";
const brandEntity = process.env.NEXT_PUBLIC_BRAND_ENTITY || "SurgeShop, LLC";

export default function TermsAndConditions() {
  return (
    <main className="flex-grow pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">Terms and Conditions</h1>
        <p className="text-slate-600 mb-4">Last updated: February 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to {brandName}. These Terms and Conditions govern your use of our website and services. By
              accessing or using our Service, you agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">2. Disclaimer</h2>
            <p>
              The information provided on this website is for general informational purposes only and is not intended
              as professional advice. Please consult with a qualified professional for specific guidance related to
              any products or services offered on this website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">3. Purchases</h2>
            <p>
              If you wish to purchase any product or service made available through the Service, you may be asked to
              supply certain information relevant to your Purchase including, without limitation, your credit card
              number, the expiration date of your credit card, your billing address, and your shipping information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">4. Limitation of Liability</h2>
            <p>
              In no event shall {brandEntity}, nor its directors, employees, partners, agents, suppliers, or
              affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your
              access to or use of or inability to access or use the Service.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
