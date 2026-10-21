"use client";
import { useEffect, useState } from "react";
import { PageBar } from "@/lib/i18n-client";

const field = { padding: 14, borderRadius: 10, border: 0, fontSize: 16, width: "100%" } as const;

export default function Reset() {
  const [token, setToken] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setToken(new URLSearchParams(location.search).get("token") || ""); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const r = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: pw }) });
    if (r.ok) { location.href = "/profile"; return; }
    setMsg((await r.json().catch(() => ({}))).error || "Something went wrong"); setBusy(false);
  }
  return (
    <>
      <PageBar />
      <form onSubmit={submit} className="loginbox" style={{ display: "grid", gap: 10, maxWidth: 420, margin: "0 auto" }}>
        <h2>New password</h2>
        <input type="password" autoComplete="new-password" minLength={8} placeholder="New password (8+ characters)" value={pw} onChange={(e) => setPw(e.target.value)} style={field} required />
        <button className="btn" disabled={busy || !token} style={{ padding: 14 }}>{busy ? "One moment…" : "Save and log in"}</button>
        {msg && <p style={{ color: "var(--tomato)", margin: 0 }}>{msg}</p>}
      </form>
    </>
  );
}
