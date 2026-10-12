import { NextResponse } from "next/server";
import { adminCookie, adminToken } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const { user, password } = await req.json();
  const ok = !!process.env.ADMIN_PASSWORD && String(user).trim().toLowerCase() === (process.env.ADMIN_USER || "brant").toLowerCase() && password === process.env.ADMIN_PASSWORD;
  if (!ok) { await new Promise((r) => setTimeout(r, 800)); return NextResponse.json({ error: "Wrong user or password" }, { status: 401 }); }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie(await adminToken()));
  return res;
}
