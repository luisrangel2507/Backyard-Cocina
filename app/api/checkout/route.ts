import { NextResponse } from "next/server";
import { db, stripe } from "@/lib/db";
import { zoneFor } from "@/lib/zones";
import { openSlots } from "@/lib/schedule";


// Prices are always read from the database, never trusted from the client.
export async function POST(req: Request) {
  const { items, fulfillment = "pickup", address = "", zip = "", pickupSlot = "" } = (await req.json()) as {
    items: { id: string; quantity: number }[]; fulfillment?: "pickup" | "delivery"; address?: string; zip?: string; pickupSlot?: string;
  };
  const zone = fulfillment === "delivery" ? zoneFor(zip) : undefined;
  if (fulfillment === "delivery" && !zone)
    return NextResponse.json({ error: "We don't deliver to that ZIP yet. Choose pickup instead." }, { status: 400 });
  if (fulfillment === "delivery" && address.trim().length < 8)
    return NextResponse.json({ error: "Add a delivery address" }, { status: 400 });
  if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const products = await db.product.findMany({ where: { id: { in: items.map((i) => i.id) }, active: true } });
  const lines = items
    .map((i) => ({ p: products.find((p) => p.id === i.id), q: Math.min(Math.max(1, Math.floor(i.quantity)), 24) }))
    .filter((l) => l.p && l.p.stock >= l.q);
  if (!lines.length) return NextResponse.json({ error: "Those items are unavailable" }, { status: 400 });

  const jarCount = lines.reduce((a, l) => a + l.q * l.p!.jars, 0);
  const slot = (await openSlots(20)).find((s) => s.label === pickupSlot);
  if (!slot) return NextResponse.json({ error: "Pick an available day and time" }, { status: 400 });
  if (slot.left < jarCount) return NextResponse.json({ error: `Only ${Math.max(0, slot.left)} jars left for that day. Pick another day.` }, { status: 400 });

  const site = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      ...lines.map((l) => ({
        quantity: l.q,
        price_data: { currency: "usd", unit_amount: l.p!.priceCents, product_data: { name: l.p!.name } },
      })),
      ...(fulfillment === "delivery"
        ? [{ quantity: 1, price_data: { currency: "usd", unit_amount: zone!.feeCents, product_data: { name: `Delivery · ${zone!.name}` } } }]
        : []),
    ],
    phone_number_collection: { enabled: true },
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
    customer_creation: "always",
    // Stripe generates a PDF invoice and emails it to the customer after payment
    invoice_creation: { enabled: true, invoice_data: { footer: "Thanks for supporting Backyard Cocina!" } },
    metadata: {
      items: JSON.stringify(lines.map((l) => [l.p!.id, l.q, l.p!.priceCents])),
      fulfillment,
      address: `${address}, ${zip}`.slice(0, 450),
      pickupSlot: slot.label,
      slotDay: slot.day,
      jarCount: String(jarCount),
    },
    success_url: `${site}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/cart`,
  });

  return NextResponse.json({ url: session.url });
}
