"use client";
export default function LogoutAdmin() {
  return <button className="chip" style={{ fontSize: 13 }} onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/admin-login"; }}>Log out</button>;
}
