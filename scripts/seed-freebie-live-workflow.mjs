/**
 * 무료 자료 신청 → 1분 뒤 무료 라이브 초대 메일 워크플로우 시드.
 * 본문은 코드(_email.ts의 buildEbookLivePromoEmail)에서 관리.
 *
 * 실행: node scripts/seed-freebie-live-workflow.mjs
 * 멱등: 같은 이름의 워크플로우가 있으면 step/활성 상태만 갱신.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const NAME = "무료 자료 신청 → 무료 라이브 초대 (1분 뒤)";
const TRIGGER = "freebie_signup";
const STEPS = [
  {
    delayMinutes: 1,
    action: "send_message",
    channel: "email",
    templateKey: "ebook1_live_promo",
  },
];

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const existing = await prisma.workflow.findFirst({ where: { name: NAME } });
if (existing) {
  await prisma.workflow.update({
    where: { id: existing.id },
    data: { trigger: TRIGGER, steps: STEPS, isActive: true },
  });
  console.log("워크플로우 갱신:", existing.id);
} else {
  const wf = await prisma.workflow.create({
    data: { name: NAME, trigger: TRIGGER, steps: STEPS, isActive: true },
  });
  console.log("워크플로우 생성:", wf.id);
}

await prisma.$disconnect();
