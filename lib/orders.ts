import type Stripe from "stripe";
import { db, stripe } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { sendEmail, orderConfirmationEmail, newOrderAdminEmail } from "@/lib/email";
import { pickupPlace } from "@/lib/zones";
import { bladeInfo } from "@/lib/blade";

/**
 * Save a paid Stripe Checkout Session as an order (stamps, stock, partner commission, emails).
 * Safe to call many times for the same session: it is called by the webhook, by the order page the customer
 * lands on, and by the admin's check for missed orders, so an order shows up even if the webhook isn't working.
 */
export async function recordPaidSession(s: Stripe.Checkout.Session) {
  if (s.payment_status !== "paid" || !s.metadata?.items) return false;
  if (await db.order.findUnique({ where: { stripeSessionId: s.id } })) return false;

  const items = JSON.parse(s.metadata.items || "[]") as [string, number, number][];
  const email = s.customer_details?.email?.toLowerCase();
  // Only Backyard Club members earn stamps; guests can claim later by signing up with the same email.
  const member = email ? await db.customer.findUnique({ where: { email } }) : null;
  const usedFree = s.metadata.freeSalsa === "1";
  const paidJars = Number(s.metadata.jarCount || 0) - (usedFree ? 1 : 0);
  const partner = s.metadata.partner ? await db.partner.findUnique({ where: { code: s.metadata.partner } }) : null;
  try {
    await db.$transaction([
      db.order.create({
        data: {
          stripeSessionId: s.id,
          email,
          customerId: member?.id,
          freeSalsaUsed: usedFree,
          status: "new",
          totalCents: s.amount_total ?? 0,
          fulfillment: s.metadata.fulfillment || "pickup",
          deliveryAddress: encrypt(s.metadata.address),
          pickupSlot: s.metadata.pickupSlot || null,
          slotDay: s.metadata.slotDay || null, // empty for Blade & Barber: not part of the kitchen daily cap
          jarCount: Number(s.metadata.jarCount || 0),
          phone: encrypt(s.customer_details?.phone),
          partnerCode: partner?.code,
          commissionCents: partner ? Math.max(0, paidJars) * partner.commissionCents : 0,
          createdAt: new Date((s.created ?? Date.now() / 1000) * 1000),
          items: { create: items.map(([productId, quantity, priceCents]) => ({ productId, quantity, priceCents })) },
        },
      }),
      ...(member ? [db.customer.update({ where: { id: member.id }, data: { jars: { increment: paidJars }, freeUsed: { increment: usedFree ? 1 : 0 } } })] : []),
      // Blade & Barber pickups come off their shelf count; everything else off the kitchen stock.
      ...items.map(([id, q]) => db.product.update({ where: { id }, data: s.metadata!.fulfillment === "blade" ? { bladeStock: { decrement: q } } : { stock: { decrement: q } } })),
    ]);
  } catch (e: any) {
    if (e?.code === "P2002") return false; // saved at the same moment by another path (webhook vs. order page)
    throw e;
  }

  // Emails never block or fail the caller.
  const order = await db.order.findUnique({ where: { stripeSessionId: s.id }, include: { items: { include: { product: true } } } });
  if (order) {
    const first = (member?.name ?? s.customer_details?.name ?? "").split(" ")[0] || undefined;
    const jobs: Promise<unknown>[] = [];
    if (email) jobs.push(sendEmail(email, `Order #${order.id.slice(-6).toUpperCase()} confirmed 🌶`, orderConfirmationEmail(order, first, s.id, pickupPlace(order.fulfillment, order.fulfillment === "blade" ? (await bladeInfo()).address : ""))));
    if (process.env.ADMIN_EMAIL) jobs.push(sendEmail(process.env.ADMIN_EMAIL.split(",").map((x) => x.trim()), `🌶 New order #${order.id.slice(-6).toUpperCase()} · ${order.jarCount} jars`, newOrderAdminEmail(order, member?.name ?? s.customer_details?.name ?? email ?? "Guest")));
    await Promise.allSettled(jobs);
  }
  return true;
}

/** Look at Stripe's recent paid checkouts (last 7 days) and save any that never became an order. */
export async function syncRecentPaidSessions() {
  if (!process.env.STRIPE_SECRET_KEY) return 0;
  try {
    const list = await stripe.checkout.sessions.list({ limit: 40, status: "complete", created: { gte: Math.floor(Date.now() / 1000) - 7 * 86400 } });
    const known = new Set((await db.order.findMany({ where: { stripeSessionId: { in: list.data.map((s) => s.id) } }, select: { stripeSessionId: true } })).map((o) => o.stripeSessionId));
    let added = 0;
    for (const s of list.data) if (!known.has(s.id) && (await recordPaidSession(s))) added++;
    return added;
  } catch (e) {
    console.error("Stripe sync failed", e);
    return 0;
  }
}
