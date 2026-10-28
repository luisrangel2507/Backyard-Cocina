import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";
import { sendEmail, resetPasswordEmail } from "@/lib/email";

const recent = new Map<string, number>();

// Always answers "ok" so nobody can find out which emails have accounts.
export async function POST(req: Request) {
  const { email: raw } = await req.json().catch(() => ({}));
  const email = String(raw || "").trim().toLowerCase();
  const last = recent.get(email) ?? 0;
  if (email && Date.now() - last > 60_000) {
    recent.set(email, Date.now());
    const c = await db.customer.findUnique({ where: { email } });
    if (c) {
      const token = randomBytes(32).toString("base64url");
      await db.passwordReset.create({ data: { customerId: c.id, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 3600_000) } });
      const site = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/+$/, "");
      await sendEmail(email, "Reset your Backyard Club password", resetPasswordEmail(`${site}/reset?token=${token}`));
    }
  }
  return NextResponse.json({ ok: true });
}
