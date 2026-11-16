import { db } from "./db";

/** Blade & Barber pickup info, edited in /admin → Partners. */
export async function bladeInfo() {
  const s = await db.settings.findUnique({ where: { id: 1 } });
  return { address: s?.bladeAddress ?? "", hours: s?.bladeHours ?? "" };
}
