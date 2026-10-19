"use client";
import { useEffect, useState } from "react";

export type Cart = Record<string, number>;
const KEY = "bc-cart", TS = "bc-cart-ts", MAX_AGE = 12 * 3600 * 1000; // forgotten carts clear after 12 hours

export function useCart() {
  const [cart, setCart] = useState<Cart>({});
  useEffect(() => {
    try {
      const age = Date.now() - Number(localStorage.getItem(TS) || 0);
      if (age > MAX_AGE) { localStorage.removeItem(KEY); return; }
      setCart(JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch {}
  }, []);
  const save = (c: Cart) => { setCart(c); try { localStorage.setItem(KEY, JSON.stringify(c)); localStorage.setItem(TS, String(Date.now())); } catch {} };
  return {
    cart,
    add: (id: string, d = 1) => { const q = Math.max(0, (cart[id] || 0) + d); const c = { ...cart, [id]: q }; if (!q) delete c[id]; save(c); },
    clear: () => save({}),
    count: Object.values(cart).reduce((a, b) => a + b, 0),
  };
}
