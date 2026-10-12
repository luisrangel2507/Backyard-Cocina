import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCustomer } from "@/lib/auth";
import { FREE_SALSA_EVERY, FREE_MERCH_EVERY, freeSalsasAvailable, merchAvailable, jarsToNextFree } from "@/lib/loyalty";
import LogoutButton from "./logout";

export const dynamic = "force-dynamic";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
  const stamps = c.jars % FREE_SALSA_EVERY;
  const free = Math.max(0, freeSalsasAvailable(c));
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  return (
    <div className="profilebox" style={{ display: "grid", gap: 14, maxWidth: 480 }}>
      <h2>Hi, {c.name}</h2>
      <div className="card" style={{ padding: 16 }}>
        <b>Stamp card</b>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "10px 0", justifyContent: "center" }}>
          {Array.from({ length: FREE_SALSA_EVERY }, (_, i) => (
            <span key={i} style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--cream)", background: i < stamps ? "var(--tomato)" : "transparent" }} />
          ))}
        </div>
        <small>{c.jars} jars total · {jarsToNextFree(c)} more for your next free salsa</small>
      </div>
      <p>🎁 Free salsas available: <b>{free}</b>{free > 0 && <> — apply at checkout.</>}</p>
      <p>👕 Free merch rewards available: <b>{Math.max(0, merchAvailable(c))}</b> (every {FREE_MERCH_EVERY} jars)</p>
      <p>Your referral code: <b>{c.referralCode}</b>{site && <><br /><small>{site}/login</small></>}</p>
      <form action={saveBirthMonth} style={{ display: "flex", gap: 8 }}>
        <select name="month" defaultValue={c.birthMonth ?? ""} style={{ padding: 12, borderRadius: 10, border: 0 }}>
          <option value="">Birthday month (free salsa!)</option>
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <button className="btn">Save</button>
      </form>
      <LogoutButton />
    </div>
  );
}
