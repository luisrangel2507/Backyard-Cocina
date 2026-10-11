import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { db } from "@/lib/db";
import { clubOpen, hashCode, sendCode } from "@/lib/auth";

export async function POST(req: Request) {
  if (!clubOpen()) return NextResponse.json({ error: "Backyard Club sign-up opens soon. You can still order as a guest." }, { status: 503 });
  const { email: raw } = await req.json();
  const email = String(raw || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  const recent = await db.loginCode.count({ where: { email, createdAt: { gt: new Date(Date.now() - 60_000) } } });
  if (recent) return NextResponse.json({ error: "Wait a minute before asking for another code" }, { status: 429 });
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.loginCode.deleteMany({ where: { OR: [{ email }, { expiresAt: { lt: new Date() } }] } });
  await db.loginCode.create({ data: { email, codeHash: hashCode(email, code), expiresAt: new Date(Date.now() + 10 * 60_000) } });
  await sendCode(email, code);
  const isNew = !(await db.customer.findUnique({ where: { email } }));
  return NextResponse.json({ ok: true, isNew });
}
