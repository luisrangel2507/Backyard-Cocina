import { db } from "@/lib/db";
import Store, { type Rating } from "../store";

export const dynamic = "force-dynamic";
const ORDER = ["trio", "verde", "roja", "creamy"];

export default async function Shop() {
  const products = (await db.product.findMany({ where: { active: true } }))
    .sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  const stats = await db.review.groupBy({ by: ["productId"], _avg: { stars: true }, _count: true });
  const ratings: Record<string, Rating> = Object.fromEntries(stats.map((s) => [s.productId, { avg: s._avg.stars ?? 0, count: s._count }]));
  return <Store products={products} ratings={ratings} />;
}
