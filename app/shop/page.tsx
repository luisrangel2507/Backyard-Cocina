import { db } from "@/lib/db";
import Store, { type Rating } from "../store";

export const dynamic = "force-dynamic";
const ORDER = ["verde", "roja", "creamy", "trio"];
const rank = (id: string) => { const i = ORDER.indexOf(id); return i < 0 ? 50 : i; };

export default async function Shop() {
  const products = (await db.product.findMany({ where: { active: true } }))
    .sort((a, b) => (a.category === "Packs" ? 1 : 0) - (b.category === "Packs" ? 1 : 0) || rank(a.id) - rank(b.id) || a.sort - b.sort);
  const stats = await db.review.groupBy({ by: ["productId"], _avg: { stars: true }, _count: true });
  const ratings: Record<string, Rating> = Object.fromEntries(stats.map((s) => [s.productId, { avg: s._avg.stars ?? 0, count: s._count }]));
  return <Store products={products} ratings={ratings} />;
}
