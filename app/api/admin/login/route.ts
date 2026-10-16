import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "crypto";
import { adminCookie, adminToken } from "@/lib/adminAuth";

// Brute-force protection: 5 wrong tries per IP locks login for 15 minutes.
const MAX_TRIES = 5, LOCK_MS = 15 * 60_000;
const tries = new Map<string, { n: number; until: number }>();
const same = (a: string, b: string) => {
  const h = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(h(a), h(b));
};

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  const t = tries.get(ip);
  if (t && t.until > Date.now()) return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });

  const expected = process.env.ADMIN_PASSWORD || "";
  if (expected.length < 12) return NextResponse.json({ error: "Admin password is not set up securely (min 12 characters). Update ADMIN_PASSWORD in Railway." }, { status: 503 });

  const { user, password } = await req.json().catch(() => ({}));
  const ok = same(String(user ?? "").trim().toLowerCase(), (process.env.ADMIN_USER || "brant").toLowerCase()) && same(String(password ?? ""), expected);
  if (!ok) {
    const n = (t?.n ?? 0) + 1;
    const locked = n >= MAX_TRIES;
    tries.set(ip, { n: locked ? 0 : n, until: locked ? Date.now() + LOCK_MS : 0 });
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: locked ? "Too many attempts. Try again in 15 minutes." : "Wrong user or password" }, { status: 401 });
  }
  tries.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie(await adminToken()));
  return res;
}
