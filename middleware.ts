import { NextResponse, type NextRequest } from "next/server";

// Protects /admin with a username/password prompt (set ADMIN_USER / ADMIN_PASSWORD).
export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const [user, pass] = atob(auth.replace(/^Basic\s+/i, "") || "Og==").split(":");
  if (user === (process.env.ADMIN_USER || "brant") && pass && pass === process.env.ADMIN_PASSWORD) return NextResponse.next();
  return new NextResponse("Kitchen admin login required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Backyard Cocina admin"' } });
}
export const config = { matcher: ["/admin/:path*"] };
