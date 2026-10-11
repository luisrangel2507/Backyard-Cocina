"use client";
import { useEffect } from "react";
export default function ClearCart() {
  useEffect(() => { try { localStorage.removeItem("bc-cart"); } catch {} }, []);
  return null;
}
