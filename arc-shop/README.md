# ARC Shop

A standalone movement-apparel storefront for Arab Recreational Club.

## Included

- Responsive editorial storefront, catalog, product pages, persistent cart, and Stripe Checkout handoff.
- Supabase-backed products, variants, inventory reservations, orders, fulfillment, discounts, content, audit records, and media storage.
- Passwordless, allowlisted administration at `/admin`.
- Local preview data when Supabase and Stripe are not configured.
- Verified Stripe webhook fulfillment with idempotent inventory conversion.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add the Supabase and Stripe values.

## Supabase setup

1. Create a dedicated project for ARC Shop.
2. Run `supabase/migrations/202607230001_arc_shop.sql` in the SQL editor.
3. Add the site URL and `/admin` redirect URL to Supabase Authentication.
4. Add the project URL, anon key, and service-role key to the deployment environment.

The migration seeds Drop 001 and creates the `shop-media` public storage bucket.

## Stripe setup

1. Add `STRIPE_SECRET_KEY`.
2. Create a webhook for `checkout.session.completed` pointing to:
   `https://YOUR_SHOP_DOMAIN/api/webhooks/stripe`
3. Add the resulting signing secret as `STRIPE_WEBHOOK_SECRET`.

The server validates every cart, reserves stock for 30 minutes, creates Stripe
line items from trusted catalog data, and converts reservations only after a
verified webhook.

## Netlify environment variables

Add every key from `.env.example` in **Site configuration → Environment
variables**. Mark `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and
`STRIPE_WEBHOOK_SECRET` as secrets, and expose them to production only.

The included `netlify.toml` uses the standard Next.js production build. Netlify
will apply its Next.js runtime automatically.

After Netlify assigns the final domain:

1. Set that domain as the Supabase Authentication Site URL.
2. Allow `https://YOUR_NETLIFY_DOMAIN/admin` as a Supabase redirect URL.
3. Change the ARC Shop Stripe webhook endpoint to
   `https://YOUR_NETLIFY_DOMAIN/api/webhooks/stripe`.
