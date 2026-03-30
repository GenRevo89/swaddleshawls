// ── SwaddleShawls Brand Configuration ──
// All white-label branding is driven from environment variables.
// NEXT_PUBLIC_* vars are inlined at build time for client components.
// Server-only vars (no NEXT_PUBLIC_ prefix) stay on the server.

export const brand = {
  name:        process.env.NEXT_PUBLIC_BRAND_NAME        || "SwaddleShawls",
  tagline:     process.env.NEXT_PUBLIC_BRAND_TAGLINE     || "Pure Comfort from India",
  description: process.env.NEXT_PUBLIC_BRAND_DESCRIPTION || "Authentic Indian luxury for your little ones — traditional 100% cotton baby shawls, handcrafted with heritage.",
  url:         process.env.NEXT_PUBLIC_BRAND_URL          || "https://swaddleshawls.com",
  entity:      process.env.NEXT_PUBLIC_BRAND_ENTITY       || "SwaddleShawls",
  email:       process.env.NEXT_PUBLIC_BRAND_EMAIL        || "support@swaddleshawls.com",
};

// Server-only values (not exposed to the browser)
export const brandServer = {
  crmTag:   process.env.BRAND_CRM_TAG   || "swaddleshawls",
  formSlug: process.env.BRAND_FORM_SLUG  || "contact-form",
  dbName:   process.env.DB_NAME          || "swaddleshawls",
};
