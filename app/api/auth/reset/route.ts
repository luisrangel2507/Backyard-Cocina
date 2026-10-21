import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { sessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { token, password } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || password.length < 8 || password.length > 200) return NextResponse.json({ error: "Use 8 or more characters" }, { status: 400 });
  const r = await db.passwordReset.findUnique({ where: { tokenHash: createHash("sha256").update(String(token || "")).digest("hex") } });
  if (!r || r.usedAt || r.expiresAt < new Date()) return NextResponse.json({ error: "This link expired. Ask for a new one." }, { status: 400 });
  await db.$transaction([
    db.customer.update({ where: { id: r.customerId }, data: { passwordHash: await hashPassword(password) } }),
    db.passwordReset.update({ where: { id: r.id }, data: { usedAt: new Date() } }),
    db.passwordReset.deleteMany({ where: { customerId: r.customerId, usedAt: null } }),
  ]);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie(r.customerId));
  return res;
}
