"use client";
export default function LogoutButton({ label }: { label: string }) {
  return <button className="btn" style={{ background: "transparent", border: "1.5px solid var(--cream)" }} onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }}>{label}</button>;
}
