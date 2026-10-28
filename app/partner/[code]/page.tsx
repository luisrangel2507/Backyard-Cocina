import { notFound } from "next/navigation";
import { db, money } from "@/lib/db";
import { partnerToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partner sales · Backyard Cocina", robots: { index: false } };

// Read-only dashboard for a reseller. Access via the private link shown in /admin → Partners.
export default async function PartnerView(props: { params: Promise<{ code: string }>; searchParams: Promise<{ k?: string }> }) {
  const code = (await props.params).code.toUpperCase();
  const { k } = await props.searchParams;
  if (!k || k !== partnerToken(code)) notFound();
  const partner = await db.partner.findUnique({ where: { code } });
  if (!partner) notFound();
  const orders = await db.order.findMany({ where: { partnerCode: code, status: { not: "cancelled" } }, orderBy: { createdAt: "desc" } });
  const jars = orders.reduce((a, o) => a + o.jarCount, 0);
  const owed = orders.reduce((a, o) => a + o.commissionCents, 0);
  const since = new Date(Date.now() - 30 * 864e5);
  const month = orders.filter((o) => o.createdAt >= since);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  return (
    <div className="adm">
      <span className="eyebrowl">Backyard Cocina · Partner</span>
      <h2>{partner.name}</h2>
      <div className="kpis">
        <div><span>Commission earned</span><b>{money(owed)}</b></div>
        <div><span>Jars sold</span><b>{jars}</b></div>
        <div><span>Orders</span><b>{orders.length}</b></div>
        <div><span>Last 30 days</span><b>{money(month.reduce((a, o) => a + o.commissionCents, 0))}</b></div>
      </div>
      <p className="muted">You earn {money(partner.commissionCents)} per jar sold through your QR code.</p>
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", margin: "12px 0" }}>
        <img src={`/api/qr?code=${code}`} alt="Your QR code" width={140} height={140} style={{ background: "#fff", borderRadius: 8 }} />
        <small>Your link: {site}/r/{code}<br /><a href={`/api/qr?code=${code}`} download={`qr-${code}.png`}>Download QR</a></small>
      </div>
      <h3>Sales</h3>
      {!orders.length && <p className="muted">No sales yet.</p>}
      {orders.map((o) => (
        <div className="line" key={o.id}>
          <span>{o.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · #{o.id.slice(-6).toUpperCase()} · {o.jarCount} jar{o.jarCount === 1 ? "" : "s"}</span>
          <b>{money(o.commissionCents)}</b>
        </div>
      ))}
    </div>
  );
}
