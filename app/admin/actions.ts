"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { sendSms, orderText } from "@/lib/sms";
import { sendEmail, orderReadyEmail } from "@/lib/email";
import { bladeInfo } from "@/lib/blade";
import { pickupPlace, isPickup } from "@/lib/zones";
import { hashPassword } from "@/lib/password";

export async function setStatus(id: string, status: string) {
  const o = await db.order.update({ where: { id }, data: { status }, include: { customer: true } });
  const first = o.customer?.name.split(" ")[0];
  const place = pickupPlace(o.fulfillment, o.fulfillment === "blade" ? (await bladeInfo()).address : "");
  const text = orderText(o, first, place);
  const phone = decrypt(o.phone);
  if (phone && text) await sendSms(phone, text);
  const notify = status === "ready" || (status === "out" && o.fulfillment === "delivery");
  if (notify && o.email) {
    const full = await db.order.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
    if (full) await sendEmail(o.email, status === "ready" && isPickup(o.fulfillment) ? `Your salsa is ready! #${id.slice(-6).toUpperCase()} 🌶` : `Your salsa is on the way 🚗`, orderReadyEmail({ ...full, fulfillment: status === "out" ? "delivery" : full.fulfillment }, first, place));
  }
  revalidatePath("/admin");
}

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "salsa";

/** Create or update a product from the admin form. A new photo arrives as a small resized data URL. */
export async function saveProduct(form: FormData) {
  const g = (k: string) => String(form.get(k) ?? "").trim();
  const price = Math.round(Number(g("price")) * 100);
  const image = g("image");
  const data = {
    name: g("name").slice(0, 60),
    category: (g("newCategory") || g("category") || "Salsa").slice(0, 30),
    priceCents: price > 0 ? price : 1000,
    heat: Math.min(5, Math.max(1, Number(g("heat")) || 2)),
    jars: Math.min(12, Math.max(1, Number(g("jars")) || 1)),
    description: g("description").slice(0, 400),
    pairs: g("pairs").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 6),
    tip: g("tip").slice(0, 300),
    color: /^#[0-9a-f]{6}$/i.test(g("color")) ? g("color") : "#139a74",
    stock: form.get("soldOut") ? 0 : 100,
    ...(image.startsWith("data:image/") && image.length < 900_000 ? { image } : {}),
  };
  if (!data.name) return { ok: false, error: "Add a name" };
  try {
    const id = g("id");
    if (id) await db.product.update({ where: { id }, data });
    else {
      let newId = slug(data.name), n = 1;
      while (await db.product.findUnique({ where: { id: newId } })) newId = `${slug(data.name)}-${++n}`;
      await db.product.create({ data: { id: newId, ...data } });
    }
  } catch (e) {
    console.error("saveProduct failed", e);
    return { ok: false, error: "Couldn't save. Try a smaller photo or try again." };
  }
  revalidatePath("/admin"); revalidatePath("/shop");
  return { ok: true, error: "" };
}

export async function removeProduct(id: string) {
  await db.product.update({ where: { id }, data: { active: false } });
  revalidatePath("/admin"); revalidatePath("/shop");
}

export async function saveSchedule(form: FormData) {
  const days = form.getAll("days").map(Number);
  const split = (v: FormDataEntryValue | null) => String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const daySlots = Object.fromEntries(days.map((d) => [String(d), split(form.get(`slots-${d}`))]));
  const slots = Object.values(daySlots).find((v) => v.length) ?? ["10 am–12 pm"];
  const cap = Math.max(1, Number(form.get("cap")) || 40);
  await db.settings.upsert({ where: { id: 1 }, update: { days, slots, cap, daySlots }, create: { id: 1, days, slots, cap, daySlots } });
  revalidatePath("/admin");
}

export async function confirmOrder(id: string) {
  const o = await db.order.update({ where: { id }, data: { confirmed: true }, include: { customer: true } });
  const first = o.customer?.name.split(" ")[0] ?? "there";
  if (o.phone) await sendSms(decrypt(o.phone)!, `Hi ${first}! Backyard Cocina confirmed your order #${o.id.slice(-6).toUpperCase()}. We're on it. 🌶`);
  revalidatePath("/admin");
}

// Reject = cancel. Refund is done from the Stripe dashboard (see DEPLOY.md).
export async function rejectOrder(id: string) {
  const before = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!before || before.status === "cancelled") return;
  const o = await db.order.update({ where: { id }, data: { status: "cancelled" }, include: { customer: true } });
  // Blade & Barber jars are still on their shelf, so put them back in that count.
  if (o.fulfillment === "blade") await db.$transaction(before.items.map((i) => db.product.update({ where: { id: i.productId }, data: { bladeStock: { increment: i.quantity } } })));
  const first = o.customer?.name.split(" ")[0] ?? "there";
  if (o.phone) await sendSms(decrypt(o.phone)!, `Hi ${first}, sorry, we can't fulfil order #${o.id.slice(-6).toUpperCase()}. We'll refund you in full.`);
  revalidatePath("/admin");
}

export async function textCustomer(id: string, form: FormData) {
  const msg = String(form.get("msg") || "").trim();
  const o = await db.order.findUnique({ where: { id } });
  if (o?.phone && msg) await sendSms(decrypt(o.phone)!, msg);
  revalidatePath("/admin");
}

