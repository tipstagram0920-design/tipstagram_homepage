/**
 * 웨비나 캠페인 일정에 맞춘 카톡방 메시지 12종 운영 가이드를
 * hogny1@naver.com 으로 한 통 발송.
 *
 * 실행: node scripts/send-kakao-broadcast-preset.mjs
 *
 * Setting에서 ebook1Url / zoomUrl / preQuestionUrl 자동 치환.
 * webinarDate는 실제 캠페인 일정으로 직접 수정해서 사용.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { Resend } from "resend";

const TO = "hogny1@naver.com";
const FROM = "팁스타그램 <noreply@tipstagram.co.kr>";
const SUBJECT = "[운영 가이드] 웨비나 캠페인 카톡방 메시지 12종";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// Setting 일괄 로드
const settingRows = await prisma.setting.findMany();
const settings = Object.fromEntries(settingRows.map((s) => [s.key, s.value]));

const VARS = {
  webinarDate: "[라이브 날짜를 직접 채워주세요]",
  ebook1Url: settings.ebook1_url || settings.ebook_url || "[1차 전자책 URL 미설정]",
  preQuestionUrl: settings.webinar_pre_question_url || "[사전 질문 URL 미설정]",
  zoomUrl: settings.webinar_zoom_url || "[Zoom URL 미설정]",
};

function applyVars(body) {
  let s = body;
  for (const [k, v] of Object.entries(VARS)) {
    s = s.replaceAll(`{{${k}}}`, v);
  }
  return s;
}

const MESSAGES = [
  {
    label: "D-10",
    timing: "라이브 10일 전 · 아침 9시",
    body: `안녕하세요! 호근입니다 👋

이번 무료 라이브 신청해 주셔서 진심으로 감사해요.

📅 라이브 일정: {{webinarDate}}
📍 장소: Zoom (당일 1시간 전 링크 다시 보내드릴게요)
💰 참가비: 0원

라이브 직전까지 인스타 성장에 도움 되는 짧은 메시지들 하나씩 풀어드릴게요.

오늘은 워밍업으로 1차 전자책 한 권 두고 갈게요 👇
{{ebook1Url}}

기대해주세요!`,
  },
  {
    label: "D-7",
    timing: "라이브 7일 전 · 아침 9시",
    body: `"이거 진짜 무료 맞아요?" 라는 메시지를 받았어요 😅

확실히 말씀드릴게요.
✅ 결제 없음
✅ 카드 등록 없음
✅ 그냥 들으시면 끝

광고비 없이도 인스타로 결과 내는 법을 보여드리는 자리라, 자체가 광고비 0원이거든요.

라이브에서 1차 전자책의 인기 챕터 "왜 내 게시물은 30명만 보는가"를 풀어드릴게요.

D-7 ⏰`,
  },
  {
    label: "D-5",
    timing: "라이브 5일 전 · 아침 9시",
    body: `오늘은 짧게 제 이야기 하나 🙋‍♂️

저도 처음엔 팔로워 0이었어요. 첫 6개월 동안 200명 늘었어요. 한 달에 33명... 진짜 답답했어요.

그러다 우연히 한 가지를 바꿨더니, 한 달 만에 1만 명이 늘었어요.

바로 콘텐츠 "구조"를 바꿨거든요.

그 다음은 알고리즘이 일을 했고, 1년 만에 12만 팔로워가 됐어요.

라이브에서 그 변곡점을 시간 순서대로 다 풀어드릴게요.

D-5 📌`,
  },
  {
    label: "D-4",
    timing: "라이브 4일 전 · 아침 9시",
    body: `"저는 인플루언서도 아니고 그냥 평범한 직장인이에요. 저 같은 사람도 될까요?"

이 질문 정말 자주 받아요. 사례 몇 개만 적어볼게요 👇

🍼 워킹맘 — 아이 재운 밤 1시간만 써서 6개월 만에 1만 팔로워
💅 동네 네일샵 사장님 — 한 게시물로 매출 5배
📊 현직 회계사 — N잡으로 월 300
🎵 음악학원 원장님 — 학생 모집 줄이 안 끊김

공통점은 한 가지예요. 모두 "저는 안 될 것 같은데..."로 시작하셨어요.

D-4`,
  },
  {
    label: "D-3",
    timing: "라이브 3일 전 · 아침 9시",
    body: `"그날 바빠서 못 들어갈 것 같아요." 그러지 마세요 🙏

두 가지만 말씀드릴게요.

1️⃣ 라이브는 1시간 30분이지만, 30분만 들으셔도 핵심은 다 가져가실 수 있어요. 첫 30분에 다 담아둬요.

2️⃣ 참여자분들께만 72시간 동안 다시보기 링크를 보내드려요. 출근길에, 자기 전에 들으셔도 됩니다.

신청 취소하지 마시고 그냥 두세요. 그게 가장 안전한 선택이에요.

D-3 🎯`,
  },
  {
    label: "D-2",
    timing: "라이브 2일 전 · 아침 9시",
    body: `48시간 남았어요! ⏰

지금까지 받은 질문 중 가장 많은 셋이에요.
1. "콘텐츠 매일 올리는 게 정답인가요?"
2. "릴스 vs 피드, 뭐 먼저?"
3. "팔로워는 느는데 매출은 그대로예요"

라이브에서 다 답해드릴 거예요.

근데 여러분 본인 상황은 또 다르실 거잖아요?

👇 가장 궁금한 거 하나만 알려주세요
{{preQuestionUrl}}

라이브 중에 익명으로 직접 답해드릴게요!`,
  },
  {
    label: "D-1",
    timing: "라이브 1일 전 · 아침 9시",
    body: `드디어 내일이에요! 🎉

📌 일시: {{webinarDate}}
📌 장소: Zoom (당일 1시간 전 입장 링크 다시 보내드려요)
📌 준비물: 노트와 펜 (영상은 꺼도 OK)

아직 사전 질문 안 보내신 분 👇
{{preQuestionUrl}}

내일 만나요! 🙋‍♂️`,
  },
  {
    label: "LIVE 당일 아침",
    timing: "라이브 당일 · 오전 9시",
    body: `오늘 저녁이에요! ✨

오늘 라이브 잊지 마세요. 시작 1시간 전에 입장 링크 다시 보내드릴게요.

🎯 오늘 가져가실 것 세 가지
1. 노출 알고리즘의 진짜 원리
2. 팔로워가 빠르게 늘어나는 4단계 루틴
3. 팔로워 → 매출 전환 공식

저녁에 만나요! 🙏`,
  },
  {
    label: "LIVE −1h",
    timing: "라이브 당일 · 시작 1시간 전",
    body: `🔴 곧 시작합니다!

지금부터 1시간 후 라이브 시작이에요.

▶ 입장 링크
{{zoomUrl}}

노트와 펜 옆에 두세요. 채팅으로 질문 자유롭게 받습니다!`,
  },
  {
    label: "D+1",
    timing: "라이브 다음날 · 아침 9시",
    body: `어제 와주신 모든 분께 ✨ 진심으로 감사했어요.

채팅이 끝까지 살아 있어서 저도 신났어요. 사진처럼 남는 시간이었어요.

📺 다시보기는 72시간만 열어둘게요 👇
{{zoomUrl}}

핵심 3가지 다시 한 번 정리:
1. 노출은 알고리즘이 아니라 콘텐츠 구조
2. 팔로워 빠르게 늘리는 4단계 루틴
3. 매출로 가는 세일즈 퍼널

다음 단계 궁금하신 분, 강의 페이지도 열어두었어요.`,
  },
  {
    label: "마감 D-3",
    timing: "모집 마감 3일 전 · 아침 9시",
    body: `모집 마감까지 3일 남았어요 📌

이번 기수는 100명 한정이에요. 제가 직접 진도 확인하고 피드백 드리는 구조라 더 못 늘려요.

3일 후 모집 닫고, 다음 기수는 한 달 후. 그때부턴 수강료 인상돼요.

망설이고 계신 분, 남은 자리만 한 번 확인해 보세요.
👉 강의 페이지

결정은 그 다음에 하셔도 돼요.`,
  },
  {
    label: "마감 D-1",
    timing: "모집 마감 1일 전 · 아침 9시",
    body: `🔴 오늘 자정까지예요

이런 메시지 자주 드리지 않는데, 한 번만 말씀드릴게요.

이번 기수 놓치면 한 달 더 기다리셔야 하고, 그땐 가격이 올라가요.

한 달 후 똑같은 자리에서 망설이는 자신을 보고 싶지 않으시다면, 오늘이 마지막이에요.

👉 강의 페이지 (오늘 자정 마감)

결정은 여러분의 것이에요. 응원합니다 🙏`,
  },
];

const cardHtml = MESSAGES.map((m, i) => `
  <div style="border:1px solid #EEE;border-radius:14px;padding:18px 20px;margin:14px 0;background:#FFF;">
    <div style="display:inline-block;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;letter-spacing:1px;">${i + 1} · ${m.label}</div>
    <p style="font-size:12px;color:#777;margin:8px 0 12px;">⏰ ${m.timing}</p>
    <pre style="background:#F7F7F7;border:1px solid #EEE;border-radius:10px;padding:14px 16px;margin:0;white-space:pre-wrap;word-break:break-word;font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;font-size:14px;line-height:1.7;color:#222;">${applyVars(m.body).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  </div>
`).join("");

const html = `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:680px;margin:0 auto;padding:32px 24px;color:#222;line-height:1.75;background:#FAFAFA;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:24px;"></div>
  <h1 style="font-size:24px;font-weight:900;margin:0 0 8px;">웨비나 캠페인 · 카톡방 메시지 12종</h1>
  <p style="font-size:14px;color:#666;margin:0 0 24px;">각 시점에 맞춰 카톡방에 그대로 복사·붙여넣기 하실 메시지예요. 메일과 같은 흐름이지만 카톡 톤(짧게·이모지·줄바꿈)으로 다듬어 두었어요.</p>

  <div style="background:#FFF8EB;border:1px solid #FCE6C2;border-radius:12px;padding:14px 16px;margin:0 0 20px;">
    <p style="font-size:12px;font-weight:800;color:#B45309;margin:0 0 8px;letter-spacing:1px;">📌 현재 자동 치환된 값</p>
    <p style="font-size:13px;color:#7c4a02;margin:0 0 4px;"><strong>라이브 날짜</strong>: ${VARS.webinarDate}</p>
    <p style="font-size:13px;color:#7c4a02;margin:0 0 4px;"><strong>1차 전자책 URL</strong>: ${VARS.ebook1Url}</p>
    <p style="font-size:13px;color:#7c4a02;margin:0 0 4px;"><strong>사전 질문 URL</strong>: ${VARS.preQuestionUrl}</p>
    <p style="font-size:13px;color:#7c4a02;margin:0;"><strong>Zoom URL</strong>: ${VARS.zoomUrl}</p>
    <p style="font-size:12px;color:#9a6b1f;margin:10px 0 0;">⚠ "[…미설정]"으로 나오는 값은 어드민 <code>/admin/live-settings</code>에서 설정 후 다시 보내시면 자동으로 채워져요.</p>
  </div>

  <div style="background:#F0F8FF;border:1px solid #C7E0F4;border-radius:12px;padding:14px 16px;margin:0 0 24px;">
    <p style="font-size:13px;color:#1e4e8c;margin:0;">💡 <strong>사용법</strong>: 각 메시지 회색 박스 안의 텍스트를 길게 눌러 선택 → 전체 복사 → 오픈채팅방에 붙여넣기. 라이브 날짜만 ${VARS.webinarDate.includes("채워") ? "직접 수정 후 " : ""}올리시면 됩니다.</p>
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
  subject: SUBJECT,
  html,
});

if (error) {
  console.error("❌ 발송 실패:", error);
  process.exit(1);
}
console.log("✅ 발송 성공:", data?.id);
console.log("📧 받는 사람:", TO);
console.log("📨 12개 카톡방 메시지 운영 가이드가 발송되었습니다.");

await prisma.$disconnect();
await pool.end();
