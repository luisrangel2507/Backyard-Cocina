"use client";
export default function LogoutAdmin() {
  return (
    <button className="alogout" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/admin-login"; }}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M14 8l4 4-4 4M18 12H9" /></svg>
      Log out
    </button>
  );
}
