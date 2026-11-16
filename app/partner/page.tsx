import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getPartner } from "@/lib/partnerAuth";
import { BLADE_CODE } from "@/lib/zones";

export const dynamic = "force-dynamic";
export const metadata = { title: "My shelf · Backyard Cocina", robots: { index: false } };

// What a logged-in partner sees: only their own shelf and how many jars have sold. No money, no other partners.
export default async function PartnerHome() {
  const partner = await getPartner();
  if (!partner) redirect("/partner-login");
  const hasShelf = partner.code === BLADE_CODE;

  // Sold = paid, not cancelled orders that were picked up at their shop or came through their QR code.
  const orders = await db.order.findMany({
    where: { status: { not: "cancelled" }, OR: [{ partnerCode: partner.code }, ...(hasShelf ? [{ fulfillment: "blade" }] : [])] },
    include: { items: true, customer: true },
    orderBy: { createdAt: "asc" },
  });
  const products = await db.product.findMany({ where: { active: true }, orderBy: { sort: "asc" } });
  const soldBy = (id: string) => orders.reduce((a, o) => a + o.items.filter((i) => i.productId === id).reduce((b, i) => b + i.quantity, 0), 0);
  const rows = products.map((p) => ({ id: p.id, name: p.name, shelf: p.bladeStock, sold: soldBy(p.id) })).filter((r) => hasShelf || r.sold > 0);
  const totalShelf = rows.reduce((a, r) => a + r.shelf, 0);
  const totalSold = rows.reduce((a, r) => a + r.sold, 0);
  const waiting = hasShelf ? orders.filter((o) => o.fulfillment === "blade" && (o.status === "new" || o.status === "ready")) : [];
  const name = (id: string) => products.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="adm pview">
      <div className="pv-head">
        <div><span className="eyebrowl">Backyard Cocina · Partner</span><h2>{partner.name}</h2></div>
        <form action="/api/partner/logout" method="post"><button className="alogout">Log out</button></form>
      </div>

      <div className="kpis">
        {hasShelf && <div><span>Jars on your shelf</span><b>{totalShelf}</b></div>}
        <div><span>Jars sold</span><b>{totalSold}</b></div>
      </div>

      <h3>{hasShelf ? "Your inventory" : "Sold"}</h3>
      <div className="pv-table">
        <div className="pv-row pv-th"><span>Salsa</span>{hasShelf && <span>On shelf</span>}<span>Sold</span></div>
        {rows.map((r) => (
          <div className={`pv-row${hasShelf && r.shelf === 0 ? " out" : ""}`} key={r.id}>
            <span>{r.name}</span>{hasShelf && <b>{r.shelf}</b>}<b>{r.sold}</b>
          </div>
        ))}
        {!rows.length && <p className="muted">No sales yet.</p>}
      </div>

      {hasShelf && (
        <>
          <h3>Waiting for pickup here</h3>
          {!waiting.length && <p className="muted">No online orders waiting.</p>}
          {waiting.map((o) => (
            <div className="line" key={o.id}>
              <span>#{o.id.slice(-6).toUpperCase()} · {o.customer?.name ?? "Customer"}<br /><small>{o.items.map((i) => `${i.quantity} × ${name(i.productId)}`).join(", ")}</small></span>
              <b>Paid</b>
            </div>
          ))}
        </>
      )}
      <p className="muted" style={{ marginTop: 18 }}>Numbers update by themselves when customers order. Brant updates the shelf when he drops off more jars.</p>
    </div>
  );
}
