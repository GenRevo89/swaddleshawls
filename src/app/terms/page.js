import React from "react";
import Link from "next/link";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "SwaddleShawls";
const brandEntity = process.env.NEXT_PUBLIC_BRAND_ENTITY || "SwaddleShawls, LLC";
const brandEmail = process.env.NEXT_PUBLIC_BRAND_EMAIL || "support@swaddleshawls.com";

export const metadata = {
  title: `Terms of Service | ${brandName}`,
  description: `Read the Terms of Service and user agreement for ${brandName}.`
};

export default function TermsAndConditions() {
  return (
    <main className="flex-grow pt-32 pb-24 px-6 relative" style={{ backgroundColor: "var(--warm-cream)" }}>
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url(/paisley-pattern.png)", backgroundSize: "400px" }}></div>
      
      <div className="max-w-4xl mx-auto relative z-10 bg-white p-10 md:p-16 rounded-3xl shadow-xl border" style={{ borderColor: "var(--brown-100)" }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--brown-900)" }}>Terms of Service</h1>
        <p className="text-sm uppercase tracking-wider mb-12 font-bold pb-6 border-b" style={{ color: "var(--henna-500)", borderColor: "var(--brown-100)" }}>
          Last updated: May 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-base md:text-lg leading-relaxed" style={{ color: "var(--brown-700)" }}>
          
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and <strong>{brandEntity}</strong> ("Company", "we", "us", or "our"), concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
            </p>
            <p>
              You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Service. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, textile patterns, block-print designs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, international copyright laws, and international conventions.
            </p>
            <p className="mt-4">
              Except as expressly provided in these Terms of Service, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>3. Products and Safety Disclaimer</h2>
            <p>
              We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products.
            </p>
            <p className="mt-4 font-bold">
              WARNING regarding infant products: While our swaddles and blankets are crafted with the utmost care using pure cotton, parents and caregivers are solely responsible for ensuring safe sleeping environments. {brandEntity} is not liable for improper use of our products, including but not limited to suffocation hazards, overheating, or Sudden Infant Death Syndrome (SIDS) associated with unsafe swaddling or blanket usage. Always adhere to pediatrician-recommended safe sleep guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>4. Purchases and Payment</h2>
            <p>
              We accept payments via major credit cards processed securely by Stripe Inc. and BasaltSurge. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.
            </p>
            <p className="mt-4">
              Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in U.S. dollars.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>5. Limitation of Liability</h2>
            <p>
              IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE SIX (6) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>6. Dispute Resolution (Binding Arbitration & Class Action Waiver)</h2>
            <p>
              <strong>Binding Arbitration:</strong> Any dispute arising from the relationships between the Parties to this contract shall be determined by one arbitrator who will choose the rules of arbitration to govern the proceeding. The arbitration shall be seated in the jurisdiction of {brandEntity}'s incorporation.
            </p>
            <p className="mt-4">
              <strong>Class Action Waiver:</strong> The Parties agree that any arbitration or proceeding shall be limited to the Dispute between the Parties individually. To the full extent permitted by law, (a) no arbitration or proceeding shall be joined with any other; (b) there is no right or authority for any Dispute to be arbitrated or resolved on a class action-basis or to utilize class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>7. Governing Law</h2>
            <p>
              These Terms of Service and your use of the Site are governed by and construed in accordance with the laws of the State where {brandEntity} is headquartered, applicable to agreements made and to be entirely performed within the State, without regard to its conflict of law principles.
            </p>
          </section>

          <section className="bg-[var(--brown-50)] p-6 rounded-xl border border-[var(--brown-100)] mt-12">
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--brown-900)" }}>Contact Us</h2>
            <p className="text-sm">
              In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
            </p>
            <p className="text-sm font-bold mt-2" style={{ color: "var(--henna-600)" }}>{brandEmail}</p>
          </section>

        </div>
      </div>
    </main>
  );
}
