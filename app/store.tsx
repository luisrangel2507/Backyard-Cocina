"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@prisma/client";
import { useCart } from "@/lib/cart";

const money = (c: number) => `$${(c / 100).toFixed(2)}`;
const CATS: [string, string][] = [["All", ""], ["Verde", "🌿"], ["Creamy", "🧄"], ["Roja", "🌶️"], ["Packs", "🎁"]];
export type Rating = { avg: number; count: number };
const Stars = ({ r }: { r: Rating }) => (
  <span className="stars" aria-label={`${r.avg.toFixed(1)} out of 5`}>{"★★★★★"} <b>{r.avg.toFixed(1)}</b> <small>({r.count})</small></span>
);

export default function Store({ products, ratings = {} }: { products: Product[]; ratings?: Record<string, Rating> }) {
  const { cart, add, count } = useCart();
  const [cat, setCat] = useState("All");
  const [menu, setMenu] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>({});
  const single = Math.min(...products.filter((p) => p.jars === 1).map((p) => p.priceCents));
  const subtotal = Object.entries(cart).reduce((a, [id, q]) => a + (products.find((p) => p.id === id)?.priceCents ?? 0) * q, 0);
  const last = Object.keys(cart).slice(-1)[0];

  return (
    <>
      <header className="hero">
        <div className="hrow">
          <button className="icon" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <Link href="/shop" className="logo"><img src="/logo.png" alt="" /><span>BACKYARD<br />COCINA</span></Link>
          <Link className="icon" href="/cart" aria-label="Open cart">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h2l2.4 11h10.2L20 7H6.2" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" /></svg>
            {count > 0 && <span className="badge">{count}</span>}
          </Link>
        </div>
        {menu && (
          <nav className="menu">
            <Link href="/shop" onClick={() => setMenu(false)}>Order salsas</Link>
            <Link href="/story">Our story</Link>
            {/* story moved into the menu */}
            <Link href="/merch">Merch · soon</Link>
            <Link href="/cart">View cart</Link>
            <Link href="/admin">Kitchen login 🔒</Link>
          </nav>
        )}
        <div className="brand">
          <div><h2>OUR<br />SALSAS</h2><p className="slogan">Small batches.<br />Big flavor.</p></div>
          <img src="/trio.jpg" alt="" />
        </div>
      </header>

      <div className="chips">
        {CATS.map(([c, e]) => <button key={c} className="chip" aria-pressed={c === cat} onClick={() => setCat(c)}>{e && <span aria-hidden="true">{e}</span>}{c}</button>)}
      </div>

      <div className="list">
        {products.filter((p) => cat === "All" || p.category === cat).map((p) => {
          const q = qty[p.id] || 1, r = ratings[p.id];
          const save = p.jars > 1 && isFinite(single) ? p.jars * single - p.priceCents : 0;
          return (
            <article className="pc" key={p.id} style={{ ["--c" as any]: p.color }}>
              <Link className="pimg" href={`/shop/${p.id}`}><img src={`/${p.id}.jpg`} alt={p.name} />{p.jars > 1 && <span className="pack">{p.jars} jars</span>}</Link>
              <div className="pbody">
                <span className="eyebrow">{p.jars > 1 ? "Pack" : "Salsa"}</span>
                {p.jars === 1 && <span className="oz">12 oz</span>}
                <h3>{p.name.replace(/^Salsa\s+|\s+Salsa$/i, "")}</h3>
                <span className="chili" aria-label={`Heat ${p.heat} of 5`} title={`Heat ${p.heat} of 5`}>{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= p.heat ? "on" : ""}>🌶</i>)}<small>{["", "Mild", "Mild", "Medium", "Hot", "Extra hot"][p.heat] ?? ""}</small></span>
                <p>{p.description}</p>
                {p.jars > 1 && <div className="pairs">{p.pairs.map((x) => <span key={x}>{x}</span>)}</div>}
                {r && <Link href={`/shop/${p.id}`} className="rlink"><Stars r={r} /></Link>}
                <div className="prow">
                  <span className="price">{money(p.priceCents)} <small>12 oz</small></span>
                  {save > 0 && <span className="save">SAVE<br />{money(save)}</span>}
                </div>
                <div className="buy">
                  <span className="step">
                    <button onClick={() => setQty({ ...qty, [p.id]: Math.max(1, q - 1) })} aria-label={`Fewer ${p.name}`}>−</button>
                    <b>{q}</b>
                    <button onClick={() => setQty({ ...qty, [p.id]: Math.min(24, q + 1) })} aria-label={`More ${p.name}`}>+</button>
                  </span>
                  <button className="addbtn" onClick={() => { add(p.id, q); setQty({ ...qty, [p.id]: 1 }); }} disabled={p.stock < 1}>{p.stock < 1 ? "SOLD OUT" : "ADD TO CART"}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="how">
        <h2>How it works</h2>
        <ol>
          <li><span>1</span><b>Order online</b><small>Pick your salsas, a day and a time.</small></li>
          <li><span>2</span><b>Made fresh</b><small>Brant makes your batch by hand in small runs.</small></li>
          <li><span>3</span><b>Pick up or delivery</b><small>Free pickup in Torrance or local delivery.</small></li>
        </ol>
      </section>

      <section className="faq">
        <h2>FAQ</h2>
        {[
          ["How long does the salsa last?", "Keep it in the fridge. It's best within 7–10 days of opening, and up to 2 weeks sealed."],
          ["Does it need refrigeration?", "Yes. It's fresh salsa with no preservatives, so keep it cold and close the lid after each use."],
          ["Where do you deliver?", "We deliver to nearby ZIP codes around Torrance. Enter your ZIP in the cart to see if we reach you and the fee."],
          ["Where is pickup?", "1636 Greenwood Ave, Torrance, CA. Choose your day and time window at checkout."],
          ["How spicy is it?", "Each salsa shows its heat with chiles 🌶 from 1 (mild) to 5 (extra hot)."],
          ["Can I change or cancel my order?", "Text us as soon as possible. If we haven't started your batch, we'll fix it or refund you."],
        ].map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </section>

      <section className="drop">
        <span className="soon">Limited drop · Coming soon</span>
        <h2>Seasonal salsa</h2>
        <p>A small-batch flavor that changes with the season. Backyard Club members hear about it first.</p>
      </section>

      <Link href="/merch" className="merch" style={{ display: "block", textDecoration: "none" }}>
        <div className="mh"><h2>MERCH</h2><span className="soon">Under construction</span></div>
        <p>Shirts, hats and more are on the way.</p>
      </Link>

      <footer className="foot">
        <b>From our backyard to your table</b>
        <div>
          <a href="https://www.instagram.com/backyardcocina" target="_blank" rel="noopener">Instagram @backyardcocina</a>
        </div>
        <span>Made in Torrance, CA · Pickup &amp; local delivery</span>
        <Link href="/admin" style={{ opacity: .6 }}>Kitchen login</Link>
      </footer>

      {count > 0 && (
        <div className="cartbar">
          {last && <span className="thumb"><img src={`/${last}.jpg`} alt="" /><b>{count}</b></span>}
          <span className="cbtxt">{count} item{count > 1 ? "s" : ""} · {money(subtotal)}</span>
          <Link className="btn" href="/cart">View cart →</Link>
        </div>
      )}
    </>
  );
}
