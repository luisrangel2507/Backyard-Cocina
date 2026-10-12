import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminToken } from "@/lib/adminAuth";

// Protects /admin: requires the login cookie set by /admin-login (ADMIN_USER / ADMIN_PASSWORD).
export async function proxy(req: NextRequest) {
  if (process.env.ADMIN_PASSWORD && req.cookies.get(ADMIN_COOKIE)?.value === (await adminToken())) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin-login", req.url));
}
export const config = { matcher: ["/admin/:path*"] };
