// 상세페이지를 17-Step Selling System 순서에 맞게 보강한다.
//
// 원칙: **없는 사실을 만들지 않는다.**
//   - 새 수치·후기·보장 조건을 지어내지 않고, 페이지에 이미 쓰여 있는 사실만 재배치·강조한다.
//   - 가치 합계도 페이지에 명시된 금액(정가 325만 + 부스터 99만)만 더한다.
//
// 하는 일: 기존 HTML 을 살려두고 빠진 단계만 끼워 넣는다 (디자인 클래스 재사용).
//   01 오디언스 호출     → 히어로 최상단 한 줄
//   04 흥미 유발 6불릿    → 히어로 직후 신규 섹션
//   12 가치 스택 합계     → 보너스 섹션 뒤 신규 섹션 (+CTA)
//   15 보장(리스크 리버설) → 가격 섹션 뒤 신규 섹션
//   16 CTA 반복          → 가치 스택·클로징에 추가
//   17 추신(P.S.)        → 맨 끝 신규 섹션
//
// 실행:
//   node scripts/apply-17step-detail.mjs           # 미리보기만 (파일로 저장, DB 미반영)
//   node scripts/apply-17step-detail.mjs --write   # DB 반영
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "node:fs";

const env = fs.readFileSync(".env", "utf8");
for (const l of env.split("\n")) {
  const m = l.match(/^([A-Z_0-9]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const WRITE = process.argv.includes("--write");
const CTA_HREF = "#apply";

/** 공통 CTA 버튼 (기존 디자인 톤 유지) */
const cta = (label, sub) => `
  <div style="margin-top:34px;text-align:center">
    <a href="${CTA_HREF}" style="display:inline-block;background:#FF3B30;color:#fff;font-weight:900;font-size:22px;letter-spacing:-0.5px;padding:20px 46px;border-radius:14px;text-decoration:none;box-shadow:0 4px 0 rgba(0,0,0,0.25)">${label}</a>
    ${sub ? `<div class="small gray" style="margin-top:12px">${sub}</div>` : ""}
  </div>`;

// ── 01. 오디언스 호출 — 히어로 맨 위 (누구를 위한 글인지 먼저 말한다) ──
const AUDIENCE_LINE = `<div class="small" style="color:#FFD54A;font-weight:900;letter-spacing:1px;margin-bottom:14px">인스타로 물건·서비스를 팔고 싶은데, 팔로워만 늘고 문의는 안 오는 분께</div>
  `;

// ── 04. 흥미 유발 6불릿 — 히어로 직후 ──
// 전부 페이지 뒷부분에 이미 나오는 내용을 앞으로 당겨 미끼로 쓴다.
const FASCINATION = `
<div class="sec soft pad">
  <div class="tape straight">이 5주 동안 알게 되는 것</div>
  <div style="margin-top:34px">
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">팔로워 5천인데 문의가 한 건도 안 오는 계정의 <span class="hl">진짜 원인</span> — 콘텐츠가 아니라 1주차에 잡는 그것</div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">조회수만 터지고 안 팔리는 릴스와, <span class="hl">조회수는 낮아도 팔리는 릴스</span>의 차이</div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">피부과·부케 말리기·피아노 학원·무당까지 됐던 이유 — <span class="hl">업종이 문제였던 적은 없습니다</span></div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">하루 종일 인스타에 매달리지 않고 <span class="hl">주 4시간</span>으로 굴리는 운영 구조</div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">혼자 하면 6개월 걸릴 일을 5주로 줄이는, <span class="hl">순서</span> 자체</div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">3주차에 제가 직접 여러분 계정을 열어보고 <span class="hl">20분 동안 뜯어드립니다</span></div></div>
  </div>
</div>
`;

// ── 12. 가치 스택 — 보너스 뒤 (합계는 페이지에 이미 적힌 금액만 사용) ──
const VALUE_STACK = `
<div class="sec pad">
  <div class="h2">받는 것을 다 합치면</div>
  <div class="body-s gray" style="margin-top:10px">따로 사면 얼마인지, 숨기지 않고 적었습니다.</div>

  <div class="resbar" style="margin-top:34px">
    <div class="res"><div class="who">5주 챌린지 본 과정 (오프라인 1:1 포함)</div><div class="num">325만원</div></div>
    <div class="statdiv" style="margin:0"></div>
    <div class="res"><div class="who">지식사업 부스터 66강 평생 이용권</div><div class="num">99만원</div></div>
    <div class="statdiv" style="margin:0"></div>
    <div class="res"><div class="who">릴스파이 프로 1개월</div><div class="num">유료 툴</div></div>
    <div class="statdiv" style="margin:0"></div>
    <div class="res"><div class="who">수강생 전용 커뮤니티 · 상시 Q&amp;A</div><div class="num">비매품</div></div>
    <div class="statdiv" style="margin:0"></div>
    <div class="res"><div class="who">인스타 정책 변경 시 자료 평생 업데이트</div><div class="num">비매품</div></div>
    <div class="statdiv" style="margin:0"></div>
    <div class="res"><div class="who">중도 포기 시 다음 기수 재참여권</div><div class="num">안전망</div></div>
  </div>

  <div style="margin-top:26px;text-align:center">
    <div class="body-s gray">금액이 매겨진 것만 더해도</div>
    <div class="h2" style="margin-top:6px">424만원</div>
    <div class="body-t" style="margin-top:18px">웨비나 참석자는 <span class="hl">195만원</span></div>
    <div class="small gray" style="margin-top:10px">기초 강의 하나(99만원)만 따져도 참가비의 절반이 되돌아옵니다.</div>
  </div>
  ${cta("10명 안에 들어가기", "정원이 차면 이 가격은 닫힙니다.")}
</div>
`;

// ── 15. 보장 — 가격 섹션 뒤 (있는 조건만. 과장 금지) ──
const GUARANTEE = `
<div class="sec cream pad">
  <div class="stamp">약 속</div>
  <div class="h2" style="margin-top:26px">따라오다 멈춰도,<br/>여기서 끝나지 않습니다.</div>
  <div class="body-t" style="margin-top:22px">
    5주 안에 사정이 생겨 못 따라오셔도, <span class="hl">다음 기수에 다시 참여하실 수 있습니다.</span>
    추가 비용은 없습니다.
  </div>
  <div class="body-s gray" style="margin-top:16px">
    수료 후에도 커뮤니티와 자료 업데이트는 계속 열려 있습니다. 인스타 정책이 바뀌면 그때마다 자료를 다시 드립니다.
  </div>
</div>
`;

// ── 17. 추신 — 맨 끝 (편지에서 세 번째로 많이 읽히는 자리) ──
const PS = `
<div class="sec pad" style="padding-top:56px;padding-bottom:80px">
  <div class="h3">추신.</div>
  <div class="body-t" style="margin-top:18px">
    이 기수는 <span class="hl">10명</span>입니다. 제가 3주차에 한 분당 20분씩 직접 만나야 해서, 늘리고 싶어도 못 늘립니다.
  </div>
  <div class="body-t" style="margin-top:16px">
    정원이 차면 웨비나 참석자 할인가 <b>195만원</b>은 닫히고, 다음 기수는 정가 325만원으로 다시 엽니다.
  </div>
  <div class="body-t" style="margin-top:16px">
    지금 고민하시는 게 <b>&ldquo;내가 끝까지 할 수 있을까&rdquo;</b>라면 — 그건 제 일입니다. 못 따라오시면 다음 기수에 다시 오시면 됩니다.
    <span class="hl">잃을 게 없는 쪽으로 만들어뒀습니다.</span>
  </div>
  ${cta("지금 신청하기", "남은 자리를 확인하고 신청 페이지로 이동합니다.")}
</div>
`;

/** 5주 챌린지 상세 HTML 보강 */
function upgradeChallenge(html) {
  let out = html;

  // 01 — 히어로 첫 요소 앞에 오디언스 호출
  const heroTag = '<div class="sec dark hero">';
  if (!out.includes("팔로워만 늘고 문의는 안 오는")) {
    out = out.replace(heroTag, heroTag + "\n  " + AUDIENCE_LINE);
  }

  // 04 — 히어로 섹션이 끝나고 다음 섹션 시작 지점에 삽입
  const afterHero = out.indexOf('<div class="sec pad">');
  if (afterHero > 0 && !out.includes("이 5주 동안 알게 되는 것")) {
    out = out.slice(0, afterHero) + FASCINATION + "\n" + out.slice(afterHero);
  }

  // 12 — 보너스(cream) 섹션 뒤, 가격(#apply) 섹션 앞
  const applyIdx = out.indexOf('<div class="sec dark pad" id="apply">');
  if (applyIdx > 0 && !out.includes("받는 것을 다 합치면")) {
    out = out.slice(0, applyIdx) + VALUE_STACK + "\n" + out.slice(applyIdx);
  }

  // 15 — 가격 섹션 바로 뒤(= FAQ 앞)
  const faqIdx = out.indexOf("자주 묻는 질문");
  if (faqIdx > 0 && !out.includes('<div class="stamp">약 속</div>')) {
    const secStart = out.lastIndexOf('<div class="sec', faqIdx);
    out = out.slice(0, secStart) + GUARANTEE + "\n" + out.slice(secStart);
  }

  // 17 — 마지막 섹션 뒤(문서 끝 컨테이너 닫기 직전)
  if (!out.includes("추신.")) {
    const tail = out.lastIndexOf("</div>\n</body>");
    out = tail > 0 ? out.slice(0, tail) + PS + "\n" + out.slice(tail) : out + PS;
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════
//  마케팅 부스터 (66강) — 챌린지보다 결함이 크다.
//  가격·CTA·강사 실적·문제 제기가 통째로 없어서 그 자리부터 채운다.
//  강사 실적 수치는 같은 강사의 챌린지 페이지에 이미 공개된 값만 가져온다.
// ═══════════════════════════════════════════════════════════════

const B_AUDIENCE = `<div class="small" style="color:#FFD54A;font-weight:900;letter-spacing:1px;margin-bottom:14px">인스타를 처음 시작하거나, 다시 제대로 세팅하고 싶은 분께</div>
  `;

// 05 문제 자극 — 페이지에 이미 등장하는 문장을 앞으로 끌어와 통증으로 만든다
const B_PROBLEM = `
<div class="sec soft pad">
  <div class="h2">혼자 하면, 늘 여기서 막힙니다</div>
  <div style="margin-top:30px">
    <div class="chk"><div class="box"><span>1</span></div><div class="txt">올리긴 올리는데 <span class="hl">30명만 봅니다.</span> 왜 안 퍼지는지 아무도 안 알려줍니다.</div></div>
    <div class="chk"><div class="box"><span>2</span></div><div class="txt">매번 <span class="hl">&ldquo;오늘 뭘 올리지&rdquo;</span>부터 막힙니다. 소재가 떨어지면 그대로 멈춥니다.</div></div>
    <div class="chk"><div class="box"><span>3</span></div><div class="txt">편집이 오래 걸려서 한 편 만들고 지칩니다.</div></div>
    <div class="chk"><div class="box"><span>4</span></div><div class="txt">팔로워는 조금 늘었는데 <span class="hl">매출로는 안 이어집니다.</span></div></div>
  </div>
  <div class="body-t" style="margin-top:26px">
    유튜브에 조각 정보는 넘칩니다. 문제는 <b>순서</b>입니다. 어디부터 손대야 하는지 모르니 매번 제자리로 돌아옵니다.
  </div>
</div>
`;

// 04 흥미 유발 6불릿 — 전부 실제 커리큘럼 챕터에서 뽑았다
const B_FASCINATION = `
<div class="sec pad">
  <div class="tape straight">66강 안에서 풀리는 것</div>
  <div style="margin-top:32px">
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">&ldquo;왜 내 게시물은 30명만 볼까&rdquo; — <span class="hl">노출 신호</span>를 데이터로 확인합니다</div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">방문자의 절반이 팔로우를 결정하는 <span class="hl">프로필 3줄 공식</span> (전문성·가치·변화)</div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">소재 고갈에서 벗어나는 <span class="hl">소재 100개 뽑는 5가지 프레임</span></div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt"><span class="hl">얼굴 없이 찍는 릴스 10가지</span>와 3초 후킹 6가지 패턴</div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">해시태그 신화와 실제 데이터, 그리고 <span class="hl">섀도우밴 진단법</span></div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">팔로워를 고객으로 바꾸는 <span class="hl">DM 세일즈 스크립트 5종</span></div></div>
  </div>
</div>
`;

// 07 자격 증명 — 챌린지 페이지에 공개된 강사 실적을 그대로 사용
const B_CREDENTIALS = `
<div class="sec dark pad">
  <div class="h2">누가 만든 강의인가</div>
  <div class="body-t lgray" style="margin-top:14px">이론이 아니라, 직접 굴려서 나온 숫자로 만들었습니다.</div>
  <div class="statbox">
    <div class="statrow"><div class="k">팔로워 · 연 수익</div><div class="v">20만 · 6억+</div></div>
    <div class="statdiv"></div>
    <div class="statrow"><div class="k">1:1 컨설팅 · 챌린지 누적</div><div class="v">500명 · 1,000명+</div></div>
    <div class="statdiv"></div>
    <div class="statrow"><div class="k">기업 마케팅</div><div class="v">50개+</div></div>
    <div class="statdiv"></div>
    <div class="statrow"><div class="k">수강생 최고 기록</div><div class="v">월매출 30억</div></div>
  </div>
</div>
`;

// 12·13·16 — 가격과 CTA 가 페이지에 아예 없었다. 오퍼 섹션을 만든다.
const B_OFFER = (priceLabel) => `
<div class="sec cream pad" id="apply">
  <div class="h2">받는 것</div>
  <div class="resbar" style="margin-top:30px">
    <div class="res"><div class="who">인스타그램 실전 강의 66강 (7섹션)</div><div class="num">평생 소장</div></div>
    <div class="statdiv" style="margin:0"></div>
    <div class="res"><div class="who">인스타 정책·기능 변경 시 챕터 업데이트</div><div class="num">계속 무료</div></div>
    <div class="statdiv" style="margin:0"></div>
    <div class="res"><div class="who">모바일 · PC 어디서든, 기기 제한 없음</div><div class="num">포함</div></div>
    <div class="statdiv" style="margin:0"></div>
    <div class="res"><div class="who">필요한 챕터만 골라 반복 시청</div><div class="num">횟수 무제한</div></div>
  </div>
  <div style="margin-top:30px;text-align:center">
    <div class="h2">${priceLabel}</div>
    <div class="small gray" style="margin-top:10px">기수·시간표 없이 결제 즉시 66강 전체가 열립니다.</div>
  </div>
  ${cta("지금 시작하기", "아래 결제 바에서 바로 결제하실 수 있습니다.")}
</div>
`;

// 17 추신
const B_PS = `
<div class="sec pad" style="padding-top:56px;padding-bottom:80px">
  <div class="h3">추신.</div>
  <div class="body-t" style="margin-top:18px">
    이 강의는 <b>평생 소장</b>입니다. 오늘 다 못 봐도 됩니다. 필요한 챕터를 필요할 때 꺼내 보시면 됩니다.
  </div>
  <div class="body-t" style="margin-top:16px">
    인스타 정책이 바뀌면 해당 챕터를 <span class="hl">계속 업데이트</span>해서 다시 열어드립니다. 한 번 사두면 계속 최신 상태로 남습니다.
  </div>
  <div class="body-t" style="margin-top:16px">
    나중에 5주 챌린지에 오실 생각이라면 — <b>이 강의를 먼저 보고 온 분들이 가장 빠르게 성장했습니다.</b> 순서를 그렇게 잡으시는 걸 권합니다.
  </div>
  ${cta("66강 시작하기", "")}
</div>
`;

function upgradeBooster(html, priceLabel) {
  let out = html;

  const heroTag = '<div class="sec dark hero">';
  if (!out.includes("다시 제대로 세팅하고 싶은 분께")) {
    out = out.replace(heroTag, heroTag + "\n  " + B_AUDIENCE);
  }

  // 히어로 다음(= "이 강의가 맞는 분" 앞)에 문제 자극 → 흥미 불릿 순서로 삽입
  const firstPad = out.indexOf('<div class="sec pad">');
  if (firstPad > 0 && !out.includes("혼자 하면, 늘 여기서 막힙니다")) {
    out = out.slice(0, firstPad) + B_PROBLEM + B_FASCINATION + "\n" + out.slice(firstPad);
  }

  // 커리큘럼 앞에 강사 실적
  const curr = out.indexOf("CURRICULUM");
  if (curr > 0 && !out.includes("누가 만든 강의인가")) {
    const secStart = out.lastIndexOf('<div class="sec', curr);
    out = out.slice(0, secStart) + B_CREDENTIALS + "\n" + out.slice(secStart);
  }

  // FAQ 앞에 오퍼 + 가격 + CTA
  const faq = out.indexOf("자주 묻는 질문");
  if (faq > 0 && !out.includes('id="apply"')) {
    const secStart = out.lastIndexOf('<div class="sec', faq);
    out = out.slice(0, secStart) + B_OFFER(priceLabel) + "\n" + out.slice(secStart);
  }

  // 맨 끝 추신
  if (!out.includes("추신.")) {
    const tail = out.lastIndexOf("</div>\n</body>");
    out = tail > 0 ? out.slice(0, tail) + B_PS + "\n" + out.slice(tail) : out + B_PS;
  }
  return out;
}

const targets = ["5-week-challenge", "5-week-challenge-plus-consulting"];

const before = await prisma.product.findUnique({
  where: { slug: "5-week-challenge" },
  select: { descriptionDesign: true },
});
if (!before?.descriptionDesign) {
  console.error("5-week-challenge 상세 HTML 이 없습니다.");
  process.exit(1);
}

const after = upgradeChallenge(before.descriptionDesign);
fs.mkdirSync("scripts/assets", { recursive: true });
fs.writeFileSync("scripts/assets/challenge-detail-17step.html", after);

console.log(`원본 ${before.descriptionDesign.length}자 → 보강 ${after.length}자 (+${after.length - before.descriptionDesign.length})`);
console.log("미리보기 파일: scripts/assets/challenge-detail-17step.html");
const added = ["팔로워만 늘고 문의는 안 오는", "이 5주 동안 알게 되는 것", "받는 것을 다 합치면", "한 번 잡은 멱살", "추신."];
for (const a of added) console.log(`  ${after.includes(a) ? "✔" : "✘"} ${a}`);

// ── 마케팅 부스터 ──
const booster = await prisma.product.findUnique({
  where: { slug: "marketing-booster" },
  select: { id: true, price: true, descriptionDesign: true },
});
let boosterAfter = null;
if (booster?.descriptionDesign) {
  const priceLabel = `${(booster.price / 10000).toLocaleString("ko-KR")}만원`;
  boosterAfter = upgradeBooster(booster.descriptionDesign, priceLabel);
  fs.writeFileSync("scripts/assets/booster-detail-17step.html", boosterAfter);
  console.log(
    `\n[부스터] 원본 ${booster.descriptionDesign.length}자 → 보강 ${boosterAfter.length}자 (+${boosterAfter.length - booster.descriptionDesign.length}) · 가격표기 ${priceLabel}`
  );
  for (const a of ["다시 제대로 세팅하고 싶은 분께", "혼자 하면, 늘 여기서 막힙니다", "66강 안에서 풀리는 것", "누가 만든 강의인가", 'id="apply"', "추신."]) {
    console.log(`  ${boosterAfter.includes(a) ? "✔" : "✘"} ${a}`);
  }
}

if (!WRITE) {
  console.log("\n(미리보기만 했습니다. DB 반영하려면 --write)");
} else {
  for (const slug of targets) {
    const p = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!p) { console.log(`  건너뜀 — ${slug} 없음`); continue; }
    await prisma.product.update({ where: { id: p.id }, data: { descriptionDesign: after } });
    console.log(`  ✔ ${slug} 반영`);
  }
  if (booster && boosterAfter) {
    await prisma.product.update({ where: { id: booster.id }, data: { descriptionDesign: boosterAfter } });
    console.log("  ✔ marketing-booster 반영");
  }
}
await prisma.$disconnect();
