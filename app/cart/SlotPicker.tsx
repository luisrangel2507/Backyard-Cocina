"use client";
import { useT } from "@/lib/i18n-client";

export type Slot = { label: string; day: string; left: number; dayName: string; time: string };

// Pick a day, then a time window. Only future windows come from the server, so nothing here can be in the past.
export default function SlotPicker({ slots, value, onChange }: { slots: Slot[]; value: string; onChange: (label: string) => void }) {
  const { t, lang } = useT();
  const days = Array.from(new Map(slots.map((s) => [s.day, s])).values());
  const cur = slots.find((s) => s.label === value);
  const day = cur?.day ?? days[0]?.day;
  const dayLabel = (s: Slot) => {
    if (s.dayName === "Today") return t("today");
    if (s.dayName === "Tomorrow") return t("tomorrow");
    const d = new Date(`${s.day}T12:00:00`);
    return d.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { weekday: "short", month: "short", day: "numeric" });
  };
  if (!slots.length) return <p className="slot-none">{t("noSlots")}</p>;
  return (
    <div className="slotpick">
      <div className="slot-days" role="radiogroup" aria-label={t("pickDay")}>
        {days.map((s) => {
          const full = slots.filter((x) => x.day === s.day).every((x) => x.left <= 0);
          return (
            <button key={s.day} type="button" role="radio" aria-checked={s.day === day} disabled={full}
              className="slot-day" onClick={() => onChange(slots.find((x) => x.day === s.day && x.left > 0)?.label ?? "")}>
              {dayLabel(s)}{full && <small>{t("soldOutShort").replace(/^ · /, "")}</small>}
            </button>
          );
        })}
      </div>
      <div className="slot-times" role="radiogroup" aria-label={t("pickTime")}>
        {slots.filter((s) => s.day === day).map((s) => (
          <button key={s.label} type="button" role="radio" aria-checked={s.label === value} disabled={s.left <= 0}
            className="slot-time" onClick={() => onChange(s.label)}>
            🕑 {s.time}
          </button>
        ))}
      </div>
      {cur && cur.left > 0 && cur.left <= 10 && <small className="slot-left">{t("onlyLeft", { n: cur.left }).replace(/^ · /, "")}</small>}
    </div>
  );
}
