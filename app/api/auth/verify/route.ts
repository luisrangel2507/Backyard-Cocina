import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashCode, sessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const b = await req.json();
  const email = String(b.email || "").trim().toLowerCase();
  const code = String(b.code || "").trim();
  const rec = await db.loginCode.findFirst({ where: { email }, orderBy: { createdAt: "desc" } });
  if (!rec || rec.expiresAt < new Date() || rec.attempts >= 5) return NextResponse.json({ error: "Code expired. Ask for a new one." }, { status: 400 });
  if (rec.codeHash !== hashCode(email, code)) {
    await db.loginCode.update({ where: { id: rec.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ error: "Wrong code" }, { status: 400 });
  }
  await db.loginCode.delete({ where: { id: rec.id } });

  let customer = await db.customer.findUnique({ where: { email } });
  if (!customer) {
    const name = String(b.name || "").trim();
    if (!name) return NextResponse.json({ error: "Add your name to sign up" }, { status: 400 });
    const ref = b.referral ? await db.customer.findUnique({ where: { referralCode: String(b.referral).trim().toUpperCase() } }) : null;
    // Claim past guest orders placed with this email (1 stamp per paid jar).
    const past = await db.order.findMany({ where: { email, customerId: null, status: { not: "cancelled" } } });
    const jars = past.reduce((a, o) => a + o.jarCount - (o.freeSalsaUsed ? 1 : 0), 0);
    customer = await db.customer.create({
      data: { email, name, phone: b.phone ? String(b.phone) : null, offers: b.offers !== false, jars, referredBy: ref?.id },
    });
    if (past.length) await db.order.updateMany({ where: { id: { in: past.map((o) => o.id) } }, data: { customerId: customer.id } });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie(customer.id));
  return res;
}
