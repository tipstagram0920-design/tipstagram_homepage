/**
 * 자동화 메일 4종을 실제 템플릿 그대로 지정 주소로 미리보기 발송.
 * 본문 마크업은 src/app/api/ebook/_email.ts / live-signup/route.ts와 동일하게 유지.
 * 전자책/카톡방 URL 등은 DB Setting의 실제 값을 그대로 사용.
 *
 * 실행: node scripts/send-all-automation-emails.mjs
 */
import "dotenv/config";
import { Resend } from "resend";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const TO = "hogny1@naver.com";
const NAME = "홍길동(테스트)";
const FROM_ADDR = process.env.MAIL_FROM || "noreply@tipstagram.co.kr";
const SERVICE = "팁스타그램";
const COMPANY_EMAIL = "tipstagram0920@gmail.com";
const SITE_URL = "https://tipstagram-homepage.vercel.app";

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY 미설정");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const resend = new Resend(process.env.RESEND_API_KEY);

const getSetting = async (key) =>
  (await prisma.setting.findUnique({ where: { key } }))?.value ?? null;

const ebook1Url = await getSetting("ebook1_url");
const ebook2Url = await getSetting("ebook2_url");
const liveEbookUrl = await getSetting("live_ebook_url");
const chatUrl =
  (await getSetting("kakao_open_chat_url")) ||
  process.env.KAKAO_OPEN_CHAT_URL ||
  "https://open.kakao.com/o/EXAMPLE";

