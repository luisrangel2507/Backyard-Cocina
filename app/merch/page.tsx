import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { PageBar } from "@/lib/i18n-client";

export default async function Merch() {
  const { t } = await getT();
  return (
    <>
      <PageBar />
      <section className="merch">
        <div className="mh"><h2>{t("merchTitle")}</h2><span className="soon">{t("merchSoon")}</span></div>
        <div className="tape" aria-hidden="true" />
        <div className="mgrid">
          {[["👕", t("tees")], ["🧢", t("hats")], ["👜", t("totes")]].map(([i, n]) => (
            <div className="mi" key={n}><span>{i}</span><b>{n}</b></div>
          ))}
        </div>
        <p>{t("merchP")}</p>
        <Link className="btn" href="/shop">{t("orderNow")}</Link>
      </section>
    </>
  );
}
