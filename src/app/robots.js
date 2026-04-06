export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BRAND_URL || "https://swaddleshawls.com";

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/portal/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
