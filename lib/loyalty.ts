import type { Customer } from "@prisma/client";

export const FREE_SALSA_EVERY = 10;
export const FREE_MERCH_EVERY = 20;

export const freeSalsasAvailable = (c: Customer) => Math.floor(c.jars / FREE_SALSA_EVERY) + c.bonusFree - c.freeUsed;
export const merchAvailable = (c: Customer) => Math.floor(c.jars / FREE_MERCH_EVERY) - c.merchUsed;
export const jarsToNextFree = (c: Customer) => FREE_SALSA_EVERY - (c.jars % FREE_SALSA_EVERY);

/** Short shareable code, e.g. BY-K3F9Q */
export const makeReferralCode = () => "BY-" + Math.random().toString(36).slice(2, 7).toUpperCase();

/** Give one free salsa during the customer's birthday month, once per year. Returns true if granted. */
export function birthdayDue(c: Customer, now = new Date()) {
  return c.birthMonth === now.getMonth() && c.bdayYear !== now.getFullYear();
}
