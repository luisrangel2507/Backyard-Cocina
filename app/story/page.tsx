import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { LangToggle } from "@/lib/i18n-client";

export const metadata = { title: "My story · Backyard Cocina" };

export default async function Story() {
  const { t } = await getT();
  return (
    <section className="mystory">
      <img className="ms-side" src="/story-side.jpg" alt="Brant Fedor" />
      <div className="ms-lang"><LangToggle /></div>
      <div className="ms-text">
        <p className="ms-eyebrow">{t("stEyebrow")}</p>
        <h1>{t("stTitle")}</h1>
        <p>{t("st1")}</p>
        <p>{t("st2a")}<b>{t("st2b")}</b></p>
        <p>{t("st3")}</p>
      </div>
      <Link className="ms-btn" href="/shop">{t("stOrder")} <span aria-hidden="true">→</span></Link>
      <img className="ms-table" src="/story-table.jpg" alt="" />
    </section>
  );
}
