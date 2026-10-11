"use client";
import { useState } from "react";

const field = { padding: 12, borderRadius: 10, border: 0 } as const;

export default function Login() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [referral, setReferral] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(url: string, body: object) {
    setBusy(true); setError("");
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json(); setBusy(false);
    if (!r.ok) { setError(d.error || "Something went wrong"); return null; }
    return d;
  }
  async function request() { const d = await post("/api/auth/request", { email }); if (d) { setIsNew(d.isNew); setStep("code"); } }
  async function verify() { const d = await post("/api/auth/verify", { email, code, name, referral }); if (d) window.location.href = "/profile"; }

  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
      <h2>Backyard Club</h2>
      <p>Log in or sign up with your email. We&apos;ll send a 6-digit code. Earn a stamp for every jar; 10 jars = 1 free salsa.</p>
      {step === "email" ? (
        <>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={field} />
          <button className="btn" onClick={request} disabled={busy}>Send code</button>
        </>
      ) : (
        <>
          <input placeholder="6-digit code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} style={field} />
          {isNew && (
            <>
              <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={field} />
              <input placeholder="Referral code (optional)" value={referral} onChange={(e) => setReferral(e.target.value)} style={field} />
            </>
          )}
          <button className="btn" onClick={verify} disabled={busy}>Continue</button>
        </>
      )}
      {error && <p style={{ color: "var(--tomato)" }}>{error}</p>}
    </div>
  );
}
