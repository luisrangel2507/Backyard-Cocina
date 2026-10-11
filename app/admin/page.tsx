import { db, money } from "@/lib/db";
import { setStatus, saveProduct, saveSchedule, confirmOrder, rejectOrder, textCustomer, savePartner } from "./actions";

export const dynamic = "force-dynamic";
const LABEL: Record<string, string> = { new: "New", ready: "Ready", out: "Out for delivery", done: "Completed" };
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function Admin({ searchParams }: { searchParams: { tab?: string; s?: string } }) {
  const tab = searchParams.tab || "orders", filter = searchParams.s || "new";
  const Tab = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <a href={`/admin?tab=${id}`} aria-current={tab === id} className="atab">{children}</a>
  );
  return (
    <div className="adm">
      <span className="eyebrowl">Backyard Cocina</span>
      <h2>Kitchen admin</h2>
      <nav className="atabs"><Tab id="orders">Orders</Tab><Tab id="products">Products</Tab><Tab id="sales">Sales</Tab><Tab id="schedule">Schedule</Tab><Tab id="partners">Partners</Tab></nav>
      {tab === "orders" && <Orders filter={filter} />}
      {tab === "products" && <Products />}
      {tab === "sales" && <Sales />}
      {tab === "schedule" && <Schedule />}
      {tab === "partners" && <Partners />}
    </div>
  );
}

