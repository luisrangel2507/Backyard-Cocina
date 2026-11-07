"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pour } from "./SalsaCurtain";

// Full-screen splash, laid out purely in CSS (no measuring in JS, so nothing jumps on load).
// The tappable area sits exactly on the button drawn in /splash.jpg (851×1848), positioned in % of the art.
export default function Welcome() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  useEffect(() => { router.prefetch("/shop"); try { sessionStorage.setItem("bc-intro", "1"); } catch {} }, [router]);
  return (
    <div className="splash">
      <div className="splash-art">
        <img src="/splash.jpg" alt="Welcome to my Backyard Cocina" width={851} height={1848} fetchPriority="high" decoding="sync" />
        <button aria-label="Order our salsas" disabled={busy} className="splash-hit" onClick={() => { setBusy(true); pour("/shop"); }} />
      </div>
    </div>
  );
}
