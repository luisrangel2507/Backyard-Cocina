import { NextResponse } from "next/server";
import { getCustomer } from "@/lib/auth";
import { freeSalsasAvailable } from "@/lib/loyalty";

export const dynamic = "force-dynamic";
export async function GET() {
  const c = await getCustomer();
  return NextResponse.json(c ? { name: c.name, freeSalsas: Math.max(0, freeSalsasAvailable(c)) } : null);
}
