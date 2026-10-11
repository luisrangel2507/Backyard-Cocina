import { NextResponse } from "next/server";
import { openSlots } from "@/lib/schedule";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await openSlots()); }
