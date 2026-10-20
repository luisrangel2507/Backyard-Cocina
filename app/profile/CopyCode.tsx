"use client";
import { useState } from "react";

export default function CopyCode({ code }: { code: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button className="copybtn" aria-label="Copy referral code" onClick={async () => { try { await navigator.clipboard.writeText(code); setOk(true); setTimeout(() => setOk(false), 1400); } catch {} }}>
      {ok ? "✓" : <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>}
    </button>
  );
}
