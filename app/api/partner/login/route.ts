import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { partnerSessionCookie } from "@/lib/partnerAuth";

// Brute-force protection: 5 wrong tries per IP locks login for 15 minutes.
const MAX_TRIES = 5, LOCK_MS = 15 * 60_000;
const tries = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  const t = tries.get(ip);
  if (t && t.until > Date.now()) return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });

  const { user, password } = await req.json().catch(() => ({}));
  const username = String(user ?? "").trim().toLowerCase();
  const p = username ? await db.partner.findFirst({ where: { username } }) : null;
  const ok = !!p && p.active && (await verifyPassword(String(password ?? ""), p.passwordHash));
  if (!ok) {
    const n = (t?.n ?? 0) + 1;
    const locked = n >= MAX_TRIES;
    tries.set(ip, { n: locked ? 0 : n, until: locked ? Date.now() + LOCK_MS : 0 });
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: locked ? "Too many attempts. Try again in 15 minutes." : "Wrong user or password" }, { status: 401 });
  }
  tries.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(partnerSessionCookie(p!));
  return res;
}
