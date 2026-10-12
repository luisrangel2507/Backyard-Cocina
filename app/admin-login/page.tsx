"use client";
import { useState } from "react";

const field = { padding: 14, borderRadius: 10, border: 0, fontSize: 16 } as const;

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user, password }) });
    if (r.ok) window.location.href = "/admin";
    else { setError((await r.json()).error || "Login failed"); setBusy(false); }
  }
  return (
    <form onSubmit={login} style={{ display: "grid", gap: 12, maxWidth: 380, margin: "40px auto" }}>
      <img src="/logo.png" alt="" style={{ width: 110, margin: "0 auto" }} />
      <h2 style={{ textAlign: "center", margin: 0 }}>Kitchen admin</h2>
      <input autoComplete="username" placeholder="User" value={user} onChange={(e) => setUser(e.target.value)} style={field} />
      <input autoComplete="current-password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={field} />
      <button className="btn" disabled={busy} style={{ padding: 14, background: "var(--tomato)", borderRadius: 999 }}>{busy ? "Checking…" : "Log in"}</button>
      {error && <p style={{ color: "var(--tomato)", textAlign: "center" }}>{error}</p>}
    </form>
  );
}
