/**
 * 웨비나 캠페인 카톡방 메시지 12종 미리보기 메일을 hogny1@naver.com 으로 발송.
 *
 * 실행:
 *   node scripts/send-kakao-broadcast-preset.mjs              # 캠페인 없이 placeholder 값
 *   node scripts/send-kakao-broadcast-preset.mjs <campaignId> # 특정 캠페인의 실제 값으로 치환
 *
 * 카피 원본: src/lib/crm/kakao-broadcast-preset.ts (진정성 톤 12개)
 * 변경 시 이 파일도 함께 갱신.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { Resend } from "resend";

const TO = "hogny1@naver.com";
const FROM = "팁스타그램 <noreply@tipstagram.co.kr>";
const SITE = "https://tipstagram-homepage.vercel.app";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const campaignId = process.argv[2] || null;

// Setting 로드
const settingRows = await prisma.setting.findMany();
const settings = Object.fromEntries(settingRows.map((s) => [s.key, s.value]));

let campaign = null;
if (campaignId) {
  campaign = await prisma.webinarCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    console.error("캠페인을 찾을 수 없어요:", campaignId);
    process.exit(1);
  }
}

function formatKstDate(d) {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const m = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const dow = ["일","월","화","수","목","금","토"][kst.getUTCDay()];
  const h = kst.getUTCHours();
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${m}월 ${day}일(${dow}) ${ampm} ${h12}시`;
}

const VARS = {
  webinarDate: campaign ? formatKstDate(campaign.webinarDate) : "[라이브 날짜 · 캠페인 등록 시 자동 채워짐]",
  zoomUrl:
    (campaign && campaign.zoomUrl) ||
    settings.webinar_zoom_url ||
    "[Zoom URL · 캠페인 또는 Setting에서 지정]",
  ebook1Url: settings.ebook1_url || settings.ebook_url || "[1차 전자책 URL 미설정]",
  preQuestionUrl:
    (campaign && campaign.preQuestionUrl) ||
    (campaign ? `${SITE}/webinar/ask/${campaign.id}` : null) ||
    settings.webinar_pre_question_url ||
    "[사전 질문 URL · 캠페인 등록 시 자동]",
  salesUrl:
    (campaign && campaign.salesUrl) ||
    settings.external_checkout_url ||
    "[강의 신청 URL · 캠페인 등록 시 지정]",
};

function applyVars(body) {
  let s = body;
  for (const [k, v] of Object.entries(VARS)) s = s.replaceAll(`{{${k}}}`, v);
  return s;
}

// ─── 진정성 톤 12개 메시지 (lib/crm/kakao-broadcast-preset.ts 와 동일) ───
const MESSAGES = [
  {
    label: "D-10 · 환영",
    timing: "라이브 10일 전 · 오전 9시",
    body: `안녕하세요. 팁스타그램입니다.

이번 무료 라이브에 신청해 주신 분들께 먼저 감사드립니다.

라이브 일정 안내드립니다.
📅 일시 {{webinarDate}}
📍 장소 Zoom
💰 참가비 0원

라이브까지 약 열흘. 그 사이에 짧은 메시지 몇 번 더 드릴 예정입니다. 모두 라이브에서 더 잘 받아가실 수 있도록 준비하는 내용이에요.

오늘은 워밍업으로 1차 전자책 한 권 두고 갑니다.
{{ebook1Url}}

팁스타그램 드림`,
  },
  {
    label: "D-7 · 무료 여부 명시",
    timing: "라이브 7일 전 · 오전 9시",
    body: `팁스타그램입니다.

"이거 진짜로 무료가 맞느냐"는 질문을 자주 받습니다.

명확히 말씀드리겠습니다.
· 결제 절차 없습니다.
· 카드 등록 없습니다.
· 시간을 내어 들어와 주시면 그것으로 충분합니다.

광고비 없이 인스타로 결과 내는 방법을 보여드리는 자리이기에, 이 자리 자체에도 비용을 부과하지 않습니다.

라이브에서는 1차 전자책의 가장 많이 캡처되는 챕터 "왜 내 게시물은 30명만 보는가"를 직접 풀어드립니다.

팁스타그램 드림`,
  },
  {
    label: "D-5 · 강사 스토리",
    timing: "라이브 5일 전 · 오전 9시",
    body: `팁스타그램입니다.

오늘은 짧은 이야기 하나만 두고 가겠습니다.

저도 처음 인스타를 시작했을 때 팔로워는 0이었습니다. 첫 6개월 동안 200명. 한 달에 33명씩 늘어나는 속도였습니다.

그러다 한 가지를 바꿨습니다. 콘텐츠의 "구조"입니다. 그 다음 한 달 만에 1만 명이 늘었고, 그 흐름이 1년 동안 이어졌습니다.

라이브에서는 그 변곡점을 시간 순서대로 풀어드립니다.

팁스타그램 드림`,
  },
  {
    label: "D-4 · 페르소나 사례",
    timing: "라이브 4일 전 · 오전 9시",
    body: `팁스타그램입니다.

"저는 인플루언서도 아니고 평범한 사람이에요. 저 같은 사람도 되나요?"

자주 받는 질문입니다. 짧게 사례만 적어드리겠습니다.

· 워킹맘 — 아이 재운 밤 한 시간만 써서 6개월에 1만 팔로워
· 동네 네일샵 사장님 — 게시물 하나로 매출 5배
· 현직 회계사 — N잡으로 월 300
· 음악학원 원장님 — 학생 모집 줄이 끊긴 적 없음

공통점은 한 가지입니다. 모두 "저는 안 될 것 같은데..."로 시작하셨습니다.

라이브에서 더 보여드리겠습니다.

팁스타그램 드림`,
  },
  {
    label: "D-3 · 시간 부담 해소",
    timing: "라이브 3일 전 · 오전 9시",
    body: `팁스타그램입니다.

"그날 바빠서 들어가지 못할 것 같다"는 메시지를 종종 받습니다. 두 가지만 말씀드리겠습니다.

첫째, 라이브는 1시간 30분이지만, 첫 30분에 핵심을 다 담아둡니다. 30분만 들으셔도 가져가실 게 충분합니다.

둘째, 참여자분들께만 72시간 동안 다시보기 링크를 보내드립니다. 출근길에, 잠들기 전에 들으셔도 됩니다.

신청 취소하지 마시고 그대로 두세요. 그게 가장 안전한 선택입니다.

팁스타그램 드림`,
  },
  {
    label: "D-2 · 사전 질문 받기",
    timing: "라이브 2일 전 · 오전 9시",
    body: `팁스타그램입니다.

라이브까지 48시간 남았습니다.

지금까지 받은 질문 중 가장 많은 세 가지를 공유드립니다.
1. 콘텐츠를 매일 올리는 것이 정답인가요?
2. 릴스와 피드 중 어느 쪽을 먼저 해야 하나요?
3. 팔로워는 느는데 매출이 그대로입니다.

라이브에서 모두 답해드릴 예정입니다.

다만 각자의 상황은 또 다르실 겁니다. 본인이 가장 궁금한 것 하나만 미리 보내주시면, 라이브 중에 익명으로 직접 답해드리겠습니다.

▶ 사전 질문 보내기
{{preQuestionUrl}}

팁스타그램 드림`,
  },
  {
    label: "D-1 · 입장 안내",
    timing: "라이브 1일 전 · 오전 9시",
    body: `팁스타그램입니다.

내일이 라이브 당일입니다.

📅 일시 {{webinarDate}}
📍 장소 Zoom (입장 링크는 당일 1시간 전 다시 안내드립니다)
🖊 준비물 노트와 펜 (영상은 끄셔도 무방합니다)

사전 질문 아직 보내지 않으신 분 계시면 아래로 한 줄만 적어주세요.
{{preQuestionUrl}}

내일 뵙겠습니다.

팁스타그램 드림`,
  },
  {
    label: "LIVE 당일 아침 · 리마인드",
    timing: "라이브 당일 · 오전 9시",
    body: `팁스타그램입니다.

오늘 저녁이 라이브 당일입니다.

1시간 전에 입장 링크를 다시 안내드리겠습니다.

오늘 가져가실 것 세 가지를 다시 한 번 정리해 드립니다.
1. 노출 알고리즘의 진짜 원리
2. 팔로워를 빠르게 늘리는 4단계 루틴
3. 팔로워를 매출로 바꾸는 세일즈 퍼널

저녁에 뵙겠습니다.

팁스타그램 드림`,
  },
  {
    label: "LIVE −1h · 입장 링크",
    timing: "라이브 당일 · 시작 1시간 전 (오후 7시)",
    body: `🔴 라이브가 한 시간 후에 시작됩니다.

▶ 입장 링크
{{zoomUrl}}

노트와 펜 준비해 주세요. 채팅으로 질문 자유롭게 받습니다.

팁스타그램`,
  },
  {
    label: "D+1 · 다시보기 + 강의 안내",
    timing: "라이브 다음날 · 오전 9시",
    body: `팁스타그램입니다.

어제 라이브에 함께해 주신 모든 분께 진심으로 감사드립니다.

📺 다시보기는 72시간만 열어둡니다.
{{zoomUrl}}

라이브에서 다룬 핵심 세 가지를 다시 정리해 드립니다.
1. 노출은 알고리즘이 아니라 콘텐츠 구조가 결정합니다.
2. 팔로워를 빠르게 늘리는 4단계 루틴.
3. 팔로워를 매출로 바꾸는 세일즈 퍼널 설계.

여기서 멈추지 않고 다음 단계를 함께 가고 싶으신 분께 강의 페이지를 안내드립니다.
{{salesUrl}}

팁스타그램 드림`,
  },
  {
    label: "마감 D-3 · 정원 한정",
    timing: "모집 마감 3일 전 · 오전 9시",
    body: `팁스타그램입니다.

이번 기수 모집 마감까지 3일 남았습니다.

이번 기수는 100명 한정으로 받고 있습니다. 진도 확인과 피드백을 직접 드리는 구조라 더 늘리기 어렵습니다.

다음 기수는 한 달 후이며, 그때부터 수강료가 인상됩니다.

망설이고 계시다면 남은 자리만 한 번 확인해 보세요. 결정은 그 다음에 하셔도 됩니다.
{{salesUrl}}

팁스타그램 드림`,
  },
  {
    label: "마감 D-1 · 24h 임박",
    timing: "모집 마감 1일 전 · 오전 9시",
    body: `팁스타그램입니다.

오늘 자정까지 모집을 받습니다.

이런 메시지는 자주 드리지 않습니다. 그럼에도 한 번 말씀드리는 이유는 한 가지입니다. 이번 기수를 놓치시면 한 달을 더 기다리셔야 하고, 그때는 수강료가 인상되어 있을 것이기 때문입니다.

한 달 뒤 같은 자리에서 다시 망설이는 자신을 마주하고 싶지 않으시다면, 오늘이 마지막입니다.

👉 신청 페이지
{{salesUrl}}

결정은 여러분의 것입니다. 응원하겠습니다.

팁스타그램 드림`,
  },
];

const cardHtml = MESSAGES.map((m, i) => `
  <div style="border:1px solid #EEE;border-radius:14px;padding:18px 20px;margin:14px 0;background:#FFF;">
    <div style="display:inline-block;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;letter-spacing:1px;">${i + 1} · ${m.label}</div>
    <p style="font-size:12px;color:#777;margin:8px 0 12px;">⏰ ${m.timing}</p>
    <pre style="background:#F7F7F7;border:1px solid #EEE;border-radius:10px;padding:14px 16px;margin:0;white-space:pre-wrap;word-break:break-word;font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;font-size:14px;line-height:1.75;color:#222;">${applyVars(m.body).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  </div>
`).join("");

const summary = campaign
  ? `<strong>${campaign.name}</strong> 캠페인의 실제 값으로 치환됨.<br/>라이브 일시 · ${VARS.webinarDate}`
  : `아직 캠페인이 없어 <strong>placeholder 값</strong>으로 채웠어요. 어드민에서 캠페인을 만든 뒤 편집 화면의 "미리보기 메일 받기" 버튼을 누르면 실제 URL·일시로 치환된 미리보기가 다시 옵니다.`;

const html = `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:680px;margin:0 auto;padding:32px 24px;color:#222;line-height:1.75;background:#FAFAFA;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:24px;"></div>
  <h1 style="font-size:24px;font-weight:900;margin:0 0 8px;">웨비나 캠페인 · 카톡방 메시지 12종 미리보기</h1>
  <p style="font-size:14px;color:#666;margin:0 0 20px;">진정성 톤으로 다시 다듬은 카톡방 메시지입니다. 각 시점에 카톡방에 그대로 복사·붙여넣기 하시면 됩니다.</p>

  <div style="background:#FFF8EB;border:1px solid #FCE6C2;border-radius:12px;padding:14px 16px;margin:0 0 20px;font-size:13px;color:#7c4a02;">
    ${summary}
  </div>

  <div style="background:#F0F8FF;border:1px solid #C7E0F4;border-radius:12px;padding:14px 16px;margin:0 0 24px;">
    <p style="font-size:13px;color:#1e4e8c;margin:0;">💡 <strong>사용법</strong>: 각 카드 회색 박스 안 텍스트를 길게 눌러 선택 → 전체 복사 → 오픈채팅방에 붙여넣기.</p>
  </div>

  ${cardHtml}

  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">팁스타그램 운영 가이드 · 본 메일은 운영자에게만 발송됩니다.</p>
</div>
`.trim();

const resend = new Resend(process.env.RESEND_API_KEY);
const { data, error } = await resend.emails.send({
  from: FROM,
  to: TO,
  subject: campaign
    ? `[미리보기] ${campaign.name} · 카톡 메시지 12종`
    : "[미리보기] 웨비나 캠페인 · 카톡 메시지 12종 (진정성 톤)",
  html,
});

if (error) {
  console.error("❌ 발송 실패:", error);
  process.exit(1);
}
console.log("✅ 발송 성공:", data?.id);
console.log("📧 받는 사람:", TO);
console.log("📨 12개 카톡 메시지 미리보기가 발송되었습니다.");
if (!campaign) {
  console.log("ℹ️  캠페인이 없어 placeholder 값으로 채웠어요. 어드민에서 캠페인 만든 뒤 다시 실행하시면 실제 값으로 치환됩니다.");
}

await prisma.$disconnect();
await pool.end();
