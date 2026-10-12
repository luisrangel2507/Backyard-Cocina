import { db, stripe, money } from "@/lib/db";
import { PICKUP_ADDRESS } from "@/lib/zones";

export const dynamic = "force-dynamic";
import ClearCart from "./clear";

export default async function Success(props: { searchParams: Promise<{ session_id?: string }> }) {
  const searchParams = await props.searchParams;
  const s = searchParams.session_id ? await stripe.checkout.sessions.retrieve(searchParams.session_id, { expand: ["invoice"] }) : null;
  if (!s || s.payment_status !== "paid") return <p>We couldn't confirm that payment. If you were charged, email us and we'll sort it out.</p>;
  const o = await db.order.findUnique({ where: { stripeSessionId: s.id } });
  const steps = o?.fulfillment === "delivery"
    ? [["new", "Order received"], ["ready", "Packed"], ["out", "On the way"], ["done", "Delivered"]]
    : [["new", "Order received"], ["ready", "Ready for pickup"], ["done", "Picked up"]];
  const at = Math.max(0, steps.findIndex(([k]) => k === (o?.status ?? "new")));
  return (
    <div className="success" style={{ display: "grid", gap: 8, maxWidth: 520 }}>
      <meta httpEquiv="refresh" content="60" />
      <ClearCart />
      <h2>{o?.status === "ready" ? (o.fulfillment === "pickup" ? "Your order is ready! 🌶" : "Your order is packed 🌶") : o?.status === "cancelled" ? "Order cancelled" : "Order confirmed"}</h2>
      {o && o.status !== "cancelled" && (
        <ol className="track" style={{ padding: 0, justifySelf: "center", textAlign: "left" }}>{steps.map(([k, label], i) => <li key={k} className={i <= at ? "on" : ""}><i>{i <= at ? "✓" : i + 1}</i>{label}</li>)}</ol>
      )}
      {o?.pickupSlot && <p>🗓 {o.fulfillment === "pickup" ? "Pickup" : "Delivery"}: <b>{o.pickupSlot}</b>{o.fulfillment === "pickup" && <><br />📍 {PICKUP_ADDRESS}</>}</p>}
      <p className="muted">Save or bookmark this page to check your order status. It updates on its own.</p>
      <p>Thanks{ s.customer_details?.name ? `, ${s.customer_details.name.split(" ")[0]}` : "" }! We charged {money(s.amount_total ?? 0)} and a receipt is on its way to {s.customer_details?.email}.</p>
      {typeof s.invoice === "object" && s.invoice?.invoice_pdf && (
        <p><a className="btn" href={s.invoice.invoice_pdf} target="_blank">Download invoice (PDF)</a></p>
      )}
      <a className="btn" href="/shop">Back to the shop</a>
    </div>
  );
}
