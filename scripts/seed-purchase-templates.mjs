// 구매 완료 안내 문안(메일 + 문자)을 "글" 형태로 심는다.
// 어드민(/admin/email-templates)에서 이 글이 그대로 보이고, 고치면 그대로 발송된다.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const SITE = "https://tipstagram-homepage.vercel.app";

// ── 공통 (챌린지가 아닌 상품)
const commonText = `# {{name}}님, 결제가 완료되었습니다

결제 내역을 확인해 주세요. 지금 바로 수강하실 수 있습니다.

- 상품: {{product}}
- 결제금액: {{amount}}
- 주문번호: {{orderId}}

[버튼]내 강의실 열기|${SITE}/classroom

결제 내역이 다르거나 문의사항이 있으면 이 메일에 답장해 주세요.`;

const commonSms = `[팁스타그램] {{name}}님, {{product}} 결제가 완료되었습니다.
지금 바로 수강하실 수 있습니다: ${SITE}/classroom`;

// ── 5주 챌린지 계열
const challengeText = `# {{name}}님, 5주 챌린지 참여가 확정되었습니다

가장 먼저 하실 일은 오픈채팅방 입장입니다. 공지와 안내가 모두 이곳으로 갑니다.

- 상품: {{product}}
- 결제금액: {{amount}}
- 주문번호: {{orderId}}
- 참여 기수: {{cohortName}}
- 1주차 시작: {{week1Date}}

[버튼]오픈채팅방 입장하기|{{openChatUrl}}
[버튼]챌린지 페이지 열기|{{challengeUrl}}

챌린지 페이지에 처음 들어가면 시작 전 방향 선택이 먼저 나옵니다.
파는 것이 있는지, 어떤 업종인지에 따라 5주 내용이 달라지니 여기부터 해주세요.

1주차가 열리면 숙제가 공개됩니다. 그때 다시 안내드리겠습니다.`;

const challengeSms = `[팁스타그램] {{name}}님, {{product}} 결제가 완료되었습니다.

· 참여 기수: {{cohortName}}
· 1주차 시작: {{week1Date}}
· 오픈채팅방: {{openChatUrl}}

먼저 오픈채팅방에 입장해 주세요.`;

// 발송 HTML 은 API 와 같은 함수로 만들어야 하므로 여기서는 bodyText 만 넣고
// html 은 같은 규칙으로 렌더한 결과를 넣는다 (lib/email-body.ts 와 동일 규칙).
const { renderEmailFromText } = await import("../src/lib/email-body.ts").catch(() => ({}));

async function put({ productId, name, subject, text, sms }) {
  const html = renderEmailFromText ? renderEmailFromText(text) : null;
  const found = await prisma.emailTemplate.findFirst({
    where: { type: "purchase_confirmation", productId },
  });
  const data = {
    name,
    subject,
    bodyText: text,
    smsBody: sms,
    design: null,
    isActive: true,
    ...(html ? { html } : {}),
  };
  if (found) {
    const t = await prisma.emailTemplate.update({ where: { id: found.id }, data });
    console.log(`  (갱신) ${t.name}`);
    return t;
  }
  const t = await prisma.emailTemplate.create({
    data: { type: "purchase_confirmation", productId, html: html ?? "", ...data },
  });
  console.log(`  (생성) ${t.name}`);
  return t;
}

const challenge = await prisma.product.findUnique({ where: { slug: "5-week-challenge" }, select: { id: true, title: true } });
const plus = await prisma.product.findUnique({ where: { slug: "5-week-challenge-plus-consulting" }, select: { id: true, title: true } });

await put({ productId: null, name: "구매 완료 안내 (공통)", subject: "{{product}} 결제가 완료되었습니다", text: commonText, sms: commonSms });
if (challenge) await put({ productId: challenge.id, name: `구매 완료 안내 (${challenge.title})`, subject: "{{name}}님, 5주 챌린지 참여가 확정되었습니다", text: challengeText, sms: challengeSms });
if (plus) await put({ productId: plus.id, name: `구매 완료 안내 (${plus.title})`, subject: "{{name}}님, 5주 챌린지 참여가 확정되었습니다", text: challengeText, sms: challengeSms });

await prisma.$disconnect();
await pool.end();
