import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExitIntentModal from "@/components/ExitIntentModal";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "SwaddleShawls";
const brandTagline = process.env.NEXT_PUBLIC_BRAND_TAGLINE || "Pure Comfort from India";
const brandDesc = process.env.NEXT_PUBLIC_BRAND_DESCRIPTION || "Authentic Indian luxury for your little ones — traditional 100% cotton baby shawls, handcrafted with heritage.";
const brandUrl = process.env.NEXT_PUBLIC_BRAND_URL || "https://swaddleshawls.com";

export const metadata = {
  metadataBase: new URL(brandUrl),
  title: {
    default: `${brandName} | ${brandTagline}`,
    template: `%s | ${brandName}`
  },
  description: brandDesc,
  keywords: ["Indian cotton swaddles", "block print baby shawls", "heritage baby blankets", "luxury swaddles"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: brandName,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: {
      default: `${brandName} | ${brandTagline}`,
      template: `%s | ${brandName}`
    },
    description: brandDesc,
    url: brandUrl,
    siteName: brandName,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: `${brandName} | ${brandTagline}`,
      template: `%s | ${brandName}`
    },
    description: brandDesc,
  },
  icons: {
    icon: "/SwaddleShawlsLogo.png",
    shortcut: "/SwaddleShawlsLogo.png",
    apple: "/SwaddleShawlsLogo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: brandName,
              url: brandUrl,
              logo: `${brandUrl}/SwaddleShawlsLogo.png`,
              description: brandDesc,
            }),
          }}
        />
      </head>
      <body className={`${playfair.variable} ${lato.variable} font-sans antialiased min-h-screen flex flex-col`}
        style={{ fontFamily: "var(--font-lato), var(--font-primary)", color: "var(--brown-700)", backgroundColor: "var(--warm-cream)" }}>
        <Navbar />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
        <ExitIntentModal />
      </body>
    </html>
  );
}