async function Orders({ filter }: { filter: string }) {
  const all = await db.order.findMany({ where: { status: { not: "cancelled" } }, select: { status: true } });
  const count = (k: string) => all.filter((o) => o.status === k).length;
  const orders = await db.order.findMany({
    where: filter === "all" ? { status: { not: "cancelled" } } : { status: filter },
    include: { items: { include: { product: true } }, customer: true }, orderBy: { createdAt: "desc" }, take: 100,
  });
  return (
    <>
      <div className="chips">{["new", "ready", "out", "done", "all"].map((k) => (
        <a key={k} className="chip" aria-pressed={k === filter} href={`/admin?tab=orders&s=${k}`}>{k === "all" ? "All" : `${LABEL[k]} · ${count(k)}`}</a>
      ))}</div>
      {!orders.length && <p className="muted">No orders here.</p>}
      {orders.map((o) => {
        const next = o.status === "new" ? "ready" : o.status === "ready" ? (o.fulfillment === "delivery" ? "out" : "done") : o.status === "out" ? "done" : null;
        const btn = next === "ready" ? "Mark ready · text customer" : next === "out" ? "Out for delivery · text" : next === "done" ? (o.fulfillment === "pickup" ? "Picked up" : "Delivered") : "";
        const jars = o.items.reduce((a, i) => a + i.quantity, 0);
        return (
          <div key={o.id} className={`ord st-${o.status}`}>
            <div className="oh"><b>#{o.id.slice(-6).toUpperCase()}</b><span className="pill">{LABEL[o.status] ?? o.status}</span></div>
            <div className="muted">{o.createdAt.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" })}</div>
            <div className="who"><div><b>{o.customer?.name ?? o.email ?? "Guest"}</b><div>{o.phone}</div></div>
              {o.phone && <span className="calls"><a className="ibtn" href={`tel:${o.phone}`} aria-label="Call">📞</a><a className="ibtn" href={`sms:${o.phone}`} aria-label="Text">💬</a></span>}
            </div>
            <div className="items">{o.items.map((i) => (
              <div key={i.id} className="it"><img src={`/${i.product.id}.jpg`} alt="" /><div><b>{i.quantity} × {i.product.name.replace("Salsa ", "")}</b><div>{money(i.product.priceCents * i.quantity)}</div></div></div>
            ))}</div>
            <div className="of"><span>Total</span><b>{money(o.totalCents)}</b></div>
            <div className="chs"><span className="pill">{o.fulfillment === "pickup" ? "Pickup" : "Delivery"}</span><span className="pill">{jars} {jars === 1 ? "jar" : "jars"}</span></div>
            {o.pickupSlot && <div>🗓 {o.pickupSlot}</div>}
            {o.deliveryAddress && <div>📍 {o.deliveryAddress}</div>}
            {o.phone && (
              <details><summary className="btn ghost">Text customer</summary>
                <form action={textCustomer.bind(null, o.id)} className="cmp">
                  <textarea name="msg" rows={3} defaultValue={`Hi ${o.customer?.name.split(" ")[0] ?? "there"}! `} />
                  <button className="btn">Send SMS</button>
                </form>
              </details>
            )}
            {o.status === "new" && !o.confirmed && (
              <div className="acts">
                <form action={rejectOrder.bind(null, o.id)}><button className="btn rej">Reject</button></form>
                <form action={confirmOrder.bind(null, o.id)}><button className="btn ok">Confirm order</button></form>
              </div>
            )}
            {next && (o.status !== "new" || o.confirmed) && <form action={setStatus.bind(null, o.id, next)}><button className="btn">{btn}</button></form>}
          </div>
        );
      })}
    </>
  );
}

async function Products() {
  const products = await db.product.findMany({ where: { active: true }, orderBy: { priceCents: "asc" } });
  return products.map((p) => (
    <form key={p.id} action={saveProduct} className="aprod">
      <img src={`/${p.id}.jpg`} alt="" />
      <div><b>{p.name}</b><label><input type="checkbox" name="soldOut" defaultChecked={p.stock < 1} /> Sold out</label></div>
      <input type="hidden" name="id" value={p.id} />
      <input name="price" type="number" step="0.01" min="0" defaultValue={(p.priceCents / 100).toFixed(2)} aria-label="Price" />
      <button className="btn">Save</button>
    </form>
  ));
}

async function Sales() {
  const since = new Date(Date.now() - 7 * 864e5);
  const orders = await db.order.findMany({ where: { createdAt: { gte: since }, status: { not: "cancelled" } }, include: { items: true } });
  const revenue = orders.reduce((a, o) => a + o.totalCents, 0), jars = orders.reduce((a, o) => a + o.jarCount, 0);
  const members = await db.customer.count();
  return (
    <div className="kpis">
      <div><span>Sales · 7 days</span><b>{money(revenue)}</b></div>
      <div><span>Orders</span><b>{orders.length}</b></div>
      <div><span>Jars</span><b>{jars}</b></div>
      <div><span>Backyard Club members</span><b>{members}</b></div>
    </div>
  );
}

async function Schedule() {
  const s = (await db.settings.findUnique({ where: { id: 1 } })) ?? { days: [4, 5, 6, 0], slots: ["10 am–12 pm", "4–6 pm"], cap: 40 };
  return (
    <form action={saveSchedule} className="sched">
      <b>Fresh batch days</b>
      <div className="days">{DAYS.map((d, i) => <label key={d}><input type="checkbox" name="days" value={i} defaultChecked={s.days.includes(i)} /> {d}</label>)}</div>
      <label>Max jars per day <input name="cap" type="number" min={1} defaultValue={s.cap} /></label>
      <label>Time windows (comma separated) <input name="slots" defaultValue={s.slots.join(", ")} /></label>
      <button className="btn">Save schedule</button>
    </form>
  );
}

async function Partners() {
  const partners = await db.partner.findMany({ orderBy: { name: "asc" } });
  const orders = await db.order.findMany({ where: { partnerCode: { not: null }, status: { not: "cancelled" } } });
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {partners.map((p) => {
        const mine = orders.filter((o) => o.partnerCode === p.code);
        const jars = mine.reduce((a, o) => a + o.jarCount, 0);
        const owed = mine.reduce((a, o) => a + o.commissionCents, 0);
        return (
          <div className="card" key={p.id} style={{ padding: 14, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <img src={`/api/qr?code=${p.code}`} alt={`QR ${p.code}`} width={140} height={140} style={{ background: "#fff", borderRadius: 8 }} />
            <div>
              <b>{p.name}</b> · code {p.code}<br />
              <small>{site}/r/{p.code}</small><br />
              {mine.length} orders · {jars} jars · commission {money(p.commissionCents)}/jar<br />
              <b>Owed: {money(owed)}</b>
            </div>
          </div>
        );
      })}
      <form action={savePartner} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
        <b>Add / update partner</b>
        <input name="name" placeholder="Name (Blade & Barber)" required style={{ padding: 10, borderRadius: 10, border: 0 }} />
        <input name="code" placeholder="Code (BLADE)" required style={{ padding: 10, borderRadius: 10, border: 0 }} />
        <input name="commission" type="number" step="0.01" defaultValue="1.00" placeholder="Commission per jar ($)" style={{ padding: 10, borderRadius: 10, border: 0 }} />
        <button className="btn">Save partner</button>
      </form>
    </div>
  );
}
