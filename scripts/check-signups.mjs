import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const rows = await prisma.liveSignup.findMany({
  orderBy: { createdAt: "desc" },
  take: 10,
});
console.log(`최근 신청 ${rows.length}건:`);
for (const r of rows) {
  console.log(`  - ${r.email} (${r.name}) · 신청 ${r.createdAt.toISOString()} · 발송 ${r.sentAt?.toISOString() ?? "X"}`);
}

console.log("\n=== Setting ===");
const s = await prisma.setting.findMany();
for (const x of s) {
  console.log(`  ${x.key} = ${x.value.slice(0, 80)}${x.value.length > 80 ? "..." : ""}`);
}

await prisma.$disconnect();
