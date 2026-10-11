# Backyard Cocina — Salsa Shop

Next.js 14 + PostgreSQL (Prisma) + Stripe Checkout. Deploys to Railway.

## Local
```bash
npm install
cp .env.example .env        # fill DATABASE_URL + Stripe test keys
npx prisma migrate dev --name init
npm run seed
npm run dev
stripe listen --forward-to localhost:3000/api/webhook   # copy whsec_ into .env
```
Test card: `4242 4242 4242 4242`, any future date, any CVC.

## Payments flow
1. Cart → `POST /api/checkout` rebuilds prices from the DB and creates a Stripe Checkout Session.
2. Customer pays on Stripe's hosted page (cards, Apple Pay, Google Pay, Link). No card data touches our server.
3. Stripe calls `/api/webhook` → order saved as `paid`, stock decremented (idempotent by session id).
4. `/success` verifies the session with Stripe before showing confirmation.

## Cards & receipts
- Card data never touches our server or database. Stripe stores it (PCI Level 1). We only save order id, email, items and totals.
- Each purchase creates a Stripe invoice: emailed automatically and downloadable as PDF on `/success`.
- Dashboard → Settings → Customer emails → turn on "Successful payments" and "Invoices" so emails go out in live mode.

## Railway
- Add a PostgreSQL service; set the env vars above (live keys for production).
- Stripe Dashboard → Webhooks → `https://<domain>/api/webhook`, event `checkout.session.completed`.
- Fulfillment is **pickup (free) at 1636 Greenwood Ave, Torrance** or **delivery priced by ZIP zone** (`lib/zones.ts`). No mail shipping.
- Enable Stripe Tax and set `STRIPE_AUTOMATIC_TAX=true` once the business registers for sales tax.

## Next steps
- Admin panel for products, stock and order status (shipped).
- Shipping labels (Shippo/EasyPost) and order emails.

## Backyard Club (profiles & loyalty)
- Customers can **check out as guests** or **sign up** for offers and rewards, then log in later.
- 1 stamp per paid jar. **10 jars = 1 free salsa**, **20 jars = free merch** (`lib/loyalty.ts`).
- Webhook adds stamps to members; signing up with the same email can claim past guest orders.
- Referral codes (`Customer.referralCode`) and birthday month (`birthMonth`) are in the schema; `lib/loyalty.ts` has the helpers.
- TODO before launch: login with an emailed one-time code (e.g. Auth.js + Resend), `/profile` page with the stamp card,
  and applying a free salsa as a Stripe discount at checkout (`metadata.freeSalsa = "1"`).

## Kitchen admin (`/admin`)
- Protected by a browser login: `ADMIN_USER` / `ADMIN_PASSWORD`.
- **Orders:** New → Ready → Out for delivery → Completed. Each step texts the customer through Twilio (`lib/sms.ts`).
- **Products:** change price, mark sold out. **Sales:** last 7 days. **Schedule:** batch days, time windows, max jars per day.
- Checkout only offers open days and blocks a day once it hits the max.

## Before launch (business)
- California sells homemade food under a Cottage Food permit from the county (LA County Environmental Health). Confirm the permit class before selling.
