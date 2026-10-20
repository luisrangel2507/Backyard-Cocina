"use client";
import { useRouter } from "next/navigation";
import { Curtain, usePourNavigate } from "./SalsaCurtain";

export default function Welcome() {
  const router = useRouter();
  const { pouring, go } = usePourNavigate(router, "/shop");
  return (
    <div className="welcome">
      <img className="welcome-bg" src="/splash.webp" alt="Welcome to my Backyard Cocina" />
      <button className="welcome-btn" onClick={go} disabled={pouring}>
        <span>Order our salsas</span><i aria-hidden="true">→</i>
      </button>
      {pouring && <Curtain mode="in" />}
    </div>
  );
}
