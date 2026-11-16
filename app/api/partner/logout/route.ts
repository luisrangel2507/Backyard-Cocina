import { NextResponse } from "next/server";
import { clearPartnerCookie } from "@/lib/partnerAuth";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/partner-login", req.url), 303);
  res.cookies.set(clearPartnerCookie);
  return res;
}
