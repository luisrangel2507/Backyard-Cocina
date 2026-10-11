import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// QR landing: remember the partner for 30 days, then send the visitor to the shop.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase();
  const res = NextResponse.redirect(new URL("/shop", process.env.NEXT_PUBLIC_SITE_URL || req.url));
  if (await db.partner.findFirst({ where: { code, active: true } }))
    res.cookies.set({ name: "bc_ref", value: code, path: "/", maxAge: 30 * 24 * 3600, sameSite: "lax", httpOnly: true });
  return res;
}
