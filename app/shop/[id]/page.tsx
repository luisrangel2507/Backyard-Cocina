import { notFound } from "next/navigation";
import Link from "next/link";
import { db, money } from "@/lib/db";
import { getT } from "@/lib/i18n-server";
import { PageBar } from "@/lib/i18n-client";
import { localizeProduct } from "@/lib/i18n";
import { productImage } from "@/lib/productImage";

export const dynamic = "force-dynamic";

export default async function Salsa(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const p = await db.product.findUnique({ where: { id: params.id }, include: { reviews: { orderBy: { createdAt: "desc" }, take: 30 } } });
  if (!p || !p.active) notFound();
  const { t, lang } = await getT();
  const L = localizeProduct(lang, p);
  const avg = p.reviews.length ? (p.reviews.reduce((a, r) => a + r.stars, 0) / p.reviews.length).toFixed(1) : null;
  return (
    <>
    <PageBar />
    <article className="detail">
      <Link href="/shop" className="muted">{t("allSalsas")}</Link>
      <img src={productImage(p)} alt={p.name} className="dimg" />
      <h2>{p.name}</h2>
      <p>{L.description}</p>
      <b className="lbl">{t("pairsWith")}</b>
      <div className="pairs">{L.pairs.map((x) => <span key={x}>{x}</span>)}</div>
      {L.tip && <div className="tipb"><b>{t("tipTitle")}</b><span>{L.tip}</span></div>}
      <b className="lbl">{t("reviews")} {avg && `· ★ ${avg}`}</b>
      {p.reviews.length ? p.reviews.map((r) => (
        <div key={r.id} className="rv"><b>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</b> {r.name}<p>{r.text}</p></div>
      )) : <p className="muted">{t("noReviews")}</p>}
      <Link className="btn" href="/shop">{t("orderFor")} · {money(p.priceCents)}</Link>
    </article>
    </>
  );
}
