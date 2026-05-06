import React from "react";
import Link from "next/link";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "SwaddleShawls";
const brandEntity = process.env.NEXT_PUBLIC_BRAND_ENTITY || "SwaddleShawls, LLC";
const brandEmail = process.env.NEXT_PUBLIC_BRAND_EMAIL || "support@swaddleshawls.com";

export const metadata = {
  title: `Privacy Policy | ${brandName}`,
  description: `Read the comprehensive privacy policy and data protection terms for ${brandName}.`
};

export default function PrivacyPolicy() {
  return (
    <main className="flex-grow pt-32 pb-24 px-6 relative" style={{ backgroundColor: "var(--warm-cream)" }}>
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url(/paisley-pattern.png)", backgroundSize: "400px" }}></div>
      
      <div className="max-w-4xl mx-auto relative z-10 bg-white p-10 md:p-16 rounded-3xl shadow-xl border" style={{ borderColor: "var(--brown-100)" }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--brown-900)" }}>Privacy Policy</h1>
        <p className="text-sm uppercase tracking-wider mb-12 font-bold pb-6 border-b" style={{ color: "var(--henna-500)", borderColor: "var(--brown-100)" }}>
          Last updated: May 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-base md:text-lg leading-relaxed" style={{ color: "var(--brown-700)" }}>
          
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>1. Introduction & Scope</h2>
            <p>
              Welcome to <strong>{brandEntity}</strong> ("we," "our," "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>
            <p>
              This policy is designed to comply with stringent global data protection regulations, including the California Consumer Privacy Act (CCPA), the California Privacy Rights Act (CPRA), and the General Data Protection Regulation (GDPR) for our European customers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>2. The Data We Collect About You</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[var(--gold-500)]">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier, title, and date of birth.</li>
              <li><strong>Contact Data:</strong> includes billing address, delivery address, email address, and telephone numbers.</li>
              <li><strong>Financial Data:</strong> includes payment card details (processed securely via our PCI-DSS compliant third-party payment gateways, Stripe and BasaltSurge. We do not store full credit card numbers).</li>
              <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website and products, tracked via first and third-party analytics cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>3. How We Use Your Personal Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[var(--gold-500)]">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., processing and delivering your order).</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation (e.g., tax and accounting records).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>4. Disclosures of Your Personal Data (Third-Party Processing)</h2>
            <p>
              We do not sell your personal data. We may share your personal data with trusted third parties set out below for the purposes set out in Section 3:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[var(--gold-500)]">
              <li><strong>Payment Processors:</strong> Stripe Inc. and BasaltSurge for secure financial transaction processing.</li>
              <li><strong>Logistics Partners:</strong> Couriers and fulfillment centers necessary to deliver your physical goods.</li>
              <li><strong>Analytics & Marketing Providers:</strong> Google Analytics, Meta Platforms (Facebook Pixel), Microsoft Clarity, and Pinterest to analyze website traffic, optimize your user experience, and deliver relevant advertisements.</li>
            </ul>
            <p className="mt-4">
              We require all third parties to respect the security of your personal data and to treat it in accordance with the law. We do not allow our third-party service providers to use your personal data for their own purposes and only permit them to process your personal data for specified purposes and in accordance with our instructions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>5. Data Security & Retention</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
            </p>
            <p className="mt-4">
              We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements. By law, we have to keep basic information about our customers (including Contact, Identity, Financial and Transaction Data) for six years after they cease being customers for tax purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>6. Your Legal Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[var(--gold-500)]">
              <li><strong>Request access:</strong> to your personal data (commonly known as a "data subject access request").</li>
              <li><strong>Request correction:</strong> of the personal data that we hold about you.</li>
              <li><strong>Request erasure:</strong> of your personal data ("Right to be Forgotten"). You may ask us to delete or remove personal data where there is no good reason for us continuing to process it.</li>
              <li><strong>Object to processing:</strong> of your personal data where we are relying on a legitimate interest.</li>
            </ul>
            <p className="mt-4">
              If you wish to exercise any of the rights set out above, please <Link href="/#contact" className="font-bold underline text-[var(--henna-600)] hover:text-[var(--henna-700)]">Contact Us</Link>. You will not have to pay a fee to access your personal data (or to exercise any of the other rights). However, we may charge a reasonable fee if your request is clearly unfounded, repetitive, or excessive.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--brown-900)", fontFamily: "var(--font-heading)" }}>7. CCPA & CPRA Notice for California Residents</h2>
            <p>
              If you are a California resident, the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA) provide you with specific rights regarding your personal information. You have the right to request that we disclose certain information to you about our collection and use of your personal information over the past 12 months. We do not sell your personal information.
            </p>
          </section>

          <section className="bg-[var(--brown-50)] p-6 rounded-xl border border-[var(--brown-100)] mt-12">
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--brown-900)" }}>Contact Us</h2>
            <p className="text-sm">
              If you have any questions about this Privacy Policy, please contact our Data Protection Officer (DPO) at:
            </p>
            <p className="text-sm font-bold mt-2" style={{ color: "var(--henna-600)" }}>{brandEmail}</p>
          </section>

        </div>
      </div>
    </main>
  );
}
