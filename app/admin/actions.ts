"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { sendSms, orderText } from "@/lib/sms";
import { sendEmail, orderReadyEmail } from "@/lib/email";

export async function setStatus(id: string, status: string) {
  const o = await db.order.update({ where: { id }, data: { status }, include: { customer: true } });
  const first = o.customer?.name.split(" ")[0];
  const text = orderText(o, first);
  const phone = decrypt(o.phone);
  if (phone && text) await sendSms(phone, text);
  const notify = status === "ready" || (status === "out" && o.fulfillment === "delivery");
  if (notify && o.email) {
    const full = await db.order.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
    if (full) await sendEmail(o.email, status === "ready" && o.fulfillment === "pickup" ? `Your salsa is ready! #${id.slice(-6).toUpperCase()} 🌶` : `Your salsa is on the way 🚗`, orderReadyEmail({ ...full, fulfillment: status === "out" ? "delivery" : full.fulfillment }, first));
  }
  revalidatePath("/admin");
}

export async function saveProduct(form: FormData) {
  const id = String(form.get("id"));
  const price = Math.round(Number(form.get("price")) * 100);
  await db.product.update({ where: { id }, data: { priceCents: price > 0 ? price : undefined, stock: form.get("soldOut") ? 0 : 100 } });
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
  const o = await db.order.update({ where: { id }, data: { status: "cancelled" }, include: { customer: true } });
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
  const code = String(form.get("code")).trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const name = String(form.get("name")).trim();
  const commissionCents = Math.round(Number(form.get("commission")) * 100);
  if (!code || !name || !(commissionCents >= 0)) return;
  await db.partner.upsert({ where: { code }, update: { name, commissionCents }, create: { code, name, commissionCents } });
  revalidatePath("/admin");
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
