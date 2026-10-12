import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

const COOKIE = "bc_session";
const secret = () => process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "dev-secret";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");

/** Private link token for a partner's read-only dashboard (/partner/CODE?k=TOKEN). */
export const partnerToken = (code: string) => sign(`partner:${code}`).slice(0, 24);

export const hashCode = (email: string, code: string) => createHash("sha256").update(`${email}:${code}:${secret()}`).digest("hex");

export function sessionCookie(customerId: string) {
  const exp = Date.now() + 30 * 24 * 3600 * 1000;
  const v = `${customerId}.${exp}`;
  return { name: COOKIE, value: `${v}.${sign(v)}`, httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 30 * 24 * 3600 };
}
export const clearCookie = { name: COOKIE, value: "", path: "/", maxAge: 0 };

/** Logged-in Backyard Club member, or null. */
export async function getCustomer() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, exp, sig] = raw.split(".");
  const expected = sign(`${id}.${exp}`);
  if (!sig || sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) || Number(exp) < Date.now()) return null;
  return db.customer.findUnique({ where: { id } });
}

/** Club login needs an email provider; without one, guests can still buy and claim stamps later. */
export const clubOpen = () => !!process.env.RESEND_API_KEY;

export async function sendCode(email: string, code: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || "Backyard Cocina <onboarding@resend.dev>", to: email, subject: "Your Backyard Club code", text: `Your login code is ${code}. It expires in 10 minutes.` }),
  });
}
