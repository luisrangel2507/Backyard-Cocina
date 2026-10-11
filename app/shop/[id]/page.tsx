import { notFound } from "next/navigation";
import Link from "next/link";
import { db, money } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Salsa(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const p = await db.product.findUnique({ where: { id: params.id }, include: { reviews: { orderBy: { createdAt: "desc" }, take: 30 } } });
  if (!p || !p.active) notFound();
  const avg = p.reviews.length ? (p.reviews.reduce((a, r) => a + r.stars, 0) / p.reviews.length).toFixed(1) : null;
  return (
    <article className="detail">
      <Link href="/shop" className="muted">← All salsas</Link>
      <img src={`/${p.id}.jpg`} alt={p.name} className="dimg" />
      <h2>{p.name}</h2>
      <p>{p.description}</p>
      <b className="lbl">Pairs with</b>
      <div className="pairs">{p.pairs.map((x) => <span key={x}>{x}</span>)}</div>
      {p.tip && <div className="tipb"><b>Brant&apos;s tip</b><span>{p.tip}</span></div>}
      <b className="lbl">Reviews {avg && `· ★ ${avg}`}</b>
      {p.reviews.length ? p.reviews.map((r) => (
        <div key={r.id} className="rv"><b>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</b> {r.name}<p>{r.text}</p></div>
      )) : <p className="muted">No reviews yet. Tried it? Log in after your order to leave one.</p>}
      <Link className="btn" href="/shop">Order · {money(p.priceCents)}</Link>
    </article>
  );
}
