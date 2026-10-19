# Deploy to Railway (Backyard Cocina)

1. Push this folder to a GitHub repo. In Railway: New Project → Deploy from GitHub; add the **PostgreSQL** plugin (it injects `DATABASE_URL`).
2. Variables (see `.env.example`): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL` (your Railway/custom domain), `ADMIN_USER`, `ADMIN_PASSWORD`, optional `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `AUTH_SECRET` (long random string for login cookies),  `STRIPE_AUTOMATIC_TAX`.
3. Build = `npm run build`, start = `npm start` (runs `prisma db push` then `next start`).
4. Once, from the Railway shell: `npm run seed` (creates the 3 salsas + Trio).
5. Stripe → Developers → Webhooks → endpoint `https://YOUR_DOMAIN/api/webhook`, event `checkout.session.completed`; copy the signing secret into `STRIPE_WEBHOOK_SECRET`. Use test keys (card 4242 4242 4242 4242) first.
6. Admin: `/admin` (Basic auth with ADMIN_USER / ADMIN_PASSWORD). Rejecting an order cancels it and texts the customer; **refund manually in the Stripe dashboard**.

## Not verified yet
`prisma generate` / `next build` could not run in the authoring sandbox. Run `npm install && npm run build` first and fix any type errors.

## Still to build (not in this code)
- Posting reviews; merch purchasing / redeeming the 20-jar merch reward; birthday free-salsa grant.
- Confirm with client: prices, delivery zones/fees, time windows, jar cap, real photos, California Cottage Food permit (LA County).

## Partners (Blade & Barber)
1. `/admin?tab=partners` → add partner: name "Blade & Barber", code `BLADE`, commission per jar (default $1.00).
2. Its QR (print it) points to `NEXT_PUBLIC_SITE_URL/r/BLADE`; also downloadable at `/api/qr?code=BLADE`.
3. Scanning sets a 30-day cookie; orders from that browser are tagged with the partner and the commission (paid jars × rate) is stored on the order. The partners tab shows jars sold and commission owed. Pay the partner manually.

## Security
- Card and bank data never touch this app: payments and payouts live in Stripe (PCI Level 1).
- Customer phone numbers and delivery addresses are encrypted in the database with AES-256-GCM (`lib/crypto.ts`), key = `DATA_ENCRYPTION_KEY` (falls back to `AUTH_SECRET`). Never change or lose this key, or old data can't be read.
- `AUTH_SECRET` is required in production. `ADMIN_PASSWORD` must be 12+ characters.
- Admin login: 5 wrong tries per IP locks it for 15 minutes; session ends after 2 hours idle.
- Security headers (HSTS, CSP, no framing) in `next.config.ts`.

## Customer accounts (Backyard Club)
Customers create an account with email + password (scrypt-hashed); no email or SMS provider needed. Stamps: 1 per paid jar. A forgotten password has no automatic reset yet (needs Resend email) — reset it by hand in the database for now.
Language: EN/ES toggle on every page, remembered in the `bc_lang` cookie.
