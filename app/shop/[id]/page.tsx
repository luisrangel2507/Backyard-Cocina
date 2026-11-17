import { notFound } from "next/navigation";
import Link from "next/link";
import { db, money } from "@/lib/db";
import { getT } from "@/lib/i18n-server";
import { PageBar } from "@/lib/i18n-client";
import { localizeProduct } from "@/lib/i18n";
import { productImage } from "@/lib/productImage";
import AddToCart from "./AddToCart";

export const dynamic = "force-dynamic";

export default async function Salsa(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const p = await db.product.findUnique({ where: { id: params.id }, include: { reviews: { orderBy: { createdAt: "desc" }, take: 30 } } });
  if (!p || !p.active) notFound();
  const { t, lang } = await getT();
  const L = localizeProduct(lang, p);
  const heat = p.heat <= 2 ? t("heat1") : p.heat === 3 ? t("heat3") : p.heat === 4 ? t("heat4") : t("heat5");
  const avg = p.reviews.length ? (p.reviews.reduce((a, r) => a + r.stars, 0) / p.reviews.length).toFixed(1) : null;
  return (
    <>
    <PageBar />
    <article className="detail d2">
      <Link href="/shop" className="muted d2-back">{t("allSalsas")}</Link>
      <img src={productImage(p)} alt={p.name} className="dimg" />
      <div className="d2-info">
        <span className="d2-eyebrow">{p.jars > 1 ? t("pack") : t("salsa")}{p.jars === 1 && " · 8 oz"}</span>
        <h2>{p.name}</h2>
        <span className="chili" aria-label={`${p.heat}/5`}>{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= p.heat ? "on" : ""}>🌶</i>)}<small>{heat}</small></span>
        <p>{L.description}</p>
        <div className="d2-price">{money(p.priceCents)}</div>
        <AddToCart id={p.id} soldOut={p.stock < 1} />
        {p.bladeStock > 0 && <small className="d2-blade">💈 {t("atBlade", { n: p.bladeStock })}</small>}
        {L.pairs.length > 0 && <><b className="lbl">{t("pairsWith")}</b><div className="pairs">{L.pairs.map((x) => <span key={x}>{x}</span>)}</div></>}
        {L.tip && <div className="tipb"><b>{t("tipTitle")}</b><span>{L.tip}</span></div>}
        {p.reviews.length > 0 && (
          <>
            <b className="lbl">{t("reviews")} {avg && `· ★ ${avg}`}</b>
            {p.reviews.map((r) => (
              <div key={r.id} className="rv"><b>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</b> {r.name}<p>{r.text}</p></div>
            ))}
          </>
        )}
      </div>
    </article>
    </>
  );
}
