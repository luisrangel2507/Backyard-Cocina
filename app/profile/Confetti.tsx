"use client";
import { useEffect, useState } from "react";

const COLORS = ["#d93a22", "#f0b03a", "#29b6e0", "#1f9a74", "#e8d9b0", "#d4237a"];

/** One-time burst when a free salsa is earned (shown once per reward count, remembered in the browser). */
export default function Confetti({ earned }: { earned: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!earned) return;
    try {
      if (localStorage.getItem("bc-confetti") === String(earned)) return;
      localStorage.setItem("bc-confetti", String(earned));
    } catch {}
    setOn(true);
    try { navigator.vibrate?.([30, 40, 30]); } catch {}
    const t = setTimeout(() => setOn(false), 3800);
    return () => clearTimeout(t);
  }, [earned]);
  if (!on) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 46 }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, background: COLORS[i % COLORS.length], animationDelay: `${(i % 12) * 0.08}s`, animationDuration: `${2.2 + (i % 5) * 0.3}s`, transform: `rotate(${i * 29}deg)`, width: i % 3 ? 8 : 6, height: i % 3 ? 12 : 6 }} />
      ))}
    </div>
  );
}
