"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useT } from "@/lib/i18n-client";

const I = ({ d }: { d: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

// Slide-in menu for phones: big tap targets, icons, cart count, and the staff logins tucked at the bottom.
export default function SideMenu({ open, onClose, member, count }: { open: boolean; onClose: () => void; member: boolean | null; count: number }) {
  const { t } = useT();
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // the page behind doesn't scroll while the menu is open
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = prev; };
  }, [open, onClose]);

  return (
    <div className={`smenu${open ? " open" : ""}`} aria-hidden={!open}>
      <button className="smenu-bg" aria-label="Close menu" tabIndex={open ? 0 : -1} onClick={onClose} />
      <nav className="smenu-panel" aria-label="Menu">
        <div className="smenu-top">
          <img src="/logo.png" alt="" />
          <span>BACKYARD<br />COCINA</span>
          <button className="smenu-x" aria-label="Close menu" tabIndex={open ? 0 : -1} onClick={onClose}>
            <I d={<path d="M6 6l12 12M18 6L6 18" />} />
          </button>
        </div>

        <div className="smenu-links">
          <Link href="/shop" onClick={onClose} tabIndex={open ? 0 : -1}>
            <I d={<><path d="M8 3h8M9 3v3l-2 3v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9l-2-3V3" /><path d="M7 13h10" /></>} />
            <span><b>{t("menuOrder")}</b><small>{t("smOrderD")}</small></span>
          </Link>
          <Link href="/cart" onClick={onClose} tabIndex={open ? 0 : -1}>
            <I d={<><path d="M3 4h2l2.400 11h10.200L20 7H6.200" /><circle cx="9" cy="19.500" r="1.400" /><circle cx="17" cy="19.500" r="1.400" /></>} />
            <span><b>{t("menuCart")}</b><small>{count > 0 ? `${count} ${count > 1 ? t("items") : t("item")}` : t("smCartEmpty")}</small></span>
            {count > 0 && <em>{count}</em>}
          </Link>
          <Link href={member ? "/profile" : "/login"} onClick={onClose} tabIndex={open ? 0 : -1}>
            <I d={<><path d="M12 3l2.600 5.600 6 .700-4.500 4.100 1.300 6L12 16.300 6.600 19.400l1.300-6L3.400 9.300l6-.700z" /></>} />
            <span><b>{t("menuClub")}</b><small>{member ? t("smClubIn") : t("smClubD")}</small></span>
          </Link>
          <Link href="/story" onClick={onClose} tabIndex={open ? 0 : -1}>
            <I d={<><circle cx="12" cy="8" r="3.500" /><path d="M5 20c0-3.600 3.100-6 7-6s7 2.400 7 6" /></>} />
            <span><b>{t("menuStory")}</b><small>{t("smStoryD")}</small></span>
          </Link>
          <a href="https://www.instagram.com/backyardcocina" target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>
            <I d={<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.500" cy="6.500" r=".8" fill="currentColor" /></>} />
            <span><b>Instagram</b><small>@backyardcocina</small></span>
          </a>
        </div>

        <div className="smenu-foot">
          <small>{t("smStaff")}</small>
          <div>
            <Link href="/admin" tabIndex={open ? 0 : -1}>🔒 {t("menuKitchen").replace(" 🔒", "")}</Link>
            <Link href="/partner" tabIndex={open ? 0 : -1}>💈 {t("smPartner")}</Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
