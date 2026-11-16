"use client";
import { useState } from "react";
import Link from "next/link";

// Login for partners (e.g. Blade & Barber). Brant sets the user and password in /admin → Partners → Edit partner.
export default function PartnerLogin() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const r = await fetch("/api/partner/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user, password }) });
    if (r.ok) window.location.href = "/partner";
    else { setError((await r.json()).error || "Login failed"); setBusy(false); }
  }
  return (
    <div className="alog plog">
      <Link href="/shop" className="alog-back" aria-label="Back to the shop">← Shop</Link>
      <img className="plog-logo" src="/logo.png" alt="Backyard Cocina" />
      <h1 className="plog-title">Partner login</h1>
      <p className="plog-sub">See the jars on your shelf and how many have sold.</p>
      <form onSubmit={login} className="alog-card">
        <label className="alog-f"><span aria-hidden="true">👤</span><input autoComplete="username" autoCapitalize="none" placeholder="User" value={user} onChange={(e) => setUser(e.target.value)} /></label>
        <label className="alog-f"><span aria-hidden="true">🔒</span><input autoComplete="current-password" type={show ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="alog-eye" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
        </label>
        <button className="alog-btn" disabled={busy}>{busy ? "Checking…" : <>Log in <span aria-hidden="true">→</span></>}</button>
        {error && <p className="alog-err">{error}</p>}
      </form>
    </div>
  );
}
