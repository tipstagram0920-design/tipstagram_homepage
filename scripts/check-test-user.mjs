import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const user = await prisma.user.findFirst({
  where: { email: "test@test.com" },
  select: { id: true, email: true, name: true, createdAt: true },
});
console.log("test@test.com 계정:", user ?? "없음");

if (user) {
  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id },
    include: { product: { select: { slug: true, title: true } } },
  });
  console.log("\n해당 사용자 구매 기록:", purchases.length, "건");
  purchases.forEach((p) => console.log(`  - ${p.product.slug} (${p.product.title})`));
}

await prisma.$disconnect();
