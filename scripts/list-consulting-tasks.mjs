// 컨설팅 등록별로 도우미가 붙은 숙제 링크를 뽑아본다 (로컬 확인용)
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const rows = await prisma.consultingEnrollment.findMany({
  select: {
    id: true,
    startAt: true,
    user: { select: { name: true } },
    tasks: {
      where: { guideKey: { in: ["my-story", "customer-select", "link-pages", "landing-page"] } },
      select: { id: true, day: true, guideKey: true },
      orderBy: [{ day: "asc" }, { order: "asc" }],
    },
  },
  orderBy: { createdAt: "desc" },
  take: 5,
});

for (const r of rows) {
  console.log(`\n[등록] ${r.user?.name ?? "이름없음"} · 시작 ${r.startAt.toISOString().slice(0, 10)}`);
  for (const t of r.tasks) {
    console.log(`   Day${t.day}  ${t.guideKey.padEnd(16)} http://localhost:3000/consulting/${t.id}`);
  }
}
if (!rows.length) console.log("등록된 컨설팅이 없습니다. /admin/consulting 에서 먼저 등록하세요.");

await prisma.$disconnect();
await pool.end();
