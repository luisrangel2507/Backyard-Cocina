"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { zoneFor, BLADE_NAME } from "@/lib/zones";
import { PageBar, useT } from "@/lib/i18n-client";
import SlotPicker, { type Slot } from "./SlotPicker";

const box = { padding: 12, borderRadius: 10, border: 0 } as const;

export default function CartPage() {
  const { t } = useT();
  const { cart, add, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "blade" | "delivery" | null>(null);
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const zone = zoneFor(zip);
  const [pickupSlot, setPickupSlot] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  useEffect(() => { fetch("/api/slots").then((r) => r.json()).then((s) => { setSlots(s); setPickupSlot(s.find((x: any) => x.left > 0)?.label ?? ""); }); }, []);
  const [me, setMe] = useState<{ name: string; freeSalsas: number } | null | undefined>(undefined);
  const [useFree, setUseFree] = useState(false);
  useEffect(() => { fetch("/api/me").then((r) => r.json()).then((d) => setMe(d.member)).catch(() => setMe(null)); }, []);
  const [catalog, setCatalog] = useState<{ id: string; name: string; priceCents: number; jars: number; bladeStock: number; image?: string | null }[]>([]);
  const [blade, setBlade] = useState<{ address: string; hours: string }>({ address: "", hours: "" });
  useEffect(() => { fetch("/api/blade").then((r) => r.json()).then(setBlade).catch(() => {}); }, []);
  useEffect(() => { fetch("/api/products").then((r) => r.json()).then(setCatalog).catch(() => {}); }, []);
  const items = Object.entries(cart);
  const info = (id: string) => catalog.find((p) => p.id === id);
  const subtotal = items.reduce((a, [id, q]) => a + (info(id)?.priceCents ?? 0) * q, 0);
  const $ = (c: number) => `$${(c / 100).toFixed(2)}`;
  // Items in the cart that Blade & Barber doesn't have enough of
  const bladeShort = items.map(([id, q]) => ({ p: info(id), q })).filter(({ p, q }) => p && p.bladeStock < q);

  // What is still missing before paying (shown next to the button, and the box below gets highlighted)
  const missing = !fulfillment ? t("needChoice")
    : fulfillment === "delivery" && (!zone || address.trim().length < 8) ? t("needAddress")
    : fulfillment !== "blade" && !pickupSlot ? t("needSlot")
    : fulfillment === "blade" && bladeShort.length > 0 ? t("needBladeStock")
    : "";
  const fbox = useRef<HTMLDivElement>(null);
  const [nudge, setNudge] = useState(0);
  const chosen = slots.find((x) => x.label === pickupSlot);

  async function checkout() {
    if (missing) {
      setNudge((n) => n + 1);
      fbox.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
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
              <img src={p?.image || `/${id}.jpg`} alt="" />
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
            <small className="muted" style={{ display: "block", textAlign: "right" }}>Sales tax is added at checkout</small>
            <button className="linkbtn" onClick={clear}>{t("clearCart")}</button>
            <div ref={fbox} key={nudge} className={`fbox${!fulfillment ? " pending" : ""}${nudge && missing ? " nudge" : ""}`}>
              <div className="fhead"><span className="fnum">1</span><div><b>{t("howWant")}</b><small>{t("chooseOne")}</small></div></div>
              <div className="fopts" role="radiogroup" aria-label={t("howWant")}>
                {([
                  ["pickup", "🏡", "optPickupT", "optPickupD"],
                  ["delivery", "🚗", "optDeliveryT", "optDeliveryD"],
                  ["blade", "💈", "optBladeT", "optBladeD"],
                ] as const).map(([f, icon, title, sub]) => (
                  <button key={f} type="button" role="radio" aria-checked={fulfillment === f} className="fopt" onClick={() => setFulfillment(f)}>
                    <span className="fico" aria-hidden="true">{icon}</span>
                    <span className="ftxt"><b>{t(title)}</b><small>{t(sub)}</small></span>
                    <span className="fdot" aria-hidden="true" />
                  </button>
                ))}
              </div>

              {fulfillment && (
                <div className="fstep2">
                  {fulfillment === "blade" ? (
                    <>
                      <p style={{ margin: 0 }}>{t("bladeAt")} <b>{BLADE_NAME}</b>{blade.address && <><br />📍 {blade.address}</>}{blade.hours && <><br />🕑 {t("bladeHours")} {blade.hours}</>}</p>
                      {bladeShort.length > 0
                        ? bladeShort.map(({ p }) => <small key={p!.id} style={{ color: "var(--tomato)", fontWeight: 700 }}>{p!.bladeStock > 0 ? t("bladeShort", { n: p!.bladeStock, name: p!.name }) : `${p!.name}: ${t("noneAtBlade")}`}</small>)
                        : <small>{t("bladeReady")}</small>}
                    </>
                  ) : (
                    <>
                      {fulfillment === "delivery" && (
                        <>
                          <div className="fhead"><span className="fnum">2</span><div><b>{t("whereTo")}</b></div></div>
                          <input placeholder={t("zip")} inputMode="numeric" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value)} style={box} />
                          {zip.length === 5 && <small>{zone ? t("deliveryTo", { zone: zone.name, fee: $(zone.feeCents) }) : t("noDelivery")}</small>}
                          <input placeholder={t("street")} value={address} onChange={(e) => setAddress(e.target.value)} style={box} />
                        </>
                      )}
                      <div className="fhead"><span className="fnum">{fulfillment === "delivery" ? 3 : 2}</span><div><b>{t("whenTitle")}</b>{fulfillment === "pickup" && <small>{t("pickupAddrLater")}</small>}</div></div>
                      <SlotPicker slots={slots} value={pickupSlot} onChange={setPickupSlot} />
                    </>
                  )}
                </div>
              )}
            </div>
            {(me?.freeSalsas ?? 0) > 0 && (
              <label style={{ display: "block", marginTop: 16 }}>
                <input type="checkbox" checked={useFree} onChange={(e) => setUseFree(e.target.checked)} /> {t("useFree", { n: me!.freeSalsas })}
              </label>
            )}
            {me === null && <p style={{ marginTop: 16 }}><small><Link href="/login" style={{ color: "var(--gold)", fontWeight: 700 }}>{t("loginToEarn")}</Link>{t("loginToEarn2")}</small></p>}
            <div className={`fsum${missing ? " warn" : ""}`} role="status">
              {missing ? <>👆 {missing}</> : <>✅ {t(fulfillment === "pickup" ? "optPickupT" : fulfillment === "delivery" ? "optDeliveryT" : "optBladeT")}{fulfillment !== "blade" && chosen && <> · <b>{chosen.dayName === "Today" ? t("today") : chosen.dayName === "Tomorrow" ? t("tomorrow") : chosen.dayName} · {chosen.time}</b></>}</>}
            </div>
            <button className={`btn${missing ? " soft" : ""}`} style={{ marginTop: 10, width: "100%", padding: 14, background: "var(--tomato)" }} onClick={checkout} disabled={loading}>
              {loading ? t("opening") : t("checkout")}
            </button>
          </>
        )}
        {error && <p style={{ color: "var(--tomato)" }}>{error}</p>}
      </div>
    </>
  );
}
