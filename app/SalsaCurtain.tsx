"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/*
  Salsa pour transition.
  One persistent layer lives in the root layout, so it never unmounts between pages (no flash):
    1. "in"   – salsa pours down and covers the screen (drips stretch as they fall, droplets lead the way)
    2. "hold" – we navigate underneath and wait until the new page has painted and its key images are decoded
    3. "out"  – the salsa keeps falling and drains off the bottom, revealing the page
*/
type Phase = "idle" | "in" | "hold" | "out";
const IN_MS = 1050, OUT_MS = 1150;
const KEY_IMAGES = ["/salsa-pour.webp", "/signature-title.webp", "/cloth.webp", "/trio.jpg", "/verde.jpg", "/roja.jpg", "/creamy.jpg"];

export function pour(href: string) {
  window.dispatchEvent(new CustomEvent("bc:pour", { detail: href }));
}

function decode(src: string) {
  return new Promise<void>((res) => { const i = new Image(); i.src = src; (i.decode ? i.decode() : Promise.reject()).then(() => res(), () => res()); });
}

const DROPS = [[8, 0, 14], [19, .12, 9], [31, .05, 18], [44, .18, 11], [57, .02, 15], [68, .15, 10], [79, .07, 17], [90, .2, 12]];

export function SalsaPour() {
  const router = useRouter();
  const path = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const target = useRef<string | null>(null);
  const covered = useRef(false);

  // warm the cache so the pour itself never waits on a download
  useEffect(() => { KEY_IMAGES.slice(0, 2).forEach(decode); }, []);

  useEffect(() => {
    const onPour = (e: Event) => {
      const href = (e as CustomEvent<string>).detail;
      if (target.current) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push(href); return; }
      target.current = href;
      covered.current = false;
      try { router.prefetch(href); navigator.vibrate?.([18, 40, 18]); } catch {}
      KEY_IMAGES.forEach(decode);
      document.documentElement.dataset.pouring = "1"; // freezes entrance animations underneath
      setPhase("in");
      setTimeout(() => { covered.current = true; setPhase("hold"); router.push(href); }, IN_MS);
    };
    addEventListener("bc:pour", onPour);
    return () => removeEventListener("bc:pour", onPour);
  }, [router]);

  // once the destination page is on screen (and painted), drain the salsa away
  useEffect(() => {
    if (phase !== "hold" || !target.current || path !== target.current.split("?")[0]) return;
    let cancelled = false;
    const painted = new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const ready = Promise.all([painted, document.fonts?.ready ?? Promise.resolve(), ...KEY_IMAGES.map(decode)]);
    const timeout = new Promise((r) => setTimeout(r, 900));
    Promise.race([ready, timeout]).then(() => {
      if (cancelled) return;
      setPhase("out");
      setTimeout(() => {
        delete document.documentElement.dataset.pouring;
        target.current = null;
        setPhase("idle");
      }, OUT_MS + 80);
    });
    return () => { cancelled = true; };
  }, [phase, path]);

  if (phase === "idle") return null;
  return (
    <div className={`curtain curtain-${phase}`} aria-hidden="true">
      <div className="pour p1"><div className="pour-body" /><div className="pour-drips"><div /></div></div>
      <div className="pour p2"><div className="pour-body" /><div className="pour-drips"><div /></div><div className="pour-gloss" /></div>
      <div className="pour-drops">{DROPS.map(([x, d, s], i) => <i key={i} style={{ left: `${x}%`, width: s, height: s * 1.35, animationDelay: `${d}s` }} />)}</div>
    </div>
  );
}
