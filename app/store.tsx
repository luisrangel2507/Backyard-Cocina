"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@prisma/client";
import { useCart } from "@/lib/cart";

const money = (c: number) => `$${(c / 100).toFixed(2)}`;
const CATS = ["All", "Verde", "Creamy", "Roja", "Packs"];

export default function Store({ products }: { products: Product[] }) {
  const { cart, add, count } = useCart();
  const [cat, setCat] = useState("All");
  const [menu, setMenu] = useState(false);
  const subtotal = Object.entries(cart).reduce((a, [id, q]) => a + (products.find((p) => p.id === id)?.priceCents ?? 0) * q, 0);
  const last = Object.keys(cart).slice(-1)[0];

  return (
    <>
      <header className="hero">
        <div className="hrow">
          <button className="icon" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <span className="hr">
            <Link className="storypill" href="/story">Press to see our story</Link>
            <Link className="icon" href="/cart" aria-label="Open cart">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h2l2.4 11h10.2L20 7H6.2" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" /></svg>
              {count > 0 && <span className="badge">{count}</span>}
            </Link>
          </span>
        </div>
        {menu && (
          <nav className="menu">
            <Link href="/shop" onClick={() => setMenu(false)}>Order salsas</Link>
            <Link href="/story">Our story</Link>
            <Link href="/merch">Merch · soon</Link>
            <Link href="/cart">View cart</Link>
          </nav>
        )}
        <div className="brand">
          <img src="/logo.png" alt="Backyard Cocina" />
          <div><h2>OUR<br />SALSAS</h2><p className="slogan">Small batches. Big flavor.</p></div>
        </div>
      </header>

      <div className="chips">
        {CATS.map((c) => <button key={c} className="chip" aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="brush" aria-hidden="true" />

      <div className="list">
        {products.filter((p) => cat === "All" || p.category === cat).map((p) => {
          const q = cart[p.id] || 0;
          return (
            <article className="pc" key={p.id} style={{ ["--c" as any]: p.color }}>
              <Link className="pimg" href={`/shop/${p.id}`}><img src={`/${p.id}.jpg`} alt={p.name} />{p.jars > 1 && <span className="pack">{p.jars} jars</span>}</Link>
              <div className="pbody">
                <span className="eyebrow">{p.jars > 1 ? "Pack" : "Salsa"}</span>
                <h3>{p.name.replace(/^Salsa\s+|\s+Salsa$/i, "")}</h3>
                <span className="heat" aria-label={`Heat ${p.heat} of 5`}>{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= p.heat ? "on" : ""} />)}</span>
                <p>{p.description}</p>
                <div className="pairs">{p.pairs.map((x) => <span key={x}>{x}</span>)}</div>
                <Link className="rev" href={`/shop/${p.id}`}>Reviews & tips</Link>
                <div className="prow">
                  <span className="price">{money(p.priceCents)} <small>12 oz</small></span>
                  {q ? (
                    <span className="step">
                      <button onClick={() => add(p.id, -1)} aria-label={`Remove one ${p.name}`}>−</button>
                      <b>{q}</b>
                      <button onClick={() => add(p.id, 1)} aria-label={`Add one ${p.name}`}>+</button>
                    </span>
                  ) : (
                    <button className="addbtn" onClick={() => add(p.id)} disabled={p.stock < 1}>{p.stock < 1 ? "Sold out" : "Add +"}</button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

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
