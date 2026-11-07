"use client";
import { useState, useTransition } from "react";
import { recordSale } from "./actions";

type P = { id: string; name: string; priceCents: number; color: string; image: string; stock: number; jars: number };
const G = (d: React.ReactNode) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const BADGE: Record<string, React.ReactNode> = {
  fire: G(<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 3-6 0 2 1 3 2 3 1-2 0-4 0-7z" />),
  sun: G(<><path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 7V4M5.500 11.500 4 10M18.500 11.500 20 10" /></>),
  leaf: G(<><path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z" /><path d="M5 19 13 11" /></>),
  heart: G(<path d="M12 20s-7-4.500-7-10a4 4 0 0 1 7-2.500A4 4 0 0 1 19 10c0 5.500-7 10-7 10z" />),
  devil: G(<><path d="M6 4l2 4M18 4l-2 4" /><circle cx="12" cy="14" r="6" /><path d="M9.500 13h.01M14.500 13h.01M9.500 16.500c1.500 1 3.500 1 5 0" /></>),
  pack: G(<><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" /></>),
};
const badgeFor = (p: P) => (p.jars > 1 ? "pack" : ({ nomames: "fire", creamy: "sun", verde: "leaf", mamacita: "heart", roja: "devil" } as Record<string, string>)[p.id] ?? "fire");
const $ = (c: number) => `$${(c / 100).toFixed(2)}`;
const PAY = [["cash", "💵 Cash"], ["card", "💳 Card"], ["venmo", "Venmo"], ["zelle", "Zelle"], ["other", "Other"]] as const;

// Tap-to-sell menu for in-person sales (market stand, pickup counter, barbershop).
export default function PosMenu({ products }: { products: P[] }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [pay, setPay] = useState<string>("cash");
  const [email, setEmail] = useState("");
  const [discount, setDiscount] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const add = (id: string, d: number) => setCart((c) => { const q = Math.max(0, (c[id] || 0) + d); const n = { ...c, [id]: q }; if (!q) delete n[id]; return n; });
  const subtotal = products.reduce((a, p) => a + p.priceCents * (cart[p.id] || 0), 0);
  const disc = Math.min(subtotal, Math.round(Number(discount || 0) * 100) || 0);
  const total = subtotal - disc;
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  const charge = () => start(async () => {
    setMsg("");
    const r = await recordSale({ items: Object.entries(cart).map(([id, q]) => ({ id, q })), payment: pay, email, discountCents: disc });
    if (!r.ok) { setMsg(r.error); return; }
    try { navigator.vibrate?.(30); } catch {}
    setMsg(`✓ Sale saved · ${$(r.total ?? total)}${r.member ? ` · stamps added for ${r.member}` : ""}`);
    setCart({}); setEmail(""); setDiscount("");
  });

  return (
    <section className="pos">
      <div className="posgrid">
        {products.map((p) => (
          <button key={p.id} className="positem" style={{ ["--c" as any]: p.color }} onClick={() => add(p.id, 1)}>
            <span className="pimgw"><img src={p.image} alt="" /><i className="pbadge">{BADGE[badgeFor(p)]}</i></span>
            <span className="pn">{p.name}</span>
            <span className="pp">{$(p.priceCents)}</span>
            {cart[p.id] ? <span className="pq">{cart[p.id]}</span> : null}
            {p.stock < 1 && <span className="pso">sold out online</span>}
          </button>
        ))}
      </div>

      {count > 0 && (
        <div className="posticket">
          {products.filter((p) => cart[p.id]).map((p) => (
            <div key={p.id} className="posline">
              <span>{p.name}</span>
              <span className="step"><button onClick={() => add(p.id, -1)}>−</button><b>{cart[p.id]}</b><button onClick={() => add(p.id, 1)}>+</button></span>
              <b>{$(p.priceCents * cart[p.id])}</b>
            </div>
          ))}
          <div className="pospay">{PAY.map(([k, l]) => <button key={k} aria-pressed={pay === k} onClick={() => setPay(k)}>{l}</button>)}</div>
          <div className="posextra">
            <input type="email" placeholder="Club email (adds stamps)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="number" inputMode="decimal" step="0.01" min="0" placeholder="Discount $" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
          {disc > 0 && <div className="posline"><span>Discount</span><span /><b>−{$(disc)}</b></div>}
          <button className="poscharge" disabled={pending} onClick={charge}>{pending ? "Saving…" : `Record sale · ${$(total)}`}</button>
          <button className="linkbtn" onClick={() => setCart({})}>Clear</button>
        </div>
      )}
      {msg && <p className="posmsg" style={{ color: msg.startsWith("✓") ? "#5fd39a" : "#ff8a75" }}>{msg}</p>}
    </section>
  );
}
