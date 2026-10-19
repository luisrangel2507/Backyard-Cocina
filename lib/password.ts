import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/** scrypt hash stored as "s1:<salt>:<hash>" (never store plain passwords). */
export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const h = await scrypt(pw, salt, 64);
  return `s1:${salt.toString("base64url")}:${h.toString("base64url")}`;
}

export async function verifyPassword(pw: string, stored: string | null | undefined) {
  if (!stored?.startsWith("s1:")) return false;
  const [, s, h] = stored.split(":");
  const expected = Buffer.from(h, "base64url");
  const got = await scrypt(pw, Buffer.from(s, "base64url"), expected.length);
  return got.length === expected.length && timingSafeEqual(got, expected);
}
