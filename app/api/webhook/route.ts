import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db, stripe } from "@/lib/db";

// Orders are only marked paid here, after Stripe confirms the payment.
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const exists = await db.order.findUnique({ where: { stripeSessionId: s.id } });
    if (!exists) {
      const items = JSON.parse(s.metadata?.items || "[]") as [string, number, number][];
      const email = s.customer_details?.email?.toLowerCase();
      // Only Backyard Club members earn stamps; guests can claim later by signing up with the same email.
      const member = email ? await db.customer.findUnique({ where: { email } }) : null;
      const usedFree = s.metadata?.freeSalsa === "1";
      const paidJars = Number(s.metadata?.jarCount || 0) - (usedFree ? 1 : 0);
      await db.$transaction([
        db.order.create({
          data: {
            stripeSessionId: s.id,
            email,
            customerId: member?.id,
            freeSalsaUsed: usedFree,
            status: "new",
            totalCents: s.amount_total ?? 0,
            fulfillment: s.metadata?.fulfillment || "pickup",
            deliveryAddress: s.metadata?.address || null,
            pickupSlot: s.metadata?.pickupSlot || null,
            slotDay: s.metadata?.slotDay || null,
            jarCount: Number(s.metadata?.jarCount || 0),
            phone: s.customer_details?.phone,
            items: { create: items.map(([productId, quantity, priceCents]) => ({ productId, quantity, priceCents })) },
          },
        }),
        ...(member ? [db.customer.update({ where: { id: member.id }, data: { jars: { increment: paidJars }, freeUsed: { increment: usedFree ? 1 : 0 } } })] : []),
        ...items.map(([id, q]) => db.product.update({ where: { id }, data: { stock: { decrement: q } } })),
      ]);
    }
  }
  return NextResponse.json({ received: true });
}
