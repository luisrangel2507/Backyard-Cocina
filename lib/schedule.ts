import { db } from "./db";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const slotsFor = (s: { slots: string[]; daySlots?: unknown }, day: number): string[] => {
  const m = (s.daySlots ?? {}) as Record<string, string[]>;
  return m[day]?.length ? m[day] : s.slots;
};
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Next open pickup/delivery windows (Pacific time) with jars left for each day. */
export async function openSlots(count = 8) {
  const s = (await db.settings.findUnique({ where: { id: 1 } })) ?? { days: [4, 5, 6, 0], slots: ["10 am–12 pm", "4–6 pm"], cap: 40 };
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const out: { label: string; day: string; left: number }[] = [];
  for (let i = 0; out.length < count && i < 21; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i);
    if (!s.days.includes(d.getDay())) continue;
    const day = iso(d);
    const used = await db.order.aggregate({ _sum: { jarCount: true }, where: { slotDay: day, status: { not: "cancelled" } } });
    const left = s.cap - (used._sum.jarCount ?? 0);
    const name = i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${DAY[d.getDay()]}, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    for (const slot of slotsFor(s, d.getDay())) out.push({ label: `${name} · ${slot}`, day, left });
  }
  return out;
}
