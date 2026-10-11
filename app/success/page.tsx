import { stripe, money } from "@/lib/db";
import ClearCart from "./clear";

export default async function Success(props: { searchParams: Promise<{ session_id?: string }> }) {
  const searchParams = await props.searchParams;
  const s = searchParams.session_id ? await stripe.checkout.sessions.retrieve(searchParams.session_id, { expand: ["invoice"] }) : null;
  if (!s || s.payment_status !== "paid") return <p>We couldn't confirm that payment. If you were charged, email us and we'll sort it out.</p>;
  return (
    <>
      <ClearCart />
      <h2>Order confirmed</h2>
      <p>Thanks{ s.customer_details?.name ? `, ${s.customer_details.name.split(" ")[0]}` : "" }! We charged {money(s.amount_total ?? 0)} and a receipt is on its way to {s.customer_details?.email}.</p>
      {typeof s.invoice === "object" && s.invoice?.invoice_pdf && (
        <p><a className="btn" href={s.invoice.invoice_pdf} target="_blank">Download invoice (PDF)</a></p>
      )}
      <a className="btn" href="/shop">Back to the shop</a>
    </>
  );
}
