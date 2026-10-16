import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

// AES-256-GCM encryption for personal data at rest (customer phone numbers and delivery addresses).
// Key: DATA_ENCRYPTION_KEY (falls back to AUTH_SECRET). Changing it makes existing encrypted data unreadable.
const PREFIX = "enc:v1:";
const key = () => {
  const k = process.env.DATA_ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!k) throw new Error("DATA_ENCRYPTION_KEY or AUTH_SECRET must be set");
  return createHash("sha256").update(k).digest();
};

export function encrypt(plain: string | null | undefined): string | null {
  if (!plain) return null;
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return PREFIX + [iv, c.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

/** Decrypts values written by encrypt(); older plaintext values are returned as-is. */
export function decrypt(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith(PREFIX)) return value;
  try {
    const [iv, tag, data] = value.slice(PREFIX.length).split(".").map((s) => Buffer.from(s, "base64url"));
    const d = createDecipheriv("aes-256-gcm", key(), iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(data), d.final()]).toString("utf8");
  } catch {
    return null;
  }
}