// ---------- 1) 1차 전자책 신청 완료 ----------
function ebookStep1Email(name) {
  const downloadButton = ebook1Url
    ? `<a href="${ebook1Url}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:#111;color:#fff;font-weight:800;text-decoration:none;font-size:15px;">📥 1차 전자책 다운로드</a>`
    : `<span style="display:inline-block;padding:14px 28px;border-radius:12px;background:#999;color:#fff;font-weight:800;font-size:15px;">전자책 준비 중 (곧 발송 예정)</span>`;
  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">${name} 님, 전자책 신청 완료 🎉</h1>
  <p style="font-size:15px;color:#444;margin:0 0 24px;">
    1차 전자책을 받으시고, 2차 전자책까지 무료로 받아가세요.<br/>
    아래 두 버튼이 있습니다.
  </p>
  <h3 style="font-size:14px;font-weight:800;color:#FD1D1D;margin:24px 0 8px;letter-spacing:2px;">STEP 1</h3>
  <p style="font-size:14px;color:#444;margin:0 0 14px;">
    아래에서 <strong>1차 전자책을 바로 다운로드</strong>받을 수 있습니다.
  </p>
  <p style="text-align:center;margin:18px 0;">${downloadButton}</p>
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0;"/>
  <h3 style="font-size:14px;font-weight:800;color:#FD1D1D;margin:0 0 8px;letter-spacing:2px;">STEP 2</h3>
  <p style="font-size:14px;color:#444;margin:0 0 14px;">
    간단한 인증을 거치면 <strong>2차 전자책</strong>까지 무료로 받으실 수 있습니다.<br/>
    아래 버튼을 눌러 인증 방법을 확인하세요.
  </p>
  <p style="text-align:center;margin:18px 0 32px;">
    <a href="${SITE_URL}/ebook/step2" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:15px;">
      🎁 2차 전자책 신청하기
    </a>
  </p>
  <hr style="border:none;border-top:1px solid #EEE;margin:24px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    본 메일은 ${SERVICE} 전자책 신청자에게 자동 발송됩니다.<br/>문의: ${COMPANY_EMAIL}
  </p>
</div>`.trim();
}

// ---------- 2) 1분 뒤 무료 라이브 초대 ----------
function ebookLivePromoEmail(name) {
  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:24px;"></div>
  <p style="display:inline-block;background:#FFF1F1;color:#FD1D1D;font-size:12px;font-weight:800;letter-spacing:1px;padding:6px 12px;border-radius:999px;margin:0 0 16px;">🔴 무료 LIVE · 선착순 초대장</p>
  <h1 style="font-size:24px;font-weight:900;line-height:1.32;margin:0 0 14px;">
    ${name} 님, 전자책으로<br/>
    첫 단추는 잘 끼우셨어요.<br/>
    이제 <span style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);-webkit-background-clip:text;background-clip:text;color:transparent;">진짜 결과</span>를 만들 차례예요.
  </h1>
  <p style="font-size:15px;color:#444;margin:0 0 8px;">
    전자책으로 큰 그림을 잡으셨다면, <strong>무료 라이브</strong>에선 그 내용을
    <strong>내 계정에 직접 적용하는 실전</strong>까지 보여드립니다.
  </p>
  <p style="font-size:15px;color:#444;margin:0 0 24px;">
    <strong>1년 만에 팔로워 0 → 12만</strong>, <strong>인스타 한 채널로 누적 6억</strong>을 만든
    전 과정을 숨김없이 공개합니다.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:separate;border-spacing:8px 0;">
    <tr>
      <td width="33%" style="background:#FAFAFA;border:1px solid #EEE;border-radius:14px;padding:16px 8px;text-align:center;">
        <div style="font-size:20px;font-weight:900;color:#111;">12만+</div>
        <div style="font-size:11px;color:#888;margin-top:2px;">팔로워 · 1년</div>
      </td>
      <td width="33%" style="background:#FAFAFA;border:1px solid #EEE;border-radius:14px;padding:16px 8px;text-align:center;">
        <div style="font-size:20px;font-weight:900;color:#111;">6억</div>
        <div style="font-size:11px;color:#888;margin-top:2px;">누적 수익</div>
      </td>
      <td width="33%" style="background:#FAFAFA;border:1px solid #EEE;border-radius:14px;padding:16px 8px;text-align:center;">
        <div style="font-size:20px;font-weight:900;color:#111;">0원</div>
        <div style="font-size:11px;color:#888;margin-top:2px;">참가비</div>
      </td>
    </tr>
  </table>
  <div style="border:1px solid #EEE;border-radius:14px;padding:18px 20px;margin:0 0 24px;">
    <p style="font-size:14px;font-weight:800;color:#111;margin:0 0 10px;">이런 분이라면 꼭 오세요 👇</p>
    <p style="font-size:14px;color:#444;margin:0 0 7px;">· 전자책은 읽었는데 <strong>막상 뭘 올려야 할지</strong> 막막한 분</p>
    <p style="font-size:14px;color:#444;margin:0 0 7px;">· 팔로워가 <strong>몇 달째 제자리</strong>라 답답한 분</p>
    <p style="font-size:14px;color:#444;margin:0 0 7px;">· <strong>광고비 없이</strong> 인스타로 수익을 만들고 싶은 분</p>
    <p style="font-size:14px;color:#444;margin:0;">· 직장·육아·본업과 <strong>병행</strong>하며 N잡을 키우고 싶은 분</p>
  </div>
  <p style="font-size:14px;font-weight:800;color:#111;margin:0 0 12px;">라이브에서 더 깊이 가져가실 것</p>
  <p style="font-size:14px;color:#444;margin:0 0 8px;">✅ <strong>노출 알고리즘</strong> — 왜 누구는 1만 명이 보고 누구는 30명이 볼까</p>
  <p style="font-size:14px;color:#444;margin:0 0 8px;">✅ <strong>광고 없이</strong> 평범한 계정이 12만까지 가는 콘텐츠 루틴</p>
  <p style="font-size:14px;color:#444;margin:0 0 8px;">✅ 팔로워를 <strong>매출로 바꾸는</strong> 세일즈 퍼널 설계</p>
  <p style="font-size:14px;color:#444;margin:0 0 24px;">✅ <strong>오늘 밤부터</strong> 바로 바꿀 수 있는 3가지 액션</p>
  <div style="background:#FFF8EB;border:1px solid #FCE6C2;border-radius:14px;padding:18px 20px;margin:0 0 28px;">
    <p style="font-size:12px;font-weight:800;color:#B45309;letter-spacing:1px;margin:0 0 10px;">🎁 라이브 참여자에게만 드리는 혜택</p>
    <p style="font-size:14px;color:#7c4a02;margin:0 0 7px;">① 비매품 <strong>‘수익화 핵심 10가지 Q&amp;A’ e-Book</strong> 무료 증정</p>
    <p style="font-size:14px;color:#7c4a02;margin:0 0 7px;">② <strong>실시간 Q&amp;A</strong> — 내 계정 고민을 직접 질문하고 답변받기</p>
    <p style="font-size:14px;color:#7c4a02;margin:0;">③ 라이브 당일 바로 쓰는 <strong>실전 적용 체크리스트</strong></p>
  </div>
  <p style="text-align:center;margin:0 0 12px;">
    <a href="${SITE_URL}/live" target="_blank" style="display:inline-block;padding:16px 34px;border-radius:14px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:900;text-decoration:none;font-size:16px;box-shadow:0 8px 20px rgba(253,29,29,0.25);">
      🎟️ 무료 라이브 자리 받기
    </a>
  </p>
  <p style="font-size:13px;color:#888;margin:0 0 8px;text-align:center;">
    신청 1분 · 즉시 입장 링크 발송 · 좌석 한정이라 조기 마감될 수 있어요.
  </p>
  <p style="font-size:12px;color:#aaa;margin:0;text-align:center;">
    버튼이 안 열리면 <a href="${SITE_URL}/live" style="color:#FD1D1D;word-break:break-all;">${SITE_URL}/live</a>
  </p>
  <hr style="border:none;border-top:1px solid #EEE;margin:28px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    본 메일은 ${SERVICE} 전자책 신청자에게 자동 발송됩니다.<br/>문의: ${COMPANY_EMAIL}
  </p>
</div>`.trim();
}

