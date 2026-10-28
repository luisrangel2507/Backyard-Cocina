// Transactional email through Resend (https://resend.com). Without RESEND_API_KEY it only logs, so nothing breaks.
import { PICKUP_ADDRESS } from "./zones";

const FROM = () => process.env.EMAIL_FROM || "Backyard Cocina <onboarding@resend.dev>";
const SITE = () => (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
export const money = (c: number) => `$${(c / 100).toFixed(2)}`;

export async function sendEmail(to: string | string[], subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log("[email skipped]", to, subject); return false; }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM(), to, subject, html }),
    });
    if (!r.ok) console.error("Resend error", r.status, await r.text());
    return r.ok;
  } catch (e) { console.error("Resend failed", e); return false; }
}

// Simple branded layout that renders well in Gmail / Apple Mail.
function layout(title: string, body: string, cta?: { href: string; label: string }) {
  return `<!doctype html><html><body style="margin:0;background:#0c1d4a;font-family:Helvetica,Arial,sans-serif;color:#fbf6e3">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c1d4a;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:520px;background:#12285f;border-radius:18px;overflow:hidden">
<tr><td style="height:10px;background:linear-gradient(90deg,#d4237a,#29b6e0,#1f9a74,#ef7b2b)"></td></tr>
<tr><td style="padding:24px 24px 6px;text-align:center"><img src="${SITE()}/logo.png" width="90" alt="Backyard Cocina" style="display:inline-block"></td></tr>
<tr><td style="padding:6px 24px 4px;text-align:center"><h1 style="margin:0;font-size:24px;color:#fbf6e3">${title}</h1></td></tr>
<tr><td style="padding:12px 24px 8px;font-size:15px;line-height:1.55;color:#e4eaf8">${body}</td></tr>
${cta ? `<tr><td style="padding:10px 24px 26px;text-align:center"><a href="${cta.href}" style="display:inline-block;background:#e5471f;color:#fff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px">${cta.label}</a></td></tr>` : ""}
<tr><td style="padding:14px 24px 22px;text-align:center;font-size:12px;color:#b9c2dc">Backyard Cocina · ${PICKUP_ADDRESS}</td></tr>
</table></td></tr></table></body></html>`;
}

type OrderLike = { id: string; totalCents: number; fulfillment: string; pickupSlot: string | null; jarCount: number; email?: string | null; items?: { quantity: number; priceCents: number; product?: { name: string } | null }[] };
const ref = (o: { id: string }) => o.id.slice(-6).toUpperCase();
const itemsTable = (o: OrderLike) => (o.items?.length
  ? `<table width="100%" style="border-collapse:collapse;margin:10px 0">${o.items.map((i) => `<tr><td style="padding:6px 0;border-bottom:1px solid #ffffff22">${i.quantity} × ${esc(i.product?.name ?? "Salsa")}</td><td align="right" style="padding:6px 0;border-bottom:1px solid #ffffff22">${money(i.priceCents * i.quantity)}</td></tr>`).join("")}<tr><td style="padding:8px 0;font-weight:bold">Total</td><td align="right" style="padding:8px 0;font-weight:bold">${money(o.totalCents)}</td></tr></table>`
  : `<p><b>Total:</b> ${money(o.totalCents)}</p>`);

export function orderConfirmationEmail(o: OrderLike, name: string | undefined, sessionId: string) {
  const when = o.pickupSlot ? `<p>🗓 <b>${o.fulfillment === "pickup" ? "Pickup" : "Delivery"}:</b> ${esc(o.pickupSlot)}${o.fulfillment === "pickup" ? `<br>📍 ${PICKUP_ADDRESS}` : ""}</p>` : "";
  return layout(`Thanks${name ? `, ${esc(name)}` : ""}! 🌶`,
    `<p>We got your order <b>#${ref(o)}</b> and Brant is getting your batch ready.</p>${itemsTable(o)}${when}<p>We'll email you as soon as it's ready.</p>`,
    { href: `${SITE()}/success?session_id=${sessionId}`, label: "Track my order" });
}

export function orderReadyEmail(o: OrderLike, name: string | undefined) {
  const pickup = o.fulfillment === "pickup";
  return layout(pickup ? "Your salsa is ready! 🌶" : "Your salsa is on the way! 🚗",
    `<p>Hi${name ? ` ${esc(name)}` : ""}, order <b>#${ref(o)}</b> is ${pickup ? "ready for pickup" : "packed and heading out"}.</p>${o.pickupSlot ? `<p>🗓 ${esc(o.pickupSlot)}${pickup ? `<br>📍 ${PICKUP_ADDRESS}` : ""}</p>` : ""}<p>Thanks for supporting Backyard Cocina!</p>`);
}

export function newOrderAdminEmail(o: OrderLike, customer: string) {
  return layout(`New order #${ref(o)}`,
    `<p><b>${esc(customer)}</b> · ${o.jarCount} jar${o.jarCount === 1 ? "" : "s"} · ${o.fulfillment === "pickup" ? "Pickup" : "Delivery"}</p>${itemsTable(o)}${o.pickupSlot ? `<p>🗓 ${esc(o.pickupSlot)}</p>` : ""}`,
    { href: `${SITE()}/admin`, label: "Open kitchen admin" });
}

export function resetPasswordEmail(link: string) {
  return layout("Reset your password",
    `<p>Someone asked to reset the password for your Backyard Club account. If it was you, tap the button below. The link works for 1 hour.</p><p>If you didn't ask for this, you can ignore this email.</p>`,
    { href: link, label: "Choose a new password" });
}
