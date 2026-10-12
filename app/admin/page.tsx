import { db, money } from "@/lib/db";
import { partnerToken } from "@/lib/auth";
import { slotsFor } from "@/lib/schedule";
import { setStatus, saveProduct, saveSchedule, confirmOrder, rejectOrder, textCustomer, savePartner, addExpense, deleteExpense } from "./actions";

export const dynamic = "force-dynamic";
const LABEL: Record<string, string> = { new: "New", ready: "Ready", out: "Out for delivery", done: "Completed" };
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function Admin(props: { searchParams: Promise<{ tab?: string; s?: string; p?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || "orders", filter = searchParams.s || "new";
  const Tab = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <a href={`/admin?tab=${id}`} aria-current={tab === id} className="atab">{children}</a>
  );
  return (
    <div className="adm">
      <span className="eyebrowl">Backyard Cocina</span>
      <h2>Kitchen admin</h2>
      <nav className="atabs"><Tab id="orders">Orders</Tab><Tab id="products">Products</Tab><Tab id="money">Money</Tab><Tab id="sales">Sales</Tab><Tab id="schedule">Schedule</Tab><Tab id="partners">Partners</Tab></nav>
      {tab === "orders" && <Orders filter={filter} />}
      {tab === "products" && <Products />}
      {tab === "sales" && <Sales />}
      {tab === "money" && <Money period={searchParams.p || "month"} />}
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
            {o.status === "ready" && o.phone && (
              <a className="btn ghost" href={`sms:${o.phone}?&body=${encodeURIComponent(`Hi! Your Backyard Cocina order #${o.id.slice(-6).toUpperCase()} is ready${o.fulfillment === "pickup" ? ` for pickup (${o.pickupSlot ?? ""}) at 1636 Greenwood Ave, Torrance` : ""}. 🌶`)}`}>💬 Text &quot;ready&quot; from my phone</a>
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
  const s = (await db.settings.findUnique({ where: { id: 1 } })) ?? { days: [4, 5, 6, 0], slots: ["10 am–12 pm", "4–6 pm"], cap: 40, daySlots: {} };
  return (
    <form action={saveSchedule} className="sched">
      <b>Pickup days &amp; hours</b>
      <p className="muted" style={{ margin: 0 }}>Check the days you&apos;re open and write that day&apos;s pickup times, separated by commas (e.g. 10 am–12 pm, 4–7 pm).</p>
      {[1, 2, 3, 4, 5, 6, 0].map((i) => (
        <div key={i} className="dayrow">
          <label><input type="checkbox" name="days" value={i} defaultChecked={s.days.includes(i)} /> <b>{DAYS[i]}</b></label>
          <input name={`slots-${i}`} defaultValue={slotsFor(s, i).join(", ")} placeholder="10 am–12 pm, 4–7 pm" />
        </div>
      ))}
      <label>Max jars per day <input name="cap" type="number" min={1} defaultValue={s.cap} /></label>
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
              <b>Owed: {money(owed)}</b><br />
              <small>Partner view (send to them): <a href={`/partner/${p.code}?k=${partnerToken(p.code)}`}>{site}/partner/{p.code}?k={partnerToken(p.code)}</a></small>
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

const CATEGORIES = ["Ingredients", "Jars & labels", "Packaging", "Delivery", "Commissions", "Fees", "Other"];

async function Money({ period }: { period: string }) {
  const now = new Date();
  const from = period === "week" ? new Date(Date.now() - 7 * 864e5)
    : period === "year" ? new Date(now.getFullYear(), 0, 1)
    : period === "all" ? new Date(0)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const [orders, expenses] = await Promise.all([
    db.order.findMany({ where: { createdAt: { gte: from }, status: { not: "cancelled" } }, orderBy: { createdAt: "desc" } }),
    db.expense.findMany({ where: { date: { gte: from } }, orderBy: { date: "desc" } }),
  ]);
  const income = orders.reduce((a, o) => a + o.totalCents, 0);
  const commissions = orders.reduce((a, o) => a + o.commissionCents, 0);
  const spent = expenses.reduce((a, e) => a + e.amountCents, 0);
  const profit = income - spent - commissions;
  const byCat = CATEGORIES.map((c) => [c, expenses.filter((e) => e.category === c).reduce((a, e) => a + e.amountCents, 0)] as const).filter(([, v]) => v > 0);
  const P = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <a className="chip" aria-pressed={period === id} href={`/admin?tab=money&p=${id}`}>{children}</a>
  );
  const today = now.toISOString().slice(0, 10);
  type Row = { id: string; date: Date; label: string; cents: number; expense?: boolean };
  const rows: Row[] = [
    ...orders.map((o) => ({ id: o.id, date: o.createdAt, label: `Order #${o.id.slice(-6).toUpperCase()} · ${o.jarCount} jars${o.partnerCode ? ` · ${o.partnerCode}` : ""}`, cents: o.totalCents })),
    ...expenses.map((e) => ({ id: e.id, date: e.date, label: `${e.description} · ${e.category}`, cents: -e.amountCents, expense: true })),
  ].sort((a, b) => +b.date - +a.date);
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="chips" style={{ margin: 0 }}><P id="week">7 days</P><P id="month">This month</P><P id="year">This year</P><P id="all">All</P></div>
      <div className="kpis">
        <div><span>Money in (sales)</span><b style={{ color: "#5fd39a" }}>{money(income)}</b></div>
        <div><span>Money out (expenses)</span><b style={{ color: "#ff8a75" }}>{money(spent)}</b></div>
        <div><span>Partner commissions</span><b>{money(commissions)}</b></div>
        <div><span>Profit</span><b style={{ color: profit >= 0 ? "#5fd39a" : "#ff8a75" }}>{money(profit)}</b></div>
      </div>
      <p className="muted" style={{ margin: 0 }}>Sales include tax and delivery fees collected. Stripe fees are not subtracted automatically; add them as an expense (category Fees) from your Stripe payouts.</p>
      {byCat.length > 0 && <div className="pairs">{byCat.map(([c, v]) => <span key={c} style={{ background: "var(--deep)", color: "var(--cream)" }}>{c}: {money(v)}</span>)}</div>}
      <form action={addExpense} className="sched" style={{ background: "var(--deep)", padding: 12, borderRadius: 14 }}>
        <b>Add expense</b>
        <input name="description" placeholder="What was it? (tomatillos, jars…)" required />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input name="amount" type="number" step="0.01" min="0.01" placeholder="Amount $" required />
          <input name="date" type="date" defaultValue={today} />
        </div>
        <select name="category" defaultValue="Ingredients" style={{ padding: 10, borderRadius: 10, border: 0 }}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <button className="btn">Save expense</button>
      </form>
      <div>
        {!rows.length && <p className="muted">Nothing in this period yet.</p>}
        {rows.map((r) => (
          <div className="line" key={r.id} style={{ alignItems: "center", gap: 8 }}>
            <span><small className="muted">{r.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</small> {r.label}</span>
            <span style={{ display: "flex", gap: 8, alignItems: "center", whiteSpace: "nowrap" }}>
              <b style={{ color: r.cents >= 0 ? "#5fd39a" : "#ff8a75" }}>{r.cents >= 0 ? "+" : "−"}{money(Math.abs(r.cents))}</b>
              {r.expense && <form action={deleteExpense.bind(null, r.id)}><button aria-label="Delete expense" style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer" }}>✕</button></form>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
