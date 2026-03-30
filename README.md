# SurgeShop — General-Purpose E-commerce Template

A modern, full-featured e-commerce template powered by **Next.js**, **MongoDB**, **BasaltSurge** payments, and **BasaltCRM**. Designed to be white-labeled for any brand using `.env`-based theming.

## Quick Start

```bash
npm install
cp .env.example .env.local   # Fill in your credentials
npm run dev
```

## .env Branding Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_BRAND_NAME` | SurgeShop | Brand name shown in navbar, footer, metadata |
| `NEXT_PUBLIC_BRAND_TAGLINE` | Premium Products, Delivered | Tagline in page title and hero |
| `NEXT_PUBLIC_BRAND_DESCRIPTION` | Your destination for premium, curated products. | Meta description |
| `NEXT_PUBLIC_BRAND_URL` | https://example.com | Base URL for metadata |
| `NEXT_PUBLIC_BRAND_ENTITY` | SurgeShop, LLC | Legal entity for footer copyright |
| `NEXT_PUBLIC_BRAND_EMAIL` | support@example.com | Contact email on privacy page |
| `BRAND_CRM_TAG` | surgeshop | Tag used in CRM contact sync |
| `BRAND_FORM_SLUG` | contact-form | BasaltCRM form slug for contact form |
| `DB_NAME` | surgeshop | MongoDB database name |

## Integration Keys

| Variable | Description |
|---|---|
| `SURGE_API_KEY` | BasaltSurge payment gateway API key |
| `SURGE_MERCHANT_WALLET` | Merchant wallet address for payments |
| `DATABASE_URL` | MongoDB connection string |
| `MONGODB_CONNECTION_STRING` | Alternate MongoDB connection string |
| `S3_ENDPOINT` / `S3_BUCKET_NAME` / etc. | S3-compatible object storage |
| `BASALT_CRM_KEY` | BasaltCRM API key |

## Features

- **Shop** — Product catalog with cart, checkout, and BasaltSurge payments
- **Client Portal** — Authentication, order history, messaging, profile management
- **CRM Integration** — Automatic contact sync on order confirmation
- **Contact Form** — CRM-connected lead capture form
- **SEO-Ready** — Dynamic metadata from env variables
- **Responsive** — Mobile-first design with premium aesthetics

## Stack

- Next.js 16 + React
- Tailwind CSS 4
- MongoDB / Mongoose
- BasaltSurge Payments
- BasaltCRM
- S3-compatible Storage
