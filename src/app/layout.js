import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExitIntentModal from "@/components/ExitIntentModal";
import { Analytics } from "@vercel/analytics/react";

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
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "w8d7t58q6r");
            `
          }}
        />
        <meta name="facebook-domain-verification" content="x2w4a66zexkwpc1wladdmfnz029jel" />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18072236543"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'AW-18072236543');
            `
          }}
        />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '2363821174123366');
              fbq('init', '1983094425931388');
              fbq('track', 'PageView');
            `
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2363821174123366&ev=PageView&noscript=1"
          />
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1983094425931388&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className={`${playfair.variable} ${lato.variable} font-sans antialiased min-h-screen flex flex-col`}
        style={{ fontFamily: "var(--font-lato), var(--font-primary)", color: "var(--brown-700)", backgroundColor: "var(--warm-cream)" }}>
        <Navbar />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
        <ExitIntentModal />
        <Analytics />
      </body>
    </html>
  );
}
