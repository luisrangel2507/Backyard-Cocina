"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@prisma/client";
import { useCart } from "@/lib/cart";
import { LangToggle, useT } from "@/lib/i18n-client";
import { localizeProduct } from "@/lib/i18n";

const money = (c: number) => `$${(c / 100).toFixed(2)}`;
const CATS: [string, string][] = [["All", "catAll"], ["Verde", ""], ["Creamy", ""], ["Roja", ""], ["Packs", "catPacks"]];
export type Rating = { avg: number; count: number };
const Stars = ({ r }: { r: Rating }) => (
  <span className="stars" aria-label={`${r.avg.toFixed(1)} out of 5`}>{"★★★★★"} <b>{r.avg.toFixed(1)}</b> <small>({r.count})</small></span>
);
const lines = (s: string) => s.split("\n").map((l, i) => <span key={i}>{i > 0 && <br />}{l}</span>);

export default function Store({ products, ratings = {} }: { products: Product[]; ratings?: Record<string, Rating> }) {
  const { t, lang } = useT();
  const { cart, add, count } = useCart();
  const [cat, setCat] = useState("All");
  const [menu, setMenu] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [member, setMember] = useState<boolean | null>(null);
  const single = Math.min(...products.filter((p) => p.jars === 1).map((p) => p.priceCents));
  const subtotal = Object.entries(cart).reduce((a, [id, q]) => a + (products.find((p) => p.id === id)?.priceCents ?? 0) * q, 0);
  const last = Object.keys(cart).slice(-1)[0];
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // Every new visit (app open, QR scan, shared link) starts on the cat intro so the salsa pour plays.
  const [ok, setOk] = useState(false);
  useLayoutEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("bc-intro") === "1"; } catch { seen = true; }
    if (seen) setOk(true); else router.replace("/");
  }, [router]);

  useEffect(() => { fetch("/api/me").then((r) => r.json()).then((d) => setMember(!!d.member)).catch(() => setMember(false)); }, []);

  // Reveal sections as they scroll into view.
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>(".reveal");
    if (!els) return;
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.05 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [cat]);

  const catLabel = (c: string, key: string) => (key ? t(key as any) : c);
  const heat = (n: number) => (n <= 2 ? t("heat1") : n === 3 ? t("heat3") : n === 4 ? t("heat4") : t("heat5"));

  return (
    <div className="shop" ref={root} style={ok ? undefined : { visibility: "hidden" }}>
      <header className="hero">
        <div className="hrow">
          <button className="icon" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <Link href="/shop" className="logo"><img src="/logo.png" alt="" /><span>BACKYARD<br />COCINA<small>MEXICAN ROOTS. BACKYARD SOUL.</small></span></Link>
          <nav className="dnav" aria-label="Main">
            <Link href="/story">{t("ourStory")}</Link>
            <Link href="/merch">{t("merch")}</Link>
            <Link href={member ? "/profile" : "/login"}>{t("club")}</Link>
          </nav>
          <span className="hr">
            <LangToggle />
            <Link className="icon" href="/cart" aria-label={t("openCart")}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h2l2.4 11h10.2L20 7H6.2" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" /></svg>
              {count > 0 && <span className="badge" key={count}>{count}</span>}
            </Link>
          </span>
        </div>
        {menu && (
          <nav className="menu">
            <Link href="/shop" onClick={() => setMenu(false)}>{t("menuOrder")}</Link>
            <Link href="/story">{t("menuStory")}</Link>
            <Link href={member ? "/profile" : "/login"}>{t("menuClub")}</Link>
            <Link href="/merch">{t("menuMerch")}</Link>
            <Link href="/cart">{t("menuCart")}</Link>
            <Link href="/admin">{t("menuKitchen")}</Link>
          </nav>
        )}
        <div className="dhero">
          <div className="dtext">
            <h1><span className="l1">{t("heroL1")}</span><br /><em className="l2">{t("heroL2")}</em><br /><span className="l3">{t("heroL3")}</span></h1>
            <p className="dscript">{t("heroScript")}</p>
            <p className="dlead">{t("heroLead")}</p>
            <ul className="dbadges">
              <li><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M7 17c0-6 4-9 10-10-1 6-4 10-10 10zM7 17l5-5" /></svg><span>{lines(t("badgeNatural"))}</span></li>
              <li><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 5c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 2 2 1 0-2-1-3 0-5z" /></svg><span>{lines(t("badgeAuthentic"))}</span></li>
              <li><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M6 11h12M7 11a5 5 0 0 0 10 0M9 8c0-1 1-1 1-2M13 8c0-1 1-1 1-2" /></svg><span>{lines(t("badgeBbq"))}</span></li>
            </ul>
          </div>
          <img className="dpic" src="/trio.jpg" alt="Verde, Roja and Creamy salsas" />
        </div>
        <div className="brand">
          <div><h2 className="sigt"><img src="/signature-title.webp" alt="Try our signature salsas" width={896} height={716} /></h2></div>
        </div>
      </header>

      <h2 className="dh2 sigt sigt-d"><img src="/signature-title.webp" alt="Try our signature salsas" width={896} height={716} /></h2>
      <div className="chips">
        {CATS.map(([c, k]) => <button key={c} className="chip" aria-pressed={c === cat} onClick={() => setCat(c)}>{catLabel(c, k)}</button>)}
      </div>

      <div className="list" key={cat}>
        {products.filter((p) => cat === "All" || p.category === cat).map((p, idx) => {
          const q = qty[p.id] || 1, r = ratings[p.id], L = localizeProduct(lang, p);
          const save = p.jars > 1 && isFinite(single) ? p.jars * single - p.priceCents : 0;
          return (
            <article className="pc rise" key={p.id} style={{ ["--c" as any]: p.color, animationDelay: `${idx * 90}ms` }}>
              <Link className="pimg" href={`/shop/${p.id}`}><img src={`/${p.id}.jpg`} alt={p.name} />{p.jars > 1 && <span className="pack">{p.jars} {t("jars")}</span>}</Link>
              <div className="pbody">
                <span className="eyebrow">{p.jars > 1 ? t("pack") : t("salsa")}</span>
                {p.jars === 1 && <span className="oz">8 oz</span>}
                <h3>{p.name.replace(/^Salsa\s+|\s+Salsa$/i, "")}</h3>
                <span className="chili" aria-label={`${p.heat}/5`} title={`${p.heat}/5`}>{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= p.heat ? "on" : ""}>🌶</i>)}<small>{heat(p.heat)}</small></span>
                <p>{L.description}</p>
                {p.jars > 1 && <div className="pairs">{L.pairs.map((x) => <span key={x}>{x}</span>)}</div>}
                {r && <Link href={`/shop/${p.id}`} className="rlink"><Stars r={r} /></Link>}
                <div className="prow">
                  <span className="price">{money(p.priceCents)} <small>8 oz</small></span>
                  {save > 0 && <span className="save">{t("save")}<br />{money(save)}</span>}
                </div>
                <div className="buy">
                  <span className="step">
                    <button onClick={() => setQty({ ...qty, [p.id]: Math.max(1, q - 1) })} aria-label="−">−</button>
                    <b>{q}</b>
                    <button onClick={() => setQty({ ...qty, [p.id]: Math.min(24, q + 1) })} aria-label="+">+</button>
                  </span>
                  <button className={`addbtn${justAdded === p.id ? " done" : ""}`} onClick={() => { try { navigator.vibrate?.(14); } catch {} add(p.id, q); setQty({ ...qty, [p.id]: 1 }); setJustAdded(p.id); setTimeout(() => setJustAdded((x) => (x === p.id ? null : x)), 1100); }} disabled={p.stock < 1}>
                    {p.stock < 1 ? t("soldOut") : justAdded === p.id ? t("added") : t("add")}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <ul className="trust reveal">
        {([["M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z", "trust1"], ["M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 2 2 1 0-2-1-3 0-5z M6 20h12", "trust2"], ["M12 6v6l4 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "trust3"], ["M3 7h11v9H3z M14 10h4l3 3v3h-7z M7 19a1.500 1.500 0 1 0 0-.1 M17 19a1.500 1.500 0 1 0 0-.1", "trust4"]] as const).map(([d, k]) => (
          <li key={k}><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg><span>{t(k)}</span></li>
        ))}
      </ul>

      <section className="how reveal">
        <h2>{t("howTitle")}</h2>
        <ol>
          <li><span>1</span><b>{t("how1")}</b><small>{t("how1d")}</small></li>
          <li><span>2</span><b>{t("how2")}</b><small>{t("how2d")}</small></li>
          <li><span>3</span><b>{t("how3")}</b><small>{t("how3d")}</small></li>
        </ol>
      </section>

      <section className="clubcard reveal">
        <h2>{t("clubTitle")}</h2>
        <p>{t("clubText")}</p>
        <Link className="btn" href={member ? "/profile" : "/login"}>{member ? t("clubIn") : t("clubJoin")}</Link>
      </section>

      <section className="igcard reveal">
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.500" cy="6.500" r="1" fill="currentColor" /></svg>
        <h2>{t("igTitle")}</h2>
        <p>{t("igText")}</p>
        <a className="btn" href="https://www.instagram.com/backyardcocina" target="_blank" rel="noopener">{t("igBtn")}</a>
      </section>

      <section className="faq reveal">
        <h2>{t("faqTitle")}</h2>
        {([1, 2, 3, 4, 5, 6] as const).map((n) => <details key={n}><summary>{t(`q${n}` as any)}</summary><p>{t(`a${n}` as any)}</p></details>)}
      </section>

      <section className="drop reveal">
        <span className="soon">{t("dropTag")}</span>
        <h2>{t("dropTitle")}</h2>
        <p>{t("dropText")}</p>
      </section>

      <Link href="/merch" className="merch reveal" style={{ display: "block", textDecoration: "none" }}>
        <div className="mh"><h2>{t("merchTitle")}</h2><span className="soon">{t("merchSoon")}</span></div>
        <p>{t("merchText")}</p>
      </Link>

      <footer className="foot">
        <b>{t("footTitle")}</b>
        <div>
          <a href="https://www.instagram.com/backyardcocina" target="_blank" rel="noopener">Instagram @backyardcocina</a>
        </div>
        <span>{t("footMade")}</span>
        <Link href="/admin" style={{ opacity: .6 }}>{t("menuKitchen").replace(" 🔒", "")}</Link>
      </footer>

      {count > 0 && (
        <div className="cartbar slideup">
          {last && <span className="thumb"><img src={`/${last}.jpg`} alt="" /><b key={count}>{count}</b></span>}
          <span className="cbtxt">{count} {count > 1 ? t("items") : t("item")} · {money(subtotal)}</span>
          <Link className="btn" href="/cart">{t("viewCart")}</Link>
        </div>
      )}
    </div>
  );
}
