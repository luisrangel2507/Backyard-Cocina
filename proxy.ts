import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminCookie, adminToken } from "@/lib/adminAuth";

// Protects /admin: requires the login cookie set by /admin-login (ADMIN_USER / ADMIN_PASSWORD).
export async function proxy(req: NextRequest) {
  const token = await adminToken();
  if (process.env.ADMIN_PASSWORD && req.cookies.get(ADMIN_COOKIE)?.value === token) {
    const res = NextResponse.next();
    res.cookies.set(adminCookie(token)); // sliding 2-hour idle timeout
    return res;
  }
  return NextResponse.redirect(new URL("/admin-login", req.url));
}
export const config = { matcher: ["/admin/:path*"] };
