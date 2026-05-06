import React from "react";
import Link from "next/link";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "SwaddleShawls";
const brandEmail = process.env.NEXT_PUBLIC_BRAND_EMAIL || "support@swaddleshawls.com";

export const metadata = {
  title: `Return & Refund Policy | ${brandName}`,
  description: `Read the 30-day return and refund policy for ${brandName}.`
};

export default function RefundsPolicy() {
  return (
    <main className="flex-grow pt-32 pb-24 px-6 relative" style={{ backgroundColor: "var(--warm-cream)" }}>
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url(/paisley-pattern.png)", backgroundSize: "400px" }}></div>
      
      <div className="max-w-4xl mx-auto relative z-10 bg-white p-10 md:p-16 rounded-3xl shadow-xl border" style={{ borderColor: "var(--brown-100)" }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--brown-900)" }}>Return & Refund Policy</h1>
        <p className="text-sm uppercase tracking-wider mb-12 font-bold pb-6 border-b" style={{ color: "var(--henna-500)", borderColor: "var(--brown-100)" }}>
          Effective Date: May 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-base md:text-lg leading-relaxed" style={{ color: "var(--brown-700)" }}>
          
          <section>
            <p className="lead font-bold text-xl" style={{ color: "var(--brown-800)" }}>
              At {brandName}, we stand behind the exceptional quality and craftsmanship of our pure cotton block-print textiles. We want you and your little one to be completely in love with your purchase. 
            </p>
            <p>
              If for any reason you are not entirely satisfied, we offer a strict 30-day return policy for eligible items. Due to the sensitive nature of infant and maternity products, please read our hygiene and condition requirements carefully before initiating a return.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>1. 30-Day Return Window</h2>
            <p>
              You have thirty (30) days from the date of delivery to request a Return Merchandise Authorization (RMA) and ship the item back to us. Returns initiated after this 30-day window will not be accepted or refunded.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>2. Strict Condition Requirements (Infant Safety)</h2>
            <p>
              For the health, safety, and hygiene of the infants who use our products, we enforce strict condition requirements for all returns. To be eligible for a full refund, the item <strong>must</strong> be:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[var(--gold-500)]">
              <li><strong>Unwashed and Unworn:</strong> The item cannot have been washed, worn, or used in any capacity.</li>
              <li><strong>Scent-Free:</strong> The item must be free of any perfumes, detergents, smoke, or other household odors.</li>
              <li><strong>Original Packaging:</strong> The item must be in its original, undamaged packaging with all tags still attached.</li>
              <li><strong>Certificate of Authenticity:</strong> The original Certificate of Authenticity must be included in the return package.</li>
            </ul>
            <p className="mt-4 italic text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
              *If an item is returned to us and fails our inspection (e.g., shows signs of washing, wear, or carries odors), the return will be rejected and the item will be shipped back to you at your expense. No refund will be issued.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>3. Non-Refundable Items</h2>
            <p>The following items are final sale and cannot be returned or exchanged:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[var(--gold-500)]">
              <li>Gift cards</li>
              <li>Items marked as "Final Sale" or purchased during a clearance event</li>
              <li>Customized, monogrammed, or personalized items</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>4. How to Initiate a Return</h2>
            <p>To start the return process, please follow these steps:</p>
            <ol className="list-decimal pl-6 space-y-3 mt-4 font-bold" style={{ color: "var(--brown-900)" }}>
              <li>
                <span className="font-normal" style={{ color: "var(--brown-700)" }}>Email our support team at <a href={`mailto:${brandEmail}`} className="text-[var(--henna-600)] underline">{brandEmail}</a> with your Order Number and the reason for the return.</span>
              </li>
              <li>
                <span className="font-normal" style={{ color: "var(--brown-700)" }}>Our team will review your request. If eligible, we will issue you a Return Merchandise Authorization (RMA) number and provide the shipping address for our returns center.</span>
              </li>
              <li>
                <span className="font-normal" style={{ color: "var(--brown-700)" }}>Pack the item securely, including the original packing slip and the RMA number clearly written on the outside of the package.</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>5. Shipping Costs & Restocking Fees</h2>
            <p>
              <strong>Return Shipping:</strong> Customers are responsible for paying their own shipping costs for returning items, unless the item arrived defective or incorrect. Original shipping costs are non-refundable. We highly recommend using a trackable shipping service or purchasing shipping insurance, as we cannot guarantee that we will receive your returned item.
            </p>
            <p className="mt-4">
              <strong>Restocking Fee:</strong> We do not charge a restocking fee for items returned in perfect condition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>6. Processing Refunds</h2>
            <p>
              Once your return is received and inspected by our warehouse team, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed and a credit will automatically be applied to your original method of payment within 5-10 business days.
            </p>
          </section>

          <section className="bg-[var(--brown-50)] p-6 rounded-xl border border-[var(--brown-100)] mt-12">
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--brown-900)" }}>Need Assistance?</h2>
            <p className="text-sm">
              If you have any questions regarding your order or our return policy, please don't hesitate to reach out:
            </p>
            <p className="text-sm font-bold mt-2" style={{ color: "var(--henna-600)" }}>{brandEmail}</p>
          </section>

        </div>
      </div>
    </main>
  );
}
