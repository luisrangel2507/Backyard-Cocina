"use server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getPartner } from "@/lib/partnerAuth";
import { BLADE_CODE } from "@/lib/zones";

const COUNTER = "Sold at the counter";

/** The barber sold a jar in person: take it off their shelf and count it as sold (with their commission). */
export async function counterSale(productId: string, form: FormData) {
  const partner = await getPartner();
  if (!partner || partner.code !== BLADE_CODE) return;
  const q = Math.min(24, Math.max(1, Math.floor(Number(form.get("qty")) || 1)));
  const p = await db.product.findUnique({ where: { id: productId } });
  if (!p || !p.active) return;
  // Only sell what is on the shelf: the conditional update fails (count 0) if two taps race for the last jar.
  const took = await db.product.updateMany({ where: { id: p.id, bladeStock: { gte: q } }, data: { bladeStock: { decrement: q } } });
  if (!took.count) return;
  const jars = q * p.jars;
  await db.order.create({
    data: {
      stripeSessionId: `counter_${randomUUID()}`, source: "in_person", paymentMethod: "partner_counter",
      status: "done", confirmed: true, totalCents: p.priceCents * q, fulfillment: "blade", jarCount: jars,
      pickupSlot: COUNTER, partnerCode: partner.code, commissionCents: jars * partner.commissionCents,
      items: { create: [{ productId: p.id, quantity: q, priceCents: p.priceCents }] },
    },
  });
  revalidatePath("/partner"); revalidatePath("/admin"); revalidatePath("/shop");
}

/** Undo a counter sale recorded by mistake (same day only): the jar goes back on the shelf. */
export async function undoCounterSale(orderId: string) {
  const partner = await getPartner();
  if (!partner) return;
  const o = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!o || o.partnerCode !== partner.code || o.paymentMethod !== "partner_counter" || o.status === "cancelled") return;
  if (Date.now() - o.createdAt.getTime() > 24 * 3600 * 1000) return;
  await db.$transaction([
    db.order.update({ where: { id: o.id }, data: { status: "cancelled" } }),
    ...o.items.map((i) => db.product.update({ where: { id: i.productId }, data: { bladeStock: { increment: i.quantity } } })),
  ]);
  revalidatePath("/partner"); revalidatePath("/admin"); revalidatePath("/shop");
}
