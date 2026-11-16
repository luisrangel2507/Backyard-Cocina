import { db, stripe, money } from "@/lib/db";
import { pickupPlace, isPickup } from "@/lib/zones";
import { bladeInfo } from "@/lib/blade";
import { recordPaidSession } from "@/lib/orders";
import { getT } from "@/lib/i18n-server";
import { PageBar } from "@/lib/i18n-client";

export const dynamic = "force-dynamic";
import ClearCart from "./clear";

export default async function Success(props: { searchParams: Promise<{ session_id?: string }> }) {
  const searchParams = await props.searchParams;
  const { t } = await getT();
  const s = searchParams.session_id ? await stripe.checkout.sessions.retrieve(searchParams.session_id, { expand: ["invoice"] }) : null;
  if (!s || s.payment_status !== "paid") return <><PageBar /><p>{t("okNoPay")}</p></>;
  // If Stripe's webhook hasn't saved the order (or isn't set up right), save it now from the paid session.
  await recordPaidSession(s).catch((e) => console.error("recordPaidSession from order page failed", e));
  const o = await db.order.findUnique({ where: { stripeSessionId: s.id } });
  const steps = o?.fulfillment === "delivery"
    ? [["new", t("stReceived")], ["ready", t("stPacked")], ["out", t("stOnWay")], ["done", t("stDelivered")]]
    : [["new", t("stReceived")], ["ready", t("stReadyPickup")], ["done", t("stPickedUp")]];
  const place = pickupPlace(o?.fulfillment, o?.fulfillment === "blade" ? (await bladeInfo()).address : "");
  const at = Math.max(0, steps.findIndex(([k]) => k === (o?.status ?? "new")));
  return (
    <>
    <PageBar />
    <div className="success" style={{ display: "grid", gap: 8, maxWidth: 520, margin: "0 auto" }}>
      <meta httpEquiv="refresh" content="60" />
      <ClearCart />
      <h2>{o?.status === "ready" ? (isPickup(o.fulfillment) ? t("okReady") : t("okPacked")) : o?.status === "cancelled" ? t("okCancelled") : t("okConfirmed")}</h2>
      {o && o.status !== "cancelled" && (
        <ol className="track" style={{ padding: 0, justifySelf: "center", textAlign: "left" }}>{steps.map(([k, label], i) => <li key={k} className={i <= at ? "on" : ""}><i>{i <= at ? "✓" : i + 1}</i>{label}</li>)}</ol>
      )}
      {o?.pickupSlot && <p>🗓 {isPickup(o.fulfillment) ? t("okPickup") : t("okDelivery")}: <b>{o.pickupSlot}</b>{isPickup(o.fulfillment) && <><br />📍 {place}</>}</p>}
      <p className="muted">{t("okBookmark")}</p>
      <p>{t("okThanks", { name: s.customer_details?.name ? `, ${s.customer_details.name.split(" ")[0]}` : "", total: money(s.amount_total ?? 0), email: s.customer_details?.email ?? "" })}</p>
      {typeof s.invoice === "object" && s.invoice?.invoice_pdf && (
        <p><a className="btn" href={s.invoice.invoice_pdf} target="_blank">{t("okInvoice")}</a></p>
      )}
      <a className="btn" href="/shop">{t("okBack")}</a>
    </div>
    </>
  );
}
