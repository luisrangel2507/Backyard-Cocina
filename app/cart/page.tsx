"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { zoneFor, PICKUP_ADDRESS } from "@/lib/zones";
import { PageBar, useT } from "@/lib/i18n-client";

const box = { padding: 12, borderRadius: 10, border: 0 } as const;

export default function CartPage() {
  const { t } = useT();
  const { cart, add, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const zone = zoneFor(zip);
  const [pickupSlot, setPickupSlot] = useState("");
  const [slots, setSlots] = useState<{ label: string; left: number }[]>([]);
  useEffect(() => { fetch("/api/slots").then((r) => r.json()).then((s) => { setSlots(s); setPickupSlot(s.find((x: any) => x.left > 0)?.label ?? ""); }); }, []);
  const [me, setMe] = useState<{ name: string; freeSalsas: number } | null | undefined>(undefined);
  const [useFree, setUseFree] = useState(false);
  useEffect(() => { fetch("/api/me").then((r) => r.json()).then((d) => setMe(d.member)).catch(() => setMe(null)); }, []);
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
    else { setError(data.error || t("checkoutFail")); setLoading(false); }
  }

  return (
    <>
      <PageBar />
      <div className="cartpage">
        <h2>{t("cartTitle")}</h2>
        {!items.length && <p>{t("cartEmpty")} <Link href="/shop" style={{ color: "var(--cream)" }}>{t("browse")}</Link></p>}
        {items.map(([id, q]) => {
          const p = info(id);
          return (
            <div className="cline" key={id}>
              <img src={`/${id}.jpg`} alt="" />
              <div className="cinfo">
                <b>{p?.name ?? id}</b>
                <small>{p ? `${$(p.priceCents)} ${t("each")}` : ""}{p && p.jars > 1 ? ` · ${p.jars} ${t("jars")}` : ""}</small>
                <span className="step">
                  <button onClick={() => add(id, -1)} aria-label="−">−</button>
                  <b>{q}</b>
                  <button onClick={() => add(id, 1)} aria-label="+">+</button>
                </span>
              </div>
              <b className="ctot">{p ? $(p.priceCents * q) : ""}</b>
            </div>
          );
        })}
        {items.length > 0 && (
          <>
            <div className="csub"><span>{t("subtotal")}</span><b>{$(subtotal)}</b></div>
            <button className="linkbtn" onClick={clear}>{t("clearCart")}</button>
            <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
              <b>{t("howWant")}</b>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(["pickup", "delivery"] as const).map((f) => (
                  <button key={f} className="btn" onClick={() => setFulfillment(f)}
                    style={{ background: fulfillment === f ? "var(--cream)" : "transparent", color: fulfillment === f ? "var(--navy)" : "var(--cream)", border: "1.5px solid var(--cream)" }}>
                    {t(f === "pickup" ? "pickupFree" : "deliveryZone")}
                  </button>
                ))}
              </div>
              {fulfillment === "delivery" ? (
                <>
                  <input placeholder={t("zip")} inputMode="numeric" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value)} style={box} />
                  {zip.length === 5 && <small>{zone ? t("deliveryTo", { zone: zone.name, fee: $(zone.feeCents) }) : t("noDelivery")}</small>}
                  <input placeholder={t("street")} value={address} onChange={(e) => setAddress(e.target.value)} style={box} />
                  <select value={pickupSlot} onChange={(e) => setPickupSlot(e.target.value)} style={box}>
                    {slots.map((s) => <option key={s.label} value={s.label} disabled={s.left <= 0}>{s.label}{s.left <= 0 ? t("soldOutShort") : ""}</option>)}
                  </select>
                </>
              ) : (
                <>
                  <p style={{ margin: 0 }}>{t("pickupAt")} <b>{PICKUP_ADDRESS}</b></p>
                  <select value={pickupSlot} onChange={(e) => setPickupSlot(e.target.value)} style={box}>
                    {slots.map((s) => <option key={s.label} value={s.label} disabled={s.left <= 0}>{s.label}{s.left <= 0 ? t("soldOutShort") : s.left <= 10 ? t("onlyLeft", { n: s.left }) : ""}</option>)}
                  </select>
                </>
              )}
            </div>
            {(me?.freeSalsas ?? 0) > 0 && (
              <label style={{ display: "block", marginTop: 16 }}>
                <input type="checkbox" checked={useFree} onChange={(e) => setUseFree(e.target.checked)} /> {t("useFree", { n: me!.freeSalsas })}
              </label>
            )}
            {me === null && <p style={{ marginTop: 16 }}><small><Link href="/login" style={{ color: "var(--gold)", fontWeight: 700 }}>{t("loginToEarn")}</Link>{t("loginToEarn2")}</small></p>}
            <button className="btn" style={{ marginTop: 20, width: "100%", padding: 14, background: "var(--tomato)" }} onClick={checkout} disabled={loading || (fulfillment === "delivery" && !zone)}>
              {loading ? t("opening") : t("checkout")}
            </button>
          </>
        )}
        {error && <p style={{ color: "var(--tomato)" }}>{error}</p>}
      </div>
    </>
  );
}
