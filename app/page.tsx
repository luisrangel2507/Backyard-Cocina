"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// Full-screen splash. The tappable area sits exactly on the button drawn in /splash.jpg (851×1848).
const IW = 851, IH = 1848, BTN = { x: 110, y: 1517, w: 630, h: 118 };

export default function Welcome() {
  const [box, setBox] = useState<React.CSSProperties>({});
  const [img, setImg] = useState<React.CSSProperties>({ inset: 0, width: "100%", height: "100%", objectFit: "cover" });
  useEffect(() => {
    const place = () => {
      const W = innerWidth, H = innerHeight, w = W / H >= 0.75;
      const k = w ? Math.min(W / IW, H / IH) : Math.max(W / IW, H / IH);
      // On phones, lift the art so the drawn button clears the browser's bottom toolbar.
      const lift = w ? 0 : Math.min(90, H * 0.09);
      const ox = (W - IW * k) / 2, oy = (H - IH * k) * (w ? 0.5 : 0.45) - lift;
      setImg({ left: ox, top: oy, width: IW * k, height: IH * k });
      setBox({ left: ox + BTN.x * k, top: oy + BTN.y * k, width: BTN.w * k, height: BTN.h * k });
    };
    place(); addEventListener("resize", place);
    return () => removeEventListener("resize", place);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 20, background: "#0d1730", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: -40, background: "url(/splash.jpg) center/cover", filter: "blur(30px) brightness(.55)" }} />
      <img src="/splash.jpg" alt="Welcome to my Backyard Cocina"
        style={{ position: "absolute", ...img }} />
      <Link href="/shop" aria-label="Order our salsas" style={{ position: "absolute", borderRadius: 999, ...box }} />
    </div>
  );
}
