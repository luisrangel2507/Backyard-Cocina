import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { sessionCookie } from "@/lib/auth";

// 5 wrong tries per IP+email locks that login for 15 minutes.
const tries = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const { email: raw, password } = await req.json().catch(() => ({}));
  const email = String(raw || "").trim().toLowerCase();
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  const key = `${ip}|${email}`;
  const t = tries.get(key);
  if (t && t.until > Date.now()) return NextResponse.json({ error: "many" }, { status: 429 });

  const c = await db.customer.findUnique({ where: { email } });
  const ok = await verifyPassword(String(password || ""), c?.passwordHash);
  if (!c || !ok) {
    const n = (t?.n ?? 0) + 1;
    tries.set(key, { n: n >= 5 ? 0 : n, until: n >= 5 ? Date.now() + 15 * 60_000 : 0 });
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: n >= 5 ? "many" : "bad" }, { status: 401 });
  }
  tries.delete(key);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie(c.id));
  return res;
}
