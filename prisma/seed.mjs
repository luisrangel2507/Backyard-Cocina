import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const products = [
  { id: "verde", name: "Salsa Verde", category: "Verde", heat: 2, priceCents: 899, color: "#139a74", jars: 1, pairs: ["Tacos", "Eggs", "Chips"], tip: "Spoon it over carnitas tacos with diced onion and a squeeze of lime.", description: "Tomatillo, serrano, cilantro and lime. Bright, fresh and made for tacos." },
  { id: "roja", name: "Salsa Roja", category: "Roja", heat: 3, priceCents: 899, color: "#e0392a", jars: 1, pairs: ["Carne asada", "Chilaquiles", "Burritos"], tip: "Simmer a cup with tortilla chips for 2 minutes for quick chilaquiles rojos.", description: "Roasted tomatoes, guajillo and árbol chiles. Bold, smoky and full of flavor." },
  { id: "creamy", name: "Creamy Salsa", category: "Creamy", heat: 2, priceCents: 899, color: "#e3a32a", jars: 1, pairs: ["Chicken", "Fries", "Bowls"], tip: "Use it as a dip for fries or drizzle it on a grilled chicken bowl.", description: "Roasted peppers, garlic and a creamy twist. Smooth with a kick." },
  { id: "trio", name: "Backyard Trio", category: "Packs", heat: 3, priceCents: 2299, color: "#13285f", jars: 3, pairs: ["Taco night", "Parties", "Gifts"], tip: "Set out all three for taco night and let everyone build their own.", description: "One Verde, one Roja and one Creamy. Save $3.98 and earn 3 stamps." },
];
for (const p of products) await db.product.upsert({ where: { id: p.id }, update: {}, create: p });

await db.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
console.log("Seeded", products.length, "products");
await db.$disconnect();
