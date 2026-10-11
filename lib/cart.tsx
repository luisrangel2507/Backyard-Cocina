"use client";
import { useEffect, useState } from "react";

export type Cart = Record<string, number>;
const KEY = "bc-cart";

export function useCart() {
  const [cart, setCart] = useState<Cart>({});
  useEffect(() => { try { setCart(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {} }, []);
  const save = (c: Cart) => { setCart(c); try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} };
  return {
    cart,
    add: (id: string, d = 1) => { const q = Math.max(0, (cart[id] || 0) + d); const c = { ...cart, [id]: q }; if (!q) delete c[id]; save(c); },
    clear: () => save({}),
    count: Object.values(cart).reduce((a, b) => a + b, 0),
  };
}
