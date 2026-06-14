/**
 * 기본 워크플로우 6종 시드. idempotent (이름 같으면 update).
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const PRESETS = [
  {
    name: "라이브 신청 D+1 알림",
    trigger: "live_signup",
    isActive: false,
    steps: [
      {
        delayMinutes: 60 * 24,
        action: "send_message",
        channel: "email",
        subject: "🎁 {{name}}님, 라이브 준비는 잘 되고 계신가요?",
        body: `<div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:24px;"></div>
  <h1 style="font-size:22px;font-weight:800;">{{name}}님, 안녕하세요</h1>
  <p style="font-size:15px;color:#444;line-height:1.7;">어제 무료 라이브를 신청해주셨는데요, 라이브 전 미리 보실 수 있는 자료 챙겨드리려고 메일 드립니다.</p>
  <p style="font-size:15px;color:#444;line-height:1.7;">라이브에서 다룰 핵심 주제 4가지를 미리 공유드리니, 궁금한 점을 적어두셨다가 라이브에서 직접 물어봐 주세요.</p>
  <p style="font-size:13px;color:#999;margin-top:24px;">— 팁스타그램</p>
</div>`,
      },
    ],
  },
  {
    name: "라이브 신청 D+3 미구매 리마인더",
    trigger: "live_signup",
    isActive: false,
    steps: [
      {
        delayMinutes: 60 * 24 * 3,
        action: "send_message",
        channel: "email",
        subject: "{{name}}님, 마케팅 부스터 강의 안내드려요",
        body: `<div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;">
  <h1 style="font-size:22px;font-weight:800;">라이브에서 다 못 다룬 내용</h1>
  <p style="font-size:15px;color:#444;line-height:1.7;">{{name}}님이 무료 라이브에서 얻으신 인사이트가 도움이 되셨다면, 본격 강의로 더 깊이 들어가보세요.</p>
  <p style="text-align:center;margin:24px 0;">
    <a href="https://tipstagram-homepage.vercel.app/courses/marketing-booster" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;">강의 자세히 보기 →</a>
  </p>
</div>`,
      },
    ],
  },
  {
    name: "회원가입 환영 메일",
    trigger: "register",
    isActive: false,
    steps: [
      {
        delayMinutes: 0,
        action: "send_message",
        channel: "email",
        subject: "🎉 {{name}}님, 팁스타그램에 오신 것을 환영합니다",
        body: `<div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;">
  <h1 style="font-size:22px;font-weight:800;">환영합니다, {{name}}님!</h1>
  <p style="font-size:15px;color:#444;line-height:1.7;">팁스타그램은 평범한 사람도 인스타그램으로 매출을 만들 수 있게 돕는 곳입니다. 둘러보시고 가장 맞는 강의를 찾아보세요.</p>
</div>`,
      },
    ],
  },
  {
    name: "구매 즉시 확인 + D+3 수강 시작 리마인더",
    trigger: "purchase",
    isActive: false,
    steps: [
      {
        delayMinutes: 0,
        action: "send_message",
        channel: "email",
        templateKey: "purchase_confirmation",
      },
      {
        delayMinutes: 60 * 24 * 3,
        action: "send_message",
        channel: "email",
        subject: "{{name}}님, 강의 잘 시작하셨나요?",
        body: `<div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;">
  <h1 style="font-size:22px;font-weight:800;">아직 시작 안 하셨다면…</h1>
  <p style="font-size:15px;color:#444;line-height:1.7;">결제하신 강의의 첫 강만 들어도 인스타그램 접근이 달라집니다. 30분만 시간 내서 시작해보세요.</p>
  <p style="text-align:center;margin:20px 0;">
    <a href="https://tipstagram-homepage.vercel.app/classroom" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#111;color:#fff;font-weight:800;text-decoration:none;">강의실 바로가기 →</a>
  </p>
</div>`,
      },
    ],
  },
  {
    name: "구매 후 D+1 \"구매자\" 태그 자동 부여",
    trigger: "purchase",
    isActive: false,
    steps: [
      {
        delayMinutes: 60 * 24,
        action: "add_tag",
        tags: ["구매자"],
      },
    ],
  },
  {
    name: "강의 완강 축하 메일",
    trigger: "lesson_complete",
    isActive: false,
    steps: [
      {
        delayMinutes: 5,
        action: "send_message",
        channel: "email",
        subject: "🎉 한 강 완강 축하드려요, {{name}}님",
        body: `<div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;">
  <h1 style="font-size:22px;font-weight:800;">잘하고 계세요!</h1>
  <p style="font-size:15px;color:#444;line-height:1.7;">한 강을 끝까지 들으셨네요. 다음 강도 이어서 들어보세요 — 누적이 변화를 만듭니다.</p>
</div>`,
      },
    ],
  },
];

for (const p of PRESETS) {
  const existing = await prisma.workflow.findFirst({ where: { name: p.name } });
  if (existing) {
    await prisma.workflow.update({
      where: { id: existing.id },
      data: { trigger: p.trigger, steps: p.steps, isActive: existing.isActive },
    });
    console.log(`updated: ${p.name}`);
  } else {
    await prisma.workflow.create({
      data: { name: p.name, trigger: p.trigger, steps: p.steps, isActive: p.isActive },
    });
    console.log(`created: ${p.name}`);
  }
}

await prisma.$disconnect();
console.log("\n✓ 프리셋 워크플로우 시드 완료. 어드민에서 활성화하세요.");
