import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export async function GET() {
  const products = await db.product.findMany({ where: { active: true }, select: { id: true, name: true, priceCents: true, jars: true, stock: true, image: true } });
  return NextResponse.json(products);
}
