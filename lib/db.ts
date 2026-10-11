import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = db;

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const money = (c: number) => `$${(c / 100).toFixed(2)}`;
