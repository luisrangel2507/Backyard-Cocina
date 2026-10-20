"use client";
import { useEffect, useState } from "react";

// Salsa "pour" transition: two sheets of salsa fall over the screen (covering it), and on the next page they drain away.
const DRIPS = "M0 0H400V40C392 40 390 70 384 70C378 70 378 44 366 44C352 44 354 96 342 96C330 96 332 52 318 52C304 52 304 120 292 120C280 120 282 58 266 58C252 58 254 84 242 84C230 84 232 48 218 48C204 48 206 108 194 108C182 108 184 56 168 56C154 56 156 90 144 90C132 90 134 46 120 46C106 46 108 130 96 130C84 130 86 62 70 62C56 62 58 82 46 82C34 82 36 50 22 50C12 50 12 76 0 76Z";

function Sheet({ cls, color }: { cls: string; color: string }) {
  return (
    <div className={`pour ${cls}`} style={{ ["--c" as any]: color }}>
      <div className="pour-body" />
      <svg className="pour-drips" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true"><path d={DRIPS} fill={color} /></svg>
    </div>
  );
}

export function Curtain({ mode }: { mode: "in" | "out" }) {
  return (
    <div className={`curtain curtain-${mode}`} aria-hidden="true">
      <Sheet cls="p1" color="#8f1008" />
      <Sheet cls="p2" color="#d92b16" />
      <Sheet cls="p3" color="#f0762a" />
    </div>
  );
}

/** Mount on the destination page: if we arrived through the pour, drain it off. */
export function PourArrival() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem("bc-pour") !== "1") return;
      sessionStorage.removeItem("bc-pour");
    } catch { return; }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setOn(true);
    const t = setTimeout(() => setOn(false), 1900);
    return () => clearTimeout(t);
  }, []);
  return on ? <Curtain mode="out" /> : null;
}

/** Starts the pour, then navigates once the screen is covered. */
export function usePourNavigate(router: { push: (href: string) => void; prefetch: (href: string) => void }, href: string) {
  const [pouring, setPouring] = useState(false);
  useEffect(() => { try { router.prefetch(href); } catch {} }, [router, href]);
  const go = () => {
    if (pouring) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push(href); return; }
    setPouring(true);
    try { navigator.vibrate?.([20, 30, 20]); sessionStorage.setItem("bc-pour", "1"); } catch {}
    setTimeout(() => router.push(href), 1250);
  };
  return { pouring, go };
}
