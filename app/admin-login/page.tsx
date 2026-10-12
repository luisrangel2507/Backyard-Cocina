"use client";
import { useState } from "react";

const UserIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10" cy="8" r="4" /><path d="M3 20c0-3.5 3-6 7-6s7 2.5 7 6" /><path d="M18 9l1.5 1.5L22 8" /></svg>;
const LockIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15.5" r="1.3" fill="currentColor" /></svg>;
const Eye = ({ off }: { off: boolean }) => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{off && <path d="M3 3l18 18" />}</svg>;

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user, password }) });
    if (r.ok) window.location.href = "/admin";
    else { setError((await r.json()).error || "Login failed"); setBusy(false); }
  }
  return (
    <div className="alog">
      <img className="alog-top" src="/admin-top.jpg" alt="Backyard Cocina · Kitchen admin" />
      <form onSubmit={login} className="alog-card">
        <label className="alog-f"><UserIcon /><input autoComplete="username" placeholder="User" value={user} onChange={(e) => setUser(e.target.value)} /></label>
        <label className="alog-f"><LockIcon /><input autoComplete="current-password" type={show ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="alog-eye" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}><Eye off={!show} /></button>
        </label>
        <button className="alog-btn" disabled={busy}>{busy ? "Checking…" : <>Log in <span aria-hidden="true">→</span></>}</button>
        {error && <p className="alog-err">{error}</p>}
      </form>
      <img className="alog-bottom" src="/admin-bottom.jpg" alt="" />
    </div>
  );
}
