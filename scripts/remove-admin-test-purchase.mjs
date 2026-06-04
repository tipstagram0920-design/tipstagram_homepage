import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const product = await prisma.product.findFirst({
  where: { slug: "marketing-booster" },
  select: { id: true },
});
const admin = await prisma.user.findFirst({
  where: { email: "hogny1@naver.com" },
  select: { id: true, email: true },
});

if (!product || !admin) {
  console.error("상품 또는 관리자 못 찾음");
  process.exit(1);
}

// 진도 기록도 같이 삭제 (FK)
const progressDeleted = await prisma.progress.deleteMany({
  where: {
    userId: admin.id,
    lesson: { section: { course: { product: { id: product.id } } } },
  },
});

const purchaseDeleted = await prisma.purchase.deleteMany({
  where: { userId: admin.id, productId: product.id },
});

console.log(`삭제: purchase ${purchaseDeleted.count}건 / progress ${progressDeleted.count}건`);
await prisma.$disconnect();
