"use client";
import { useState } from "react";
import { PageBar, useT } from "@/lib/i18n-client";
import type { Key } from "@/lib/i18n";

const field = { padding: 14, borderRadius: 10, border: 0, fontSize: 16, width: "100%" } as const;

export default function Login() {
  const { t } = useT();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [f, setF] = useState({ name: "", email: "", password: "", phone: "", birthMonth: "", referral: "", offers: true });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const months = t("months").split(",");
  const set = (k: keyof typeof f, v: string | boolean) => setF({ ...f, [k]: v });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    if (r.ok) { window.location.href = "/profile"; return; }
    const code = (await r.json().catch(() => ({}))).error as string;
    setError(t(({ fields: "errFields", exists: "errExists", bad: "errBad", many: "errMany" }[code] || "errBad") as Key));
    setBusy(false);
  }

  return (
    <>
      <PageBar />
      <form onSubmit={submit} className="loginbox" style={{ display: "grid", gap: 10, maxWidth: 420, margin: "0 auto" }}>
        <h2>{t("accTitle")}</h2>
        <p>{t("accIntro")}</p>
        <div className="seg" role="tablist">
          {(["signup", "login"] as const).map((m) => <button type="button" key={m} aria-pressed={mode === m} onClick={() => { setMode(m); setError(""); }}>{t(m === "signup" ? "tabSignup" : "tabLogin")}</button>)}
        </div>
        {mode === "signup" && <input autoComplete="name" placeholder={t("fName")} value={f.name} onChange={(e) => set("name", e.target.value)} style={field} required />}
        <input type="email" autoComplete="email" placeholder={t("fEmail")} value={f.email} onChange={(e) => set("email", e.target.value)} style={field} required />
        <input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} placeholder={t("fPassword")} value={f.password} onChange={(e) => set("password", e.target.value)} style={field} required />
        {mode === "signup" && (
          <>
            <input type="tel" autoComplete="tel" placeholder={t("fPhone")} value={f.phone} onChange={(e) => set("phone", e.target.value)} style={field} />
            <select value={f.birthMonth} onChange={(e) => set("birthMonth", e.target.value)} style={field}>
              <option value="">{t("fBirth")}</option>
              {months.map((m, i) => <option key={m} value={i}>{m[0].toUpperCase() + m.slice(1)}</option>)}
            </select>
            <input placeholder={t("fRef")} value={f.referral} onChange={(e) => set("referral", e.target.value)} style={field} />
            <label style={{ textAlign: "left", fontSize: 14 }}><input type="checkbox" checked={f.offers} onChange={(e) => set("offers", e.target.checked)} /> {t("fOffers")}</label>
          </>
        )}
        <button className="btn" disabled={busy} style={{ padding: 14 }}>{busy ? t("wait") : t(mode === "signup" ? "btnSignup" : "btnLogin")}</button>
        {error && <p style={{ color: "var(--tomato)", margin: 0 }}>{error}</p>}
        {mode === "login" && <small className="muted">{t("forgot")}</small>}
      </form>
    </>
  );
}
