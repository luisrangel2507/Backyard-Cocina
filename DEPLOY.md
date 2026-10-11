# Deploy to Railway (Backyard Cocina)

1. Push this folder to a GitHub repo. In Railway: New Project → Deploy from GitHub; add the **PostgreSQL** plugin (it injects `DATABASE_URL`).
2. Variables (see `.env.example`): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL` (your Railway/custom domain), `ADMIN_USER`, `ADMIN_PASSWORD`, optional `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `AUTH_SECRET` (long random string for login cookies), `RESEND_API_KEY` + `EMAIL_FROM` (login code emails; without a key the code is printed in server logs), `STRIPE_AUTOMATIC_TAX`.
3. Build = `npm run build`, start = `npm start` (runs `prisma db push` then `next start`).
4. Once, from the Railway shell: `npm run seed` (creates the 3 salsas + Trio).
5. Stripe → Developers → Webhooks → endpoint `https://YOUR_DOMAIN/api/webhook`, event `checkout.session.completed`; copy the signing secret into `STRIPE_WEBHOOK_SECRET`. Use test keys (card 4242 4242 4242 4242) first.
6. Admin: `/admin` (Basic auth with ADMIN_USER / ADMIN_PASSWORD). Rejecting an order cancels it and texts the customer; **refund manually in the Stripe dashboard**.

## Not verified yet
`prisma generate` / `next build` could not run in the authoring sandbox. Run `npm install && npm run build` first and fix any type errors.

## Still to build (not in this code)
- Posting reviews; merch purchasing / redeeming the 20-jar merch reward; birthday free-salsa grant.
- Confirm with client: prices, delivery zones/fees, time windows, jar cap, real photos, California Cottage Food permit (LA County).
