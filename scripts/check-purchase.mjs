import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const product = await prisma.product.findFirst({
  where: { slug: "marketing-booster" },
  select: { id: true, title: true, price: true },
});
console.log("상품:", product);

if (!product) process.exit(0);

const purchases = await prisma.purchase.findMany({
  where: { productId: product.id },
  include: { user: { select: { email: true, name: true } } },
});
console.log(`\n구매 기록 ${purchases.length}건:`);
for (const p of purchases) {
  console.log(`  - ${p.user.email} (${p.user.name}) · ${p.createdAt.toISOString()} · status:${p.status ?? "n/a"}`);
}

await prisma.$disconnect();
