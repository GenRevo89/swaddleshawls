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
  title: `${brandName} | ${brandTagline}`,
  description: `${brandName} — ${brandDesc}`,
  icons: {
    icon: "/SwaddleShawlsLogo.png",
    apple: "/SwaddleShawlsLogo.png",
  },
  openGraph: {
    title: `${brandName} | ${brandTagline}`,
    description: brandDesc,
    url: brandUrl,
    siteName: brandName,
    images: [
      {
        url: "/hero_cover.png",
        width: 1200,
        height: 630,
        alt: `${brandName} — Authentic Indian Luxury for Little Ones`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${brandName} | ${brandTagline}`,
    description: brandDesc,
    images: ["/hero_cover.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
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
