/**
 * 특정 캠페인의 웨비나 메일 시퀀스 12통을 hogny1@naver.com 에 순차 발송.
 *
 * 사용: node scripts/send-webinar-email-preview.mjs <campaignId>
 *       campaignId 생략 시 가장 최근 캠페인.
 *
 * 카피는 src/lib/crm/webinar-preset.ts 와 동일. 유지보수 시 두 파일 함께 갱신.
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
let campaign;
if (campaignId) {
  campaign = await prisma.webinarCampaign.findUnique({ where: { id: campaignId } });
} else {
  campaign = await prisma.webinarCampaign.findFirst({ orderBy: { updatedAt: "desc" } });
}
if (!campaign) { console.error("캠페인 없음"); process.exit(1); }

const settings = Object.fromEntries((await prisma.setting.findMany()).map(s => [s.key, s.value]));

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
function diffDays(from, to) { return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)); }

const now = new Date();
const VARS = {
  "{{name}}": "호근",
  "{{email}}": TO,
  "{{daysToWebinar}}": String(diffDays(now, campaign.webinarDate)),
  "{{daysToEnd}}": campaign.endDate ? String(diffDays(now, campaign.endDate)) : "-",
  "{{webinarDate}}": formatKstDate(campaign.webinarDate),
  "{{endDate}}": campaign.endDate ? formatKstDate(campaign.endDate) : "-",
  "{{zoomUrl}}": campaign.zoomUrl || settings.webinar_zoom_url || "[Zoom URL 미설정]",
  "{{preQuestionUrl}}": campaign.preQuestionUrl || settings.webinar_pre_question_url || `${SITE}/webinar/ask/${campaign.id}`,
  "{{salesUrl}}": campaign.salesUrl || settings.external_checkout_url || `${SITE}/courses`,
  "{{consultationUrl}}": settings.consultation_url || `${SITE}/consultation`,
  "{{ebook1Url}}": settings.ebook1_url || settings.ebook_url || "[1차 전자책 URL 미설정]",
  "{{ebook2Url}}": settings.ebook2_url || "[2차 전자책 URL 미설정]",
  "{{kakaoChatUrl}}": campaign.kakaoChatUrl || settings.kakao_open_chat_url || "[오픈 카톡방 URL 미설정]",
  "{{replayUrl}}": campaign.replayUrl || campaign.zoomUrl || "[다시보기 URL 미설정]",
};

function substitute(s) {
  let out = s;
  for (const [k, v] of Object.entries(VARS)) out = out.replaceAll(k, v);
  return out;
}

const FOOTER = `
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    팁스타그램 · 본 메일은 무료 라이브 신청자에게 자동 발송됩니다.<br/>
    수신을 원하지 않으시면 <a href="${SITE}/unsubscribe" style="color:#999;">수신 거부</a>해 주세요.
  </p>`;
const LETTER = (inner) => `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;color:#222;line-height:1.85;font-size:15px;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:3px;border-radius:3px;margin-bottom:28px;"></div>
  ${inner}
  <p style="font-size:14px;color:#555;margin:28px 0 0;">— 팁스타그램 드림</p>
  ${FOOTER}
</div>`.trim();
const CARD = (inner) => `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.75;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  ${inner}
  ${FOOTER}
</div>`.trim();

const KAKAO_CTA = `
  <p style="text-align:center;margin:22px 0 4px;">
    <a href="{{kakaoChatUrl}}" target="_blank" style="display:inline-block;padding:13px 26px;border-radius:11px;background:#FEE500;color:#3C1E1E;font-weight:800;text-decoration:none;font-size:14px;">
      💬 무료 라이브 대기방 입장하기
    </a>
  </p>
  <p style="text-align:center;font-size:12px;color:#999;margin:0 0 4px;">
    라이브 전 안내는 모두 오픈 카톡방에서 드립니다.
  </p>`.trim();

const CONSULT_CTA = `
  <p style="text-align:center;margin:22px 0 4px;">
    <a href="{{consultationUrl}}" target="_blank" style="display:inline-block;padding:13px 26px;border-radius:11px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:14px;">
      🧑‍💻 1:1 진단 세션 신청하기
    </a>
  </p>`.trim();

const SECTION = `<div style="margin:22px 0;height:1px;background:#EEE;"></div>`;

const STEPS = [
  { label: "D-10 · 환영 · 대상자", subject: "{{name}}님, 만나서 반갑습니다 (라이브까지 D-{{daysToWebinar}})", body: LETTER(`
    <p>{{name}}님, 안녕하세요.</p>
    <p>이번 무료 라이브에 신청해 주셔서 감사드립니다. 팁스타그램입니다.</p>
    ${SECTION}
    <p style="font-weight:700;margin:0 0 6px;">📅 라이브 일정</p>
    <p style="margin:0 0 18px;"><strong>일시</strong> · {{webinarDate}}<br/><strong>장소</strong> · Zoom<br/><strong>참가비</strong> · 0원</p>
    ${SECTION}
    <p style="font-weight:700;margin:0 0 6px;">🎯 이런 분들께 잘 맞습니다</p>
    <ul style="padding-left:18px;margin:0 0 18px;color:#333;">
      <li>인스타를 시작했지만 팔로워가 좀처럼 늘지 않아 답답한 분</li>
      <li>콘텐츠를 열심히 올려도 왜 노출이 안 되는지 이유를 모르는 분</li>
      <li>광고비 한 푼 없이 인스타를 매출로 연결하고 싶은 분</li>
      <li>본업·육아·N잡을 병행하며 짧은 시간에 결과를 내야 하는 분</li>
      <li>인스타로 나만의 브랜드와 영향력을 만들고 싶은 분</li>
    </ul>
    ${SECTION}
    <p>앞으로 열흘 동안 짧은 메시지 몇 번 더 드릴 예정입니다. 라이브에서 더 잘 받아가실 수 있도록 준비하는 내용이에요.</p>
    <p>오늘은 워밍업으로 1차 전자책 한 권 두고 갑니다.</p>
    <p style="text-align:center;margin:24px 0;"><a href="{{ebook1Url}}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#111;color:#fff;font-weight:700;text-decoration:none;font-size:14px;">1차 전자책 받기 →</a></p>
    ${KAKAO_CTA}
  `) },
  { label: "D-7 · 라이브 후 변화 3가지", subject: "[D-{{daysToWebinar}}] 라이브 후에 여러분에게 생길 세 가지 변화", body: LETTER(`
    <p>{{name}}님, 오늘은 조금 다른 이야기를 해드릴게요.</p>
    <p>이번 라이브를 듣고 나면 뭐가 어떻게 달라질까요?</p>
    <p>인스타를 매일 붙잡고 씨름해 오신 분들이 라이브 후에 흔히 겪는 <strong>세 가지 변화</strong>를 미리 알려드립니다.</p>
    ${SECTION}
    <p style="font-weight:700;margin:0 0 4px;">첫째. 콘텐츠 만드는 시간이 절반으로 줄어듭니다.</p>
    <p style="margin:0 0 18px;">"오늘 뭘 올려야 하지" 하고 30분씩 고민하지 않게 됩니다. <strong>구조</strong>가 잡히면 소재는 저절로 흘러나옵니다.</p>
    <p style="font-weight:700;margin:0 0 4px;">둘째. 팔로워가 이전과 다른 속도로 늘어나기 시작합니다.</p>
    <p style="margin:0 0 18px;">알고리즘이 콘텐츠를 밀어주기 시작하면 며칠 사이에 눈에 띄게 달라집니다. 이 스위치를 켜는 방법을 라이브에서 그대로 보여드릴게요.</p>
    <p style="font-weight:700;margin:0 0 4px;">셋째. 인스타가 부담이 아니라 도구가 됩니다.</p>
    <p style="margin:0 0 18px;">"올려야 하는데…" 하는 압박이 사라지고, 인스타가 매출·연결·기회를 만드는 도구로 자리 잡습니다.</p>
    ${SECTION}
    <p>라이브에서 이 세 가지를 실제로 어떻게 만드는지 시간 순서대로 풀어드립니다.</p>
    ${KAKAO_CTA}
  `) },
  { label: "D-5 · 자유·시간·자동화", subject: "[D-{{daysToWebinar}}] 인스타 때문에 하루 종일 골머리 썩고 계신가요?", body: LETTER(`
    <p>{{name}}님, 오늘은 짧게 제 이야기 하나 두고 갑니다.</p>
    <p>제가 인스타로 얻은 건 팔로워나 매출 숫자 이상이었어요. 물론 <strong>1년에 6억</strong>이라는 수익도 감사한 일이지만, 진짜 컸던 건 다른 세 가지였습니다.</p>
    ${SECTION}
    <p style="font-weight:700;margin:0 0 4px;">첫째. 시간의 자유입니다.</p>
    <p style="margin:0 0 18px;">아웃소싱과 자동화를 통해 하루에 인스타에 쓰는 시간을 크게 줄였어요. <strong>인스타 시스템을 정확히 알아야</strong> 무엇을 맡기고 무엇을 자동화할지 결정할 수 있습니다. 그게 잡히면 나머지 시간은 온전히 내 것이 됩니다.</p>
    <p style="font-weight:700;margin:0 0 4px;">둘째. 원하는 사람을 만날 수 있게 됐어요.</p>
    <p style="margin:0 0 18px;">예전엔 상상도 못 하던 분들이 먼저 연락해오고, 함께 일하자고 제안을 해옵니다. 인스타 위에서 저를 알아보는 사람들이 자연스럽게 모이는 구조가 만들어지거든요.</p>
    <p style="font-weight:700;margin:0 0 4px;">셋째. 통장 잔고를 확인하며 마음 졸이던 시절이 없어졌어요.</p>
    <p style="margin:0 0 18px;">숫자보다 이 감정의 변화가 훨씬 컸습니다.</p>
    ${SECTION}
    <p>혹시 지금 인스타 때문에 <strong>하루 종일 골머리 썩고 계신가요?</strong><br/>콘텐츠 하나 올릴 때마다 반응이 안 나와서 답답하신가요?</p>
    <p>라이브에서 이 구조를 어떻게 만들었는지, 시간 순서대로 풀어드릴게요.</p>
    ${KAKAO_CTA}
  `) },
  { label: "D-4 · 페르소나 + 공감·권유", subject: "[D-{{daysToWebinar}}] \"저 같은 사람도 되나요?\"", body: LETTER(`
    <p>{{name}}님, 또 답장 하나가 마음에 남아서 적어요.</p>
    <blockquote style="border-left:3px solid #FD1D1D;padding:6px 14px;margin:14px 0;color:#555;font-style:italic;font-size:14px;">"저는 인플루언서도 아니고 그냥 평범한 직장인이에요. 저 같은 사람도 되나요?"</blockquote>
    <p>이 질문엔 사례로 답하는 게 가장 정확할 것 같아요. 짧게 몇 분만 소개할게요.</p>
    <ul style="padding-left:18px;margin:14px 0;color:#333;">
      <li><strong>육아 중인 워킹맘</strong> — 아이 재운 밤 11시~12시 한 시간만 써서 6개월에 1만 팔로워</li>
      <li><strong>지방 동네 네일샵 사장님</strong> — 게시물 하나로 한 달 매출 5배</li>
      <li><strong>현직 회계사</strong> — 본업 유지하면서 N잡 인스타 수익만 월 300</li>
      <li><strong>음악학원 원장님</strong> — 인스타로 학생 모집 줄이 끊긴 적 없음</li>
    </ul>
    <p>공통점 하나. 모두 처음엔 <strong>"저는 안 될 것 같은데…"</strong>로 시작하셨어요.</p>
    ${SECTION}
    <p>혹시 {{name}}님도 지금 같은 마음이신가요?</p>
    <p>"나는 특별할 것도 없는데.", "콘텐츠 감각도 없는데 이게 될까.", "이미 늦은 거 아닌가."</p>
    <p>그 마음을 정확히 이해합니다. 저도 그렇게 시작했으니까요.</p>
    <p>딱 한 가지만 부탁드릴게요. <strong>이번 라이브에는 꼭 들어와 주세요.</strong> "안 될 것 같다"고 시작하신 분들이 어떻게 결과를 만들어냈는지, 그 첫 번째 스텝이 무엇이었는지 하나하나 풀어드립니다.</p>
    <p>라이브가 끝날 때쯤이면 <strong>"혹시 나도?"</strong> 하는 마음이 생겨 있을 거예요. 그 마음이 바로 시작점입니다.</p>
    ${KAKAO_CTA}
  `) },
  { label: "D-3 · 다시보기 답변 3가지", subject: "[D-{{daysToWebinar}}] \"라이브 못 볼 것 같은데 다시보기 되나요?\"", body: LETTER(`
    <p>{{name}}님, "다시보기 되나요?"라는 질문을 많이 받아서 답해드릴게요.</p>
    <p>답변에 앞서 <strong>세 가지</strong>만 꼭 말씀드립니다.</p>
    ${SECTION}
    <p style="font-weight:700;margin:0 0 4px;">첫째. 라이브는 처음이 가장 중요합니다.</p>
    <p style="margin:0 0 18px;">초반 30분에 알고리즘·구조·실행 핵심을 다 담아둡니다. 뒤늦게 들어오시면 흐름을 놓치게 됩니다. 가능하면 <strong>시작 시간에 맞춰</strong> 들어와 주세요.</p>
    <p style="font-weight:700;margin:0 0 4px;">둘째. 끝까지 들으시면 특별한 혜택이 있습니다.</p>
    <p style="margin:0 0 18px;">참여자 한정으로 <strong>65만 원 상당의 실전 자료 세트</strong>를 무료로 드립니다. 다시보기로는 받으실 수 없는 자료이니, 가능하면 <strong>끝까지 함께해 주세요.</strong></p>
    <p style="font-weight:700;margin:0 0 4px;">셋째. 그래도 놓치신 분을 위한 안전장치.</p>
    <p style="margin:0 0 18px;">참여 신청하신 분께는 <strong>72시간 동안 다시보기 링크</strong>를 보내드립니다. 출근길에, 잠들기 전에 들으셔도 좋습니다.</p>
    ${SECTION}
    <p>정리하면 — 가능하면 시작 시간에 오시고, 끝까지 함께해 주세요. 그게 가장 많이 가져가시는 방법입니다.</p>
    ${KAKAO_CTA}
  `) },
  { label: "D-2 · 질문 짧은 답 + 진단 세션", subject: "[D-2] 가장 많이 받은 질문 3가지, 짧게 답해드릴게요", body: LETTER(`
    <p>{{name}}님, 라이브까지 48시간 남았어요.</p>
    <p>지금까지 받은 질문 중 가장 많은 세 가지에 짧게 답변드립니다. <strong>자세한 것은 라이브에서 직접</strong> 풀어드릴게요.</p>
    ${SECTION}
    <p style="font-weight:700;margin:0 0 4px;">1. "콘텐츠를 매일 올려야 하나요?"</p>
    <p style="margin:0 0 18px;">아니요. 매일 올리는 것보다 <strong>구조가 잡힌 콘텐츠 세 편</strong>이 훨씬 강합니다.</p>
    <p style="font-weight:700;margin:0 0 4px;">2. "릴스와 피드 중 뭘 먼저 해야 하나요?"</p>
    <p style="margin:0 0 18px;">현재 계정 상태에 따라 다릅니다. 팔로워 3천 이하라면 릴스, 3천 이상이라면 피드부터. 자세한 기준은 라이브에서.</p>
    <p style="font-weight:700;margin:0 0 4px;">3. "팔로워는 느는데 매출은 그대로예요."</p>
    <p style="margin:0 0 18px;">콘텐츠와 매출을 잇는 <strong>세일즈 퍼널</strong>이 빠져 있는 겁니다. 이걸 어떻게 설계하는지가 이번 라이브의 핵심 중 하나예요.</p>
    ${SECTION}
    <p>각자의 상황이 또 다르실 겁니다.</p>
    <p>본인 계정을 라이브 전에 <strong>미리 진단</strong>받고 싶으신 분은 아래에서 1:1 진단 세션을 신청해 주세요. 짧게 상황만 남겨주시면 라이브 전에 개별 답변드립니다. (소수 정원 · 선착순)</p>
    ${CONSULT_CTA}
  `) },
  { label: "D-1 · 내일 · 진단 세션", subject: "[D-1] 내일 뵙겠습니다 · 입장 안내", body: LETTER(`
    <p>{{name}}님, 드디어 내일이네요.</p>
    <p>입장 안내 짧게 정리해 드릴게요.</p>
    ${SECTION}
    <p style="font-weight:700;margin:0 0 6px;">📌 입장 안내</p>
    <p style="margin:0 0 18px;"><strong>일시</strong> · {{webinarDate}}<br/><strong>장소</strong> · Zoom (링크는 시작 1시간 전에 다시 안내드립니다)<br/><strong>준비물</strong> · 노트와 펜, 지금 운영 중인 인스타 계정</p>
    ${SECTION}
    <p>혹시 라이브 전에 본인 계정을 개별적으로 진단받고 싶으신 분 계시면, 오늘까지 <strong>1:1 진단 세션</strong>을 열어두었어요. 짧게 상황만 남겨주시면 라이브 전에 답변드릴 수 있습니다.</p>
    ${CONSULT_CTA}
    <p style="margin:22px 0 0;">내일 뵙겠습니다. 정말로 기대해 주셔도 좋습니다.</p>
  `) },
  { label: "LIVE −1h · 입장 링크", subject: "🔴 1시간 후 시작합니다 · 입장 링크", body: CARD(`
    <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">LIVE · 1H BEFORE</p>
    <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">{{name}}님, 1시간 후 시작합니다</h1>
    <p style="font-size:15px;color:#444;margin:0 0 20px;">Zoom 방은 시작 15분 전부터 열립니다. 오디오·화면 상태 미리 점검하시고 편하게 들어와 계셔도 좋습니다.</p>
    <p style="text-align:center;margin:24px 0;"><a href="{{zoomUrl}}" style="display:inline-block;padding:16px 32px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:16px;">▶ 라이브 입장하기</a></p>
    <p style="font-size:13px;color:#666;margin:24px 0 0;">버튼이 안 열리면: <a href="{{zoomUrl}}" style="color:#FD1D1D;word-break:break-all;">{{zoomUrl}}</a></p>
  `) },
  { label: "D+1 · 다시보기 + 강의", subject: "어제 와주셔서 고마워요 · 다시보기 72시간 한정", body: LETTER(`
    <p>{{name}}님, 어제 라이브에 함께해 주셔서 정말 고마웠어요.</p>
    <p>제가 처음 인스타를 시작했던 때를 떠올리면, 그때 누가 옆에서 라이브 한 번만 풀어줬어도 1년은 아꼈을 것 같아요. 어제 그 자리를 함께해 주신 거, 다시 한 번 감사합니다.</p>
    ${SECTION}
    <p>못 보신 분, 도중에 끊긴 분들 위해서 <strong>다시보기를 72시간만</strong> 열어둘게요.</p>
    <p style="text-align:center;margin:24px 0;"><a href="{{replayUrl}}" target="_blank" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#111;color:#fff;font-weight:700;text-decoration:none;font-size:14px;">📺 다시보기 열기 →</a></p>
    ${SECTION}
    <p>라이브에서 다룬 핵심 세 가지 다시 정리해 드릴게요.</p>
    <ol style="padding-left:18px;margin:14px 0;color:#333;">
      <li>노출은 알고리즘이 아니라 콘텐츠 <strong>구조</strong>가 정한다.</li>
      <li>팔로워를 빠르게 늘리는 <strong>4단계 루틴</strong>.</li>
      <li>팔로워 → 매출로 가는 <strong>세일즈 퍼널</strong>.</li>
    </ol>
    <p>여기서 멈추지 않고 다음 단계를 함께 가고 싶으신 분께 강의 페이지를 안내드립니다.</p>
    <p style="text-align:center;margin:22px 0 4px;"><a href="{{salesUrl}}" target="_blank" style="display:inline-block;padding:13px 26px;border-radius:11px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:14px;">🛒 강의 신청 페이지 보기</a></p>
  `) },
  { label: "마감 D-3 · 5자리 남음", subject: "[마감 D-{{daysToEnd}}] 이번 기수 5자리 남았어요", body: LETTER(`
    <p>{{name}}님, 짧은 안내 드릴게요.</p>
    <p>이번 기수는 매 기수 그래왔듯 <strong>20명 한정</strong>으로 받고 있어요. 제가 한 분 한 분 직접 진도 확인하고 피드백 드리는 구조라 더 늘리지 못해요.</p>
    <p style="font-size:17px;font-weight:800;color:#FD1D1D;margin:14px 0;">지금 5자리 남았습니다.</p>
    <p>3일 후에 이번 기수 모집을 닫습니다.</p>
    <p>아직 망설이고 계시다면, 남은 자리만 한 번 확인해 보세요. 결정은 그 다음에 하셔도 됩니다.</p>
    <p style="text-align:center;margin:24px 0;"><a href="{{salesUrl}}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:700;text-decoration:none;font-size:14px;">남은 자리 확인 →</a></p>
  `) },
  { label: "마감 D-1 · 변화 vs 정체", subject: "🔴 [마감 D-1] 한 달 뒤의 {{name}}님을 상상해 보세요", body: LETTER(`
    <p>{{name}}님, 솔직히 말씀드릴게요.</p>
    <p>마감을 앞두고 이런 메일 보내는 게 저도 부담스러워요. 그럼에도 한 번만 드리는 이유는 한 가지입니다.</p>
    ${SECTION}
    <p><strong>한 달 뒤를 상상해 보세요.</strong></p>
    <p>누군가는 이번 기수를 신청해서, 한 달 동안 하나씩 실행하면서 무언가가 달라지고 있을 겁니다. 콘텐츠에 반응이 오기 시작하거나, 팔로워가 눈에 띄게 늘거나, 처음으로 매출이 찍히거나.</p>
    <p>또 누군가는 아무 결정도 안 하고 그대로 있을 겁니다. 한 달 뒤에 인스타 화면을 열면 <strong>오늘과 똑같은 팔로워 수</strong>, 오늘과 똑같은 게시물이 그대로 있을 거예요.</p>
    <p style="font-size:16px;font-weight:700;margin:18px 0;">어느 쪽이 {{name}}님이 원하시는 한 달 뒤인가요?</p>
    ${SECTION}
    <p style="text-align:center;margin:24px 0;"><a href="{{salesUrl}}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#FD1D1D;color:#fff;font-weight:700;text-decoration:none;font-size:14px;">오늘 자정 전 신청 →</a></p>
    <p>결정은 {{name}}님의 것이에요. 응원합니다.</p>
  `) },
  { label: "마감 · 다음 기수 안내", subject: "이번 기수 마감 · 다음 기수 안내", body: LETTER(`
    <p>{{name}}님, 이번 기수 모집이 방금 마감되었어요.</p>
    <p>이번에 함께해 주신 모든 분께 감사드려요. 못 함께해서 아쉬운 분들도 계실 거예요. 솔직히 저도 아쉽습니다.</p>
    <p>다음 기수는 한 달 후에 열립니다. 열리는 대로 가장 먼저 안내받고 싶으신 분은 아래에서 대기 신청을 해두세요.</p>
    <p style="text-align:center;margin:24px 0;"><a href="${SITE}/live" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#111;color:#fff;font-weight:700;text-decoration:none;font-size:14px;">다음 기수 대기 신청 →</a></p>
    <p>그 동안 1차 전자책이라도 한 번 더 펼쳐보세요. 답이 꽤 많이 들어있어요.</p>
  `) },
];

const resend = new Resend(process.env.RESEND_API_KEY);
console.log(`캠페인: ${campaign.name}`);
console.log(`라이브 일시: ${VARS["{{webinarDate}}"]}`);
console.log(`→ ${TO} 로 ${STEPS.length}통 순차 발송 시작\n`);

let ok = 0, fail = 0;
for (let i = 0; i < STEPS.length; i++) {
  const s = STEPS[i];
  const subject = `[미리보기 ${i + 1}/${STEPS.length} · ${s.label}] ${substitute(s.subject)}`;
  const body = substitute(s.body);
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to: TO, subject, html: body });
    if (error) { console.log(`  ${i+1}. ❌ ${s.label} — ${error.message || JSON.stringify(error)}`); fail++; }
    else { console.log(`  ${i+1}. ✅ ${s.label} — ${data?.id}`); ok++; }
  } catch (e) { console.log(`  ${i+1}. ❌ ${s.label} — ${e.message}`); fail++; }
  await new Promise(r => setTimeout(r, 1200));
}

console.log(`\n총 ${STEPS.length}통 · 성공 ${ok} · 실패 ${fail}`);
await prisma.$disconnect(); await pool.end();
