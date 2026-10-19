import { cookies, headers } from "next/headers";
import { translate, type Key, type Lang } from "./i18n";

/** Language from the bc_lang cookie, else the browser's preferred language. */
export async function getLang(): Promise<Lang> {
  const c = (await cookies()).get("bc_lang")?.value;
  if (c === "es" || c === "en") return c;
  const al = (await headers()).get("accept-language") || "";
  return al.toLowerCase().startsWith("es") ? "es" : "en";
}

export async function getT() {
  const lang = await getLang();
  return { lang, t: (key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars) };
}
