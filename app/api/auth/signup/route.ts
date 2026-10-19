import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { hashPassword } from "@/lib/password";
import { sessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || "").trim().toLowerCase();
  const name = String(b.name || "").trim().slice(0, 80);
  const password = String(b.password || "");
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8 || password.length > 200)
    return NextResponse.json({ error: "fields" }, { status: 400 });
  if (await db.customer.findUnique({ where: { email } })) return NextResponse.json({ error: "exists" }, { status: 409 });

  const ref = b.referral ? await db.customer.findUnique({ where: { referralCode: String(b.referral).trim().toUpperCase() } }) : null;
  const month = b.birthMonth === "" || b.birthMonth == null ? null : Math.min(11, Math.max(0, Number(b.birthMonth)));
  // Claim past guest orders placed with this email (1 stamp per paid jar).
  const past = await db.order.findMany({ where: { email, customerId: null, status: { not: "cancelled" } } });
  const jars = past.reduce((a, o) => a + o.jarCount - (o.freeSalsaUsed ? 1 : 0), 0);
  const customer = await db.customer.create({
    data: {
      email, name, passwordHash: await hashPassword(password), phone: encrypt(b.phone ? String(b.phone).slice(0, 30) : null),
      offers: b.offers !== false, jars, birthMonth: Number.isFinite(month) ? month : null, referredBy: ref?.id,
    },
  });
  if (past.length) await db.order.updateMany({ where: { id: { in: past.map((o) => o.id) } }, data: { customerId: customer.id } });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie(customer.id));
  return res;
}
