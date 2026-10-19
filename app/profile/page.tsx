import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCustomer } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { PageBar } from "@/lib/i18n-client";
import { FREE_SALSA_EVERY, FREE_MERCH_EVERY, freeSalsasAvailable, merchAvailable, jarsToNextFree } from "@/lib/loyalty";
import LogoutButton from "./logout";

export const dynamic = "force-dynamic";

async function saveBirthMonth(form: FormData) {
  "use server";
  const c = await getCustomer();
  if (!c) return;
  const v = String(form.get("month"));
  await db.customer.update({ where: { id: c.id }, data: { birthMonth: v === "" ? null : Math.min(11, Math.max(0, Number(v))) } });
  revalidatePath("/profile");
}

export default async function Profile() {
  const c = await getCustomer();
  if (!c) redirect("/login");
  const { t } = await getT();
  const months = t("months").split(",");
  const stamps = c.jars % FREE_SALSA_EVERY;
  const free = Math.max(0, freeSalsasAvailable(c));
  return (
    <>
      <PageBar />
      <div className="profilebox" style={{ display: "grid", gap: 14, maxWidth: 480, margin: "0 auto" }}>
        <h2>{t("hi", { name: c.name.split(" ")[0] })}</h2>
        <div className="card" style={{ padding: 16 }}>
          <b>{t("stampCard")}</b>
          <div className="stamps">
            {Array.from({ length: FREE_SALSA_EVERY }, (_, i) => <span key={i} className={i < stamps ? "on" : ""} style={{ animationDelay: `${i * 70}ms` }} />)}
          </div>
          <small>{t("jarsTotal", { n: c.jars, more: jarsToNextFree(c) })}</small>
        </div>
        <p>{t("freeAvail")} <b>{free}</b>{free > 0 && t("applyCheckout")}</p>
        <p>{t("merchAvail")} <b>{Math.max(0, merchAvailable(c))}</b> ({t("every", { n: FREE_MERCH_EVERY })})</p>
        <p>{t("refCode")} <b>{c.referralCode}</b></p>
        <form action={saveBirthMonth} style={{ display: "flex", gap: 8 }}>
          <select name="month" defaultValue={c.birthMonth ?? ""} style={{ padding: 12, borderRadius: 10, border: 0, flex: 1 }}>
            <option value="">{t("birthPh")}</option>
            {months.map((m, i) => <option key={m} value={i}>{m[0].toUpperCase() + m.slice(1)}</option>)}
          </select>
          <button className="btn">{t("save2")}</button>
        </form>
        <Link className="btn" href="/shop" style={{ textAlign: "center", textDecoration: "none" }}>{t("orderNow")}</Link>
        <LogoutButton label={t("logout")} />
      </div>
    </>
  );
}
