import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

// Partner (e.g. Blade & Barber) login session: "<partnerId>.<expires>.<signature>".
// The signature includes the partner's password hash, so changing their password logs them out everywhere.
export const PARTNER_COOKIE = "bc_partner";
const DAYS = 30;

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set");
  return s || "dev-secret";
};
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");

export function partnerSessionCookie(p: { id: string; passwordHash: string | null }) {
  const exp = Date.now() + DAYS * 864e5;
  const v = `${p.id}.${exp}`;
  return { name: PARTNER_COOKIE, value: `${v}.${sign(`${v}.${p.passwordHash}`)}`, httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: DAYS * 86400 };
}
export const clearPartnerCookie = { name: PARTNER_COOKIE, value: "", path: "/", maxAge: 0 };

/** The logged-in partner, or null. Paused partners can't log in. */
export async function getPartner() {
  const raw = (await cookies()).get(PARTNER_COOKIE)?.value;
  if (!raw) return null;
  const [id, exp, sig] = raw.split(".");
  if (!id || !sig || Number(exp) < Date.now()) return null;
  const p = await db.partner.findUnique({ where: { id } });
  if (!p?.active || !p.passwordHash) return null;
  const expected = sign(`${id}.${exp}.${p.passwordHash}`);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return p;
}