// ---------- 3) 2차 전자책 다운로드 ----------
function ebookStep2Email(name) {
  const downloadButton = ebook2Url
    ? `<a href="${ebook2Url}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:15px;">📥 2차 전자책 다운로드</a>`
    : `<span style="display:inline-block;padding:14px 28px;border-radius:12px;background:#999;color:#fff;font-weight:800;font-size:15px;">전자책 준비 중 (곧 발송 예정)</span>`;
  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">${name} 님, 인증 완료 🎉</h1>
  <p style="font-size:15px;color:#444;margin:0 0 24px;">
    2차 전자책 신청을 확인했습니다.<br/>아래에서 바로 다운로드받을 수 있습니다.
  </p>
  <p style="text-align:center;margin:28px 0;">${downloadButton}</p>
  <p style="font-size:14px;color:#666;margin:24px 0 0;line-height:1.7;">
    스토리에 올려주신 이미지가 많은 분들에게 도움이 됩니다.<br/>
    좋은 인사이트와 매출을 만드시길 응원합니다.
  </p>
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    본 메일은 ${SERVICE} 전자책 신청자에게 자동 발송됩니다.<br/>문의: ${COMPANY_EMAIL}
  </p>
</div>`.trim();
}

// ---------- 4) 라이브 신청 입장 안내 ----------
function liveSignupEmail(name) {
  const ebookBlock = liveEbookUrl
    ? `
  <div style="background:#FFF8EB;border:1px solid #FCE6C2;border-radius:14px;padding:18px 20px;margin:28px 0;">
    <p style="font-size:13px;font-weight:800;color:#B45309;letter-spacing:2px;margin:0 0 6px;">🎁 LIVE 참여자 전용 선물</p>
    <h2 style="font-size:17px;font-weight:800;color:#111;margin:0 0 6px;">인스타그램 수익화 10가지 핵심 Q&amp;A</h2>
    <p style="font-size:13px;color:#555;margin:0 0 14px;line-height:1.65;">라이브에서 다루는 내용을 미리 정리한 e-Book입니다. 비매품.</p>
    <p style="margin:0;">
      <a href="${liveEbookUrl}" target="_blank" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#111;color:#fff;font-weight:800;text-decoration:none;font-size:14px;">📥 10가지 질문 다운로드</a>
    </p>
  </div>`
    : "";
  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">${name} 님, 신청 완료되었습니다 🎉</h1>
  <p style="font-size:15px;color:#444;margin:0 0 24px;">
    팁스타그램 <strong>무료 라이브</strong> 대기방 입장 안내드립니다.<br/>
    아래 버튼을 눌러 오픈 채팅방에 들어와 주세요.
  </p>
  <p style="text-align:center;margin:28px 0;">
    <a href="${chatUrl}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:15px;">
      ▶ 무료 라이브 대기방 입장하기
    </a>
  </p>
  <p style="font-size:13px;color:#666;margin:0 0 8px;">
    버튼이 안 열리면 아래 주소를 복사해서 브라우저에 붙여넣어 주세요.<br/>
    <a href="${chatUrl}" style="color:#FD1D1D;word-break:break-all;">${chatUrl}</a>
  </p>
  ${ebookBlock}
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    본 메일은 ${SERVICE} 무료 라이브 신청자에게 자동 발송됩니다.<br/>문의: ${COMPANY_EMAIL}
  </p>
</div>`.trim();
}

const mails = [
  { subject: `[테스트1] [${SERVICE}] 전자책 신청 완료 — 1차 전자책 안내`, html: ebookStep1Email(NAME) },
  { subject: `[테스트2] [${SERVICE}] ${NAME}님, 무료 라이브에 초대합니다 🔴`, html: ebookLivePromoEmail(NAME) },
  { subject: `[테스트3] [${SERVICE}] 2차 전자책 다운로드 안내`, html: ebookStep2Email(NAME) },
  { subject: `[테스트4] [${SERVICE}] 무료 라이브 대기방 입장 안내`, html: liveSignupEmail(NAME) },
];

const start = Number(process.env.START || 0); // 0-based 시작 인덱스
const count = process.env.COUNT ? Number(process.env.COUNT) : undefined; // 보낼 개수
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const targets = mails.slice(start, count !== undefined ? start + count : undefined);
console.log(`발송: ${FROM_ADDR} → ${TO} (${targets.length}건)`);
for (const m of targets) {
  const r = await resend.emails.send({
    from: `${SERVICE} <${FROM_ADDR}>`,
    to: TO,
    subject: m.subject,
    html: m.html,
  });
  if (r.error) console.error("❌", m.subject, r.error);
  else console.log("✅", m.subject, "→", r.data?.id);
  await sleep(800); // Resend rate limit: 2 req/s
}

await prisma.$disconnect();
