"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { zoneFor, PICKUP_ADDRESS } from "@/lib/zones";

export default function CartPage() {
  const { cart, add } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const zone = zoneFor(zip);
  const [pickupSlot, setPickupSlot] = useState("");
  const [slots, setSlots] = useState<{ label: string; left: number }[]>([]);
  useEffect(() => { fetch("/api/slots").then((r) => r.json()).then((s) => { setSlots(s); setPickupSlot(s.find((x: any) => x.left > 0)?.label ?? ""); }); }, []);
  const [me, setMe] = useState<{ name: string; freeSalsas: number } | null>(null);
  const [clubOpen, setClubOpen] = useState(false);
  const [useFree, setUseFree] = useState(false);
  useEffect(() => { fetch("/api/me").then((r) => r.json()).then((d) => { setMe(d.member); setClubOpen(d.clubOpen); }).catch(() => {}); }, []);
  const [catalog, setCatalog] = useState<{ id: string; name: string; priceCents: number; jars: number }[]>([]);
  useEffect(() => { fetch("/api/products").then((r) => r.json()).then(setCatalog).catch(() => {}); }, []);
  const items = Object.entries(cart);
  const info = (id: string) => catalog.find((p) => p.id === id);
  const subtotal = items.reduce((a, [id, q]) => a + (info(id)?.priceCents ?? 0) * q, 0);
  const $ = (c: number) => `$${(c / 100).toFixed(2)}`;

  async function checkout() {
    setLoading(true); setError("");
    const res = await fetch("/api/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map(([id, quantity]) => ({ id, quantity })), fulfillment, address, zip, pickupSlot, useFree }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url; // Stripe-hosted checkout (card, Apple Pay, Google Pay)
    else { setError(data.error || "Checkout failed. Try again."); setLoading(false); }
  }

  return (
    <>
      <h2>Your cart</h2>
      {!items.length && <p>Nothing here yet. <a href="/shop" style={{ color: "var(--cream)" }}>Browse salsas</a></p>}
      {items.map(([id, q]) => {
        const p = info(id);
        return (
          <div className="cline" key={id}>
            <img src={`/${id}.jpg`} alt="" />
            <div className="cinfo">
              <b>{p?.name ?? id}</b>
              <small>{p ? `${$(p.priceCents)} each` : ""}{p && p.jars > 1 ? ` · ${p.jars} jars` : ""}</small>
              <span className="step">
                <button onClick={() => add(id, -1)} aria-label={`Remove one ${p?.name ?? id}`}>−</button>
                <b>{q}</b>
                <button onClick={() => add(id, 1)} aria-label={`Add one ${p?.name ?? id}`}>+</button>
              </span>
            </div>
            <b className="ctot">{p ? $(p.priceCents * q) : ""}</b>
          </div>
        );
      })}
      {items.length > 0 && <div className="csub"><span>Subtotal</span><b>{$(subtotal)}</b></div>}
      {items.length > 0 && (
        <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
          <b>How do you want it?</b>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(["pickup", "delivery"] as const).map((f) => (
              <button key={f} className="btn" onClick={() => setFulfillment(f)}
                style={{ background: fulfillment === f ? "var(--cream)" : "transparent", color: fulfillment === f ? "var(--navy)" : "var(--cream)", border: "1.5px solid var(--cream)" }}>
                {f === "pickup" ? "Pickup · Free" : "Delivery · by zone"}
              </button>
            ))}
          </div>
          {fulfillment === "delivery" ? (
            <>
              <input placeholder="ZIP code" inputMode="numeric" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value)} style={{ padding: 12, borderRadius: 10, border: 0 }} />
              {zip.length === 5 && (
                <small>{zone ? `Delivery to ${zone.name}: $${(zone.feeCents / 100).toFixed(2)}` : "We don't deliver to that ZIP yet. Choose pickup instead."}</small>
              )}
              <input placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ padding: 12, borderRadius: 10, border: 0 }} />
              <select value={pickupSlot} onChange={(e) => setPickupSlot(e.target.value)} style={{ padding: 12, borderRadius: 10, border: 0 }}>
                {slots.map((s) => <option key={s.label} value={s.label} disabled={s.left <= 0}>{s.label}{s.left <= 0 ? " · sold out" : ""}</option>)}
              </select>
            </>
          ) : (
            <>
            <p style={{ margin: 0 }}>Pickup at <b>{PICKUP_ADDRESS}</b></p>
            <select value={pickupSlot} onChange={(e) => setPickupSlot(e.target.value)} style={{ padding: 12, borderRadius: 10, border: 0 }}>
              {slots.map((s) => <option key={s.label} value={s.label} disabled={s.left <= 0}>{s.label}{s.left <= 0 ? " · sold out" : s.left <= 10 ? ` · only ${s.left} jars left` : ""}</option>)}
            </select>
            </>
          )}
        </div>
      )}
      {items.length > 0 && (me?.freeSalsas ?? 0) > 0 && (
        <label style={{ display: "block", marginTop: 16 }}>
          <input type="checkbox" checked={useFree} onChange={(e) => setUseFree(e.target.checked)} /> 🎁 Use my free salsa ({me!.freeSalsas} available)
        </label>
      )}
      {items.length > 0 && clubOpen && !me && <p style={{ marginTop: 16 }}><small><a href="/login" style={{ color: "var(--cream)" }}>Log in</a> to earn stamps and use free salsas.</small></p>}
      {items.length > 0 && (
        <button className="btn" style={{ marginTop: 20, width: "100%", padding: 14 }} onClick={checkout} disabled={loading || (fulfillment === "delivery" && !zone)}>
          {loading ? "Opening secure checkout…" : "Checkout"}
        </button>
      )}
      {error && <p style={{ color: "var(--tomato)" }}>{error}</p>}
    </>
  );
}
