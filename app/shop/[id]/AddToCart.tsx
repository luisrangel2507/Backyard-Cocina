"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useT } from "@/lib/i18n-client";

// Quantity + "Add to cart" on the salsa's own page (same behavior as the shop cards).
export default function AddToCart({ id, soldOut }: { id: string; soldOut: boolean }) {
  const { t } = useT();
  const { add, count } = useCart();
  const [q, setQ] = useState(1);
  const [done, setDone] = useState(false);
  return (
    <div className="dbuy">
      <div className="buy">
        <span className="step">
          <button onClick={() => setQ(Math.max(1, q - 1))} aria-label="−">−</button>
          <b>{q}</b>
          <button onClick={() => setQ(Math.min(24, q + 1))} aria-label="+">+</button>
        </span>
        <button className={`addbtn${done ? " done" : ""}`} disabled={soldOut}
          onClick={() => { try { navigator.vibrate?.(14); } catch {} add(id, q); setQ(1); setDone(true); setTimeout(() => setDone(false), 1100); }}>
          {soldOut ? t("soldOut") : done ? t("added") : t("add")}
        </button>
      </div>
      {count > 0 && <Link className="dcart" href="/cart">🛒 {t("viewCart")} <b>({count})</b></Link>}
    </div>
  );
}
