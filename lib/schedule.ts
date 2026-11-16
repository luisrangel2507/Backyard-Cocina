import { db } from "./db";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const slotsFor = (s: { slots: string[]; daySlots?: unknown }, day: number): string[] => {
  const m = (s.daySlots ?? {}) as Record<string, string[]>;
  return m[day]?.length ? m[day] : s.slots;
};
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Start of a window like "10 am–12 pm", "4–6 pm" or "11:30 am–1 pm", in minutes after midnight (null if it can't be read). */
export function windowStart(slot: string): number | null {
  const [a, b = ""] = slot.toLowerCase().split(/[–—-]/);
  const m = a.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!m) return null;
  const mer = m[3] ?? b.match(/(am|pm)/)?.[1]; // "4–6 pm": the start takes the end's am/pm
  let h = Number(m[1]) % 12;
  if (mer === "pm") h += 12;
  if (!mer && h < 7) h += 12; // no am/pm at all: assume afternoon for small numbers
  return h * 60 + Number(m[2] ?? 0);
}

/** Next open pickup/delivery windows (Pacific time) with jars left for each day. Windows that already started today are left out. */
export async function openSlots(count = 8) {
  const s = (await db.settings.findUnique({ where: { id: 1 } })) ?? { days: [4, 5, 6, 0], slots: ["10 am–12 pm", "4–6 pm"], cap: 40 };
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const out: { label: string; day: string; left: number; dayName: string; time: string }[] = [];
  for (let i = 0; out.length < count && i < 21; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i);
    if (!s.days.includes(d.getDay())) continue;
    const times = slotsFor(s, d.getDay()).filter((slot) => {
      if (i > 0) return true;
      const start = windowStart(slot);
      return start === null || start > nowMin;
    });
    if (!times.length) continue;
    const day = iso(d);
    const used = await db.order.aggregate({ _sum: { jarCount: true }, where: { slotDay: day, status: { not: "cancelled" } } });
    const left = s.cap - (used._sum.jarCount ?? 0);
    const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${DAY[d.getDay()]}, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    for (const time of times) out.push({ label: `${dayName} · ${time}`, day, left, dayName, time });
  }
  return out;
}
