import { db } from "@/lib/db";
import Store from "../store";

export const dynamic = "force-dynamic";
const ORDER = ["verde", "roja", "creamy"];

export default async function Shop() {
  const products = (await db.product.findMany({ where: { active: true } }))
    .sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  return <Store products={products} />;
}
