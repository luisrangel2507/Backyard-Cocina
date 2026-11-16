import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/db";
import { recordPaidSession } from "@/lib/orders";

// Stripe tells us here when a checkout is paid. (The order page and the admin also save missed orders, see lib/orders.ts.)
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") ?? "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e) {
    console.error("Stripe webhook: bad signature. Check STRIPE_WEBHOOK_SECRET matches this endpoint and mode (test vs live).", (e as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") await recordPaidSession(event.data.object as Stripe.Checkout.Session);
  return NextResponse.json({ received: true });
}
