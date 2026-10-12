// Admin session token: a hash of the admin credentials, so changing ADMIN_PASSWORD logs everyone out.
export const ADMIN_COOKIE = "bc_admin";
/** Admin is logged out after this much inactivity; every admin page view restarts the clock. */
export const ADMIN_IDLE_SECONDS = 2 * 3600;
export const adminCookie = (value: string) => ({ name: ADMIN_COOKIE, value, httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: ADMIN_IDLE_SECONDS });
export async function adminToken() {
  const raw = `${process.env.ADMIN_USER || "brant"}:${process.env.ADMIN_PASSWORD || ""}:${process.env.AUTH_SECRET || ""}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
