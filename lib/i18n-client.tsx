"use client";
import { useCart } from "@/lib/cart";
import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { translate, type Key, type Lang } from "./i18n";

const Ctx = createContext<Lang>("en");
export const LangProvider = ({ lang, children }: { lang: Lang; children: React.ReactNode }) => <Ctx.Provider value={lang}>{children}</Ctx.Provider>;

export function useT() {
  const lang = useContext(Ctx);
  return { lang, t: (key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars) };
}

const SHOW_TOGGLE = false; // keep in sync with SPANISH_ENABLED in i18n-server.ts

export function LangToggle() {
  const { lang } = useT();
  const router = useRouter();
  const set = (l: Lang) => {
    if (l === lang) return;
    document.cookie = `bc_lang=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };
  if (!SHOW_TOGGLE) return null;
  return (
    <span className="langtog" role="group" aria-label="Language">
      {(["en", "es"] as const).map((l) => <button key={l} aria-pressed={lang === l} onClick={() => set(l)}>{l.toUpperCase()}</button>)}
    </span>
  );
}

/** Slim top bar for inner pages: logo back to the shop + language switch. */
export function PageBar() {
  const { t } = useT();
  const { count } = useCart();
  return (
    <div className="pagebar">
      <Link href="/shop" className="logo"><img src="/logo.png" alt="Backyard Cocina" /></Link>
      <span className="pb-right">
        <LangToggle />
        <Link href="/shop" className="pb-shop">← {t("pbShop")}</Link>
        <Link className="icon" href="/cart" aria-label={t("openCart")}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h2l2.400 11h10.200L20 7H6.200" /><circle cx="9" cy="19.500" r="1.400" /><circle cx="17" cy="19.500" r="1.400" /></svg>
          {count > 0 && <span className="badge" key={count}>{count}</span>}
        </Link>
      </span>
    </div>
  );
}