export async function savePartner(form: FormData) {
  const g = (k: string) => String(form.get(k) ?? "").trim();
  const id = g("id");
  const name = g("name").slice(0, 80);
  const commissionCents = Math.round(Number(g("commission")) * 100);
  if (!name || !(commissionCents >= 0)) return;
  const data = { name, commissionCents, contact: g("contact").slice(0, 120), notes: g("notes").slice(0, 500), active: !form.get("paused") };
  if (id) {
    // Partner login: user name (letters, numbers, . _ -) and a new password (8+ characters; blank keeps the old one).
    const username = g("username").toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40);
    const password = String(form.get("password") ?? "");
    const login: { username?: string | null; passwordHash?: string } = {};
    if (form.has("username")) {
      if (username) {
        const taken = await db.partner.findFirst({ where: { username, NOT: { id } } });
        if (!taken) login.username = username;
      } else login.username = null;
    }
    if (password.length >= 8) login.passwordHash = await hashPassword(password);
    await db.partner.update({ where: { id }, data: { ...data, ...login } });
  }
  else {
    const code = g("code").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
    if (!code) return;
    await db.partner.upsert({ where: { code }, update: data, create: { code, ...data } });
  }
  revalidatePath("/admin");
}

/** Blade & Barber pickup: address, hours and how many jars of each salsa are on their shelf. */
export async function saveBlade(form: FormData) {
  const g = (k: string) => String(form.get(k) ?? "").trim();
  const data = { bladeAddress: g("address").slice(0, 160), bladeHours: g("hours").slice(0, 120) };
  await db.settings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  const updates = [...form.keys()].filter((k) => k.startsWith("stock_")).map((k) => {
    const n = Math.min(999, Math.max(0, Math.floor(Number(form.get(k)) || 0)));
    return db.product.update({ where: { id: k.slice(6) }, data: { bladeStock: n } });
  });
  await db.$transaction(updates);
  revalidatePath("/admin"); revalidatePath("/shop");
}

export async function addExpense(form: FormData) {
  const amountCents = Math.round(Number(form.get("amount")) * 100);
  const description = String(form.get("description") || "").trim();
  if (!description || !(amountCents > 0)) return;
  const d = String(form.get("date") || "");
  await db.expense.create({ data: { description, amountCents, category: String(form.get("category") || "Other"), date: d ? new Date(d + "T12:00:00") : new Date() } });
  revalidatePath("/admin");
}

export async function deleteExpense(id: string) {
  await db.expense.delete({ where: { id } });
  revalidatePath("/admin");
}

/** Record an in-person sale (market, pickup counter, barbershop...). Counts in Money/Sales and decrements stock. */
export async function recordSale(input: { items: { id: string; q: number }[]; payment: string; email?: string; note?: string; discountCents?: number }) {
  const ids = input.items.filter((i) => i.q > 0).map((i) => i.id);
  if (!ids.length) return { ok: false, error: "Add at least one salsa" };
  const products = await db.product.findMany({ where: { id: { in: ids } } });
  const lines = input.items.map((i) => ({ p: products.find((p) => p.id === i.id), q: Math.min(99, Math.max(0, Math.floor(i.q))) })).filter((l) => l.p && l.q > 0);
  const subtotal = lines.reduce((a, l) => a + l.p!.priceCents * l.q, 0);
  const total = Math.max(0, subtotal - Math.max(0, Math.floor(input.discountCents ?? 0)));
  const jarCount = lines.reduce((a, l) => a + l.p!.jars * l.q, 0);
  const payment = ["cash", "card", "venmo", "zelle", "other"].includes(input.payment) ? input.payment : "cash";
  const email = input.email?.trim().toLowerCase() || null;
  const member = email ? await db.customer.findUnique({ where: { email } }) : null;
  const { randomUUID } = await import("crypto");
  try {
    await db.$transaction([
      db.order.create({ data: {
        stripeSessionId: `pos_${randomUUID()}`, source: "in_person", paymentMethod: payment, email, customerId: member?.id,
        status: "done", confirmed: true, totalCents: total, fulfillment: "pickup", jarCount,
        pickupSlot: input.note?.slice(0, 120) || "In person",
        items: { create: lines.map((l) => ({ productId: l.p!.id, quantity: l.q, priceCents: l.p!.priceCents })) },
      } }),
      ...(member ? [db.customer.update({ where: { id: member.id }, data: { jars: { increment: jarCount } } })] : []),
      ...lines.map((l) => db.product.update({ where: { id: l.p!.id }, data: { stock: { decrement: l.q } } })),
    ]);
  } catch (e) { console.error("recordSale failed", e); return { ok: false, error: "Couldn't save the sale. Try again." }; }
  revalidatePath("/admin");
  return { ok: true, error: "", total, member: member?.name ?? null };
}

export async function voidSale(id: string) {
  const o = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!o || o.source !== "in_person" || o.status === "cancelled") return;
  await db.$transaction([
    db.order.update({ where: { id }, data: { status: "cancelled" } }),
    ...(o.customerId ? [db.customer.update({ where: { id: o.customerId }, data: { jars: { decrement: o.jarCount } } })] : []),
    // Counter sales at Blade & Barber came off their shelf, so they go back there.
    ...o.items.map((i) => db.product.update({ where: { id: i.productId }, data: o.paymentMethod === "partner_counter" ? { bladeStock: { increment: i.quantity } } : { stock: { increment: i.quantity } } })),
  ]);
  revalidatePath("/admin");
}
