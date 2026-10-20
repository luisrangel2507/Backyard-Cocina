import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCustomer } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { PageBar } from "@/lib/i18n-client";
import { FREE_SALSA_EVERY, FREE_MERCH_EVERY, freeSalsasAvailable, merchAvailable, jarsToNextFree, makeReferralCode } from "@/lib/loyalty";
import LogoutButton from "./logout";
import CopyCode from "./CopyCode";

export const dynamic = "force-dynamic";

async function saveBirthMonth(form: FormData) {
  "use server";
  const c = await getCustomer();
  if (!c) return;
  const v = String(form.get("month"));
  await db.customer.update({ where: { id: c.id }, data: { birthMonth: v === "" ? null : Math.min(11, Math.max(0, Number(v))) } });
  revalidatePath("/profile");
}

const Chili = () => (
  <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M27 5c3-.5 5 1 4.4 3.400C29.500 17 22 30 7 34c3-5 1-8 5-14 3-4.600 7-6.600 11-9.600 1-.8 2-3 4-5.400z" fill="currentColor" /><path d="M26 6c-.8-2 .2-3.800 2.400-4.400" stroke="currentColor" strokeWidth="2.200" fill="none" strokeLinecap="round" /></svg>
);

export default async function Profile() {
  let c = await getCustomer();
  if (!c) redirect("/login");
  // Older accounts got a long internal id as referral code; give them a short shareable one.
  if (!c.referralCode.startsWith("BY-")) {
    for (let i = 0; i < 5; i++) {
      try { c = await db.customer.update({ where: { id: c.id }, data: { referralCode: makeReferralCode() } }); break; } catch {}
    }
  }
  const { t } = await getT();
  const months = t("months").split(",");
  const stamps = c.jars % FREE_SALSA_EVERY;
  const free = Math.max(0, freeSalsasAvailable(c));
  const merch = Math.max(0, merchAvailable(c));
  const first = c.name.split(" ")[0];
  return (
    <div className="prof">
      <PageBar />
      <h1 className="prof-hi"><span className="hi">HI,</span><span className="nm">{first.toUpperCase()}</span></h1>

      <section className="stampcard">
        <h2>STAMP CARD</h2>
        <div className="stamps2">
          {Array.from({ length: FREE_SALSA_EVERY }, (_, i) => <span key={i} className={i < stamps ? "on" : ""} style={{ animationDelay: `${i * 70}ms` }}><Chili /></span>)}
        </div>
        <p>{t("jarsTotal", { n: c.jars, more: jarsToNextFree(c) }).replace("·", "•")}</p>
      </section>

      <Link href="/shop" className="rrow">
        <img src="/prof-jar.jpg" alt="" />
        <span><b>FREE SALSAS</b><b>AVAILABLE: <em>{free}</em></b>{free > 0 && <small>USE IT IN YOUR CART</small>}</span>
        <i aria-hidden="true">›</i>
      </Link>
      <div className="rrow">
        <img src="/prof-shirt.jpg" alt="" />
        <span><b>FREE MERCH REWARDS</b><b>AVAILABLE: <em>{merch}</em></b><small>({t("every", { n: FREE_MERCH_EVERY }).toUpperCase()})</small></span>
        <i aria-hidden="true">›</i>
      </div>

      <div className="refbox">
        <div><small>YOUR REFERRAL CODE:</small><b>{c.referralCode}</b></div>
        <CopyCode code={c.referralCode} />
      </div>

      <form action={saveBirthMonth} className="birth">
        <select name="month" defaultValue={c.birthMonth ?? ""}>
          <option value="">{t("birthPh")}</option>
          {months.map((m, i) => <option key={m} value={i}>{m[0].toUpperCase() + m.slice(1)}</option>)}
        </select>
        <button>{t("save2")}</button>
      </form>

      <Link className="orderbtn" href="/shop">{t("orderNow")} <span aria-hidden="true">→</span></Link>
      <LogoutButton label={t("logout")} />
      <img className="prof-agave" src="/prof-agave.jpg" alt="" />
    </div>
  );
}
