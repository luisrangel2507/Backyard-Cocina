"use client";
import { useEffect, useState } from "react";

// Salsa "pour" transition: two sheets of salsa fall over the screen (covering it), and on the next page they drain away.

function Sheet({ cls }: { cls: string }) {
  return (
    <div className={`pour ${cls}`}>
      <div className="pour-body" />
      <div className="pour-drips"><div /></div>
    </div>
  );
}

export function Curtain({ mode }: { mode: "in" | "out" }) {
  return (
    <div className={`curtain curtain-${mode}`} aria-hidden="true">
      <Sheet cls="p1" />
      <Sheet cls="p2" />
      <Sheet cls="p3" />
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
