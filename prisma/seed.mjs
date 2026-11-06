import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// Product lineup. Runs on every start: creates missing products, and renames the original three
// only while they still have their old default names (so edits made in the admin are never overwritten).
const products = [
  { id: "verde", name: "La Güerita", category: "Güerita", heat: 2, priceCents: 1000, color: "#1f9a4b", jars: 1, sort: 1, pairs: ["Tacos", "Eggs", "Chips"], tip: "Spoon it over carnitas tacos with diced onion and a squeeze of lime.", description: "Tomatillo, serrano, cilantro and lime. Bright, fresh and made for tacos.", old: "Salsa Verde" },
  { id: "creamy", name: "La Sunset", category: "Sunset", heat: 2, priceCents: 1000, color: "#f07a1a", jars: 1, sort: 2, pairs: ["Chicken", "Fries", "Bowls"], tip: "Use it as a dip for fries or drizzle it on a grilled chicken bowl.", description: "Roasted peppers, garlic and a creamy twist. Smooth with a kick.", old: "Creamy Salsa" },
  { id: "roja", name: "La Diablita", category: "Diablita", heat: 3, priceCents: 1000, color: "#d9261a", jars: 1, sort: 3, pairs: ["Carne asada", "Chilaquiles", "Burritos"], tip: "Simmer a cup with tortilla chips for 2 minutes for quick chilaquiles rojos.", description: "Roasted tomatoes, guajillo and árbol chiles. Bold, smoky and full of flavor.", old: "Salsa Roja" },
  { id: "mamacita", name: "La Mamacita", category: "Mamacita", heat: 3, priceCents: 1000, color: "#7b3fb8", jars: 1, sort: 4, pairs: ["Tacos", "Nachos", "Grilled meats"], tip: "", description: "A violet salsa with attitude. Ask Brant what's inside." },
  { id: "nomames", name: "La No Mames", category: "No Mames", heat: 5, priceCents: 1000, color: "#9c1c10", jars: 1, sort: 5, pairs: ["Tacos", "Wings", "Brave people"], tip: "", description: "Chile de árbol, roasted and blended. Our hottest one. You've been warned." },
  { id: "trio", name: "Backyard Trio", category: "Packs", heat: 3, priceCents: 2500, color: "#13285f", jars: 3, sort: 99, pairs: ["Taco night", "Parties", "Gifts"], tip: "Set out all three for taco night and let everyone build their own.", description: "One Güerita, one Sunset and one Diablita. Save $5 and earn 3 stamps.", old: "Backyard Trio", oldDesc: "One Verde, one Roja and one Creamy. Save $5 and earn 3 stamps." },
];

for (const { old, oldDesc, ...p } of products) {
  const cur = await db.product.findUnique({ where: { id: p.id } });
  if (!cur) { await db.product.create({ data: p }); continue; }
  if ((p.id === "mamacita" || p.id === "nomames") && cur.priceCents === 899) await db.product.update({ where: { id: p.id }, data: { priceCents: 1000 } });
  if (old && cur.name === old) {
    const { id, priceCents, stock, image, ...rename } = p;
    await db.product.update({ where: { id: p.id }, data: (oldDesc && cur.description !== oldDesc) ? { name: p.name, category: p.category, color: p.color, sort: p.sort } : rename });
  }
}

await db.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
console.log("Seeded", products.length, "products");
await db.$disconnect();
