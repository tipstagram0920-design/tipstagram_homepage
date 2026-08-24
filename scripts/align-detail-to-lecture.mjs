// 상세페이지를 무료 강의 대본(tipsta_free_lecture_sales_script)의 연장선으로 맞춘다.
//
// 대본의 핵심 프레임이 상세페이지에 전혀 없어서 강의 → 페이지 사이 서사가 끊겨 있었다.
//   · 인스타 계정 = "사람을 모으는 온라인 건물"      → 페이지엔 "돈 버는 시스템"
//   · 간판 → 미로 → 세일즈 계단 (건물 구조)          → 없음
//   · "팔로워를 모으지 마세요. 미래의 고객을 모으세요" → 없음
//   · 상품이 없어도 된다 (남의 상품·영향력·능력)      → 없음 (업종 사례만 있어 무상품 이탈)
//   · 가격 비교 대상 = 영상 개수가 아니라 시간·능력    → 할인 프레임만 있음
//   · "6개월은 어차피 지나갑니다" 두 갈래 미래         → 없음
//
// 5주 로드맵은 대본(1 프로필·상품 / 2 릴스 / 3 1:1 / 4 AI / 5 수익화)과 이미 일치해 건드리지 않는다.
//
// 실행: node scripts/align-detail-to-lecture.mjs [--write]
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

const cta = (label, sub) => `
  <div style="margin-top:34px;text-align:center">
    <a href="#apply" style="display:inline-block;background:#FF3B30;color:#fff;font-weight:900;font-size:22px;letter-spacing:-0.5px;padding:20px 46px;border-radius:14px;text-decoration:none;box-shadow:0 4px 0 rgba(0,0,0,0.25)">${label}</a>
    ${sub ? `<div class="small gray" style="margin-top:12px">${sub}</div>` : ""}
  </div>`;

// ── 히어로: 오디언스·약속을 대본 언어로 교체 ──
// 대본은 "상품이 있든 없든"을 명시한다. 기존 문구는 상품 있는 사람만 부르고 있었다.
const OLD_AUDIENCE =
  '<div class="small" style="color:#FFD54A;font-weight:900;letter-spacing:1px;margin-bottom:14px">인스타로 물건·서비스를 팔고 싶은데, 팔로워만 늘고 문의는 안 오는 분께</div>';
const NEW_AUDIENCE =
  '<div class="small" style="color:#FFD54A;font-weight:900;letter-spacing:1px;margin-bottom:14px">팔 상품이 있든 없든, 인스타를 돈과 기회로 연결하고 싶은 분께</div>';

const OLD_PROMISE =
  '<div class="body-t lgray mt32">20만 팔로워 팁스타그램이 5주 동안<br>당신의 인스타를 <b style="color:#fff">"구경거리"</b>에서<br><b style="color:#fff">"돈 버는 시스템"</b>으로 바꿔놓습니다.</div>';
const NEW_PROMISE =
  '<div class="body-t lgray mt32">20만 팔로워 팁스타그램이 5주 동안<br>당신의 인스타를 <b style="color:#fff">"구경거리"</b>에서<br><b style="color:#fff">"사람을 모으는 온라인 건물"</b>로 바꿔놓습니다.</div>\n  <div class="body-s lgray mt32" style="opacity:.85">무료 강의에서 설계도를 보셨다면, 여기서는 <b style="color:#FFD54A">첫 번째 층을 실제로 올립니다.</b></div>';

// ── 온라인 건물 구조: 간판 → 미로 → 세일즈 계단 ──
const BUILDING = `
<div class="sec dark pad">
  <div class="tape straight">무료 강의에서 이어집니다</div>
  <div class="h2" style="margin-top:28px">여러분의 계정에는<br>지금 몇 층까지 서 있나요?</div>
  <div class="body-t lgray" style="margin-top:22px">
    강의에서 말씀드렸듯, 인스타 계정은 <b style="color:#fff">사람을 모으는 온라인 건물</b>입니다.
    건물이 돌아가려면 세 가지가 다 있어야 합니다. 하나라도 비면 사람은 들어왔다 그냥 나갑니다.
  </div>

  <div class="ba" style="margin-top:34px">
    <div class="row">
      <div class="cell">
        <div class="lab yellow">1층 · 간판</div>
        <div class="txt">릴스와 콘텐츠. 사람이 나를 <b style="color:#fff">발견하는</b> 자리입니다.</div>
      </div>
      <div class="cell right">
        <div class="lab yellow">2층 · 미로</div>
        <div class="txt">프로필과 쌓인 콘텐츠. <b style="color:#fff">&ldquo;이 사람 믿을 만한가&rdquo;</b>를 판단하는 자리입니다.</div>
      </div>
    </div>
  </div>
  <div class="ba" style="margin-top:14px">
    <div class="row">
      <div class="cell" style="width:100%">
        <div class="lab yellow">3층 · 세일즈 계단</div>
        <div class="txt">구매·상담·무료자료·제휴. 신뢰가 <b style="color:#fff">돈과 기회로 바뀌는</b> 자리입니다.</div>
      </div>
    </div>
  </div>

  <div class="body-t" style="margin-top:34px;color:#fff">
    대부분은 <b class="yellow">간판만</b> 만들다 지칩니다. 릴스는 찍는데 미로도 계단도 없으니
    사람이 들어와도 그냥 나갑니다. 5주 동안 세 층을 <b class="yellow">순서대로</b> 올립니다.
  </div>
</div>
`;

// ── 상품이 없어도 된다 (대본 6번) ──
const NO_PRODUCT = `
<div class="sec pad">
  <div class="h2">&ldquo;저는 팔 상품이<br>없는데요?&rdquo;</div>
  <div class="body-t" style="margin-top:22px">
    강의에서 말씀드린 대로, 상품이 없어도 됩니다. 크게 보면 <b>세 갈래</b>입니다.
  </div>
  <div class="grid" style="margin-top:28px">
    <div class="card2"><div class="t">남의 상품을 판다</div><div class="d">제휴마케팅 · 공동구매 · 광고 · 협찬</div></div>
    <div class="card2"><div class="t">내 영향력을 판다</div><div class="d">UGC 제작 · SNS 운영 대행 · 콘텐츠 제작</div></div>
    <div class="card2"><div class="t">내 능력을 판다</div><div class="d">컨설팅 · 코칭 · 전자책 · 온라인 강의</div></div>
    <div class="card2" style="background:#131313;color:#fff"><div class="t" style="color:#FFD54A">상품이 이미 있다면</div><div class="d" style="color:#ddd">사람만 모으면 됩니다. 지금 그 상품을 더 팔면 됩니다.</div></div>
  </div>
  <div class="body-t" style="margin-top:30px">
    다만 <b>어느 쪽이든 공통으로 필요한 게 하나</b> 있습니다. <span class="hl">사람</span>입니다.
    그래서 1주차에 &ldquo;무슨 상품을 만들지&rdquo;가 아니라 <b>누구를 모을지</b>부터 정합니다.
  </div>
  <div class="body-t" style="margin-top:20px;font-weight:900">
    팔로워를 모으지 마세요. <span class="hl">미래의 고객과 기회</span>를 모으세요.
  </div>
</div>
`;

// ── 가격 비교 프레임 (대본 15·16번) — 가격 섹션 뒤에 붙는다 ──
const PRICE_FRAME = `
<div class="sec soft pad">
  <div class="h2">195만원을<br>무엇과 비교하실 건가요?</div>
  <div class="body-t" style="margin-top:22px">
    영상 몇 개짜리인지로 비교하시면, 이 과정은 비쌉니다. 인스타 팁 몇 개만 필요하시면
    <b>무료 콘텐츠만으로도 충분합니다.</b> 솔직히 그렇습니다.
  </div>
  <div class="body-t" style="margin-top:20px">
    비교 대상은 따로 있습니다.
  </div>
  <div style="margin-top:24px">
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">혼자 헤매며 태울 <span class="hl">몇 달의 시간</span></div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">잘못된 방향으로 간 걸 <span class="hl">빨리 알아채고 돌리는 것</span></div></div>
    <div class="chk"><div class="box"><span>✓</span></div><div class="txt">앞으로 어떤 사업을 하든 반복해서 쓸 <span class="hl">고객 획득 능력</span></div></div>
  </div>
  <div class="body-t" style="margin-top:28px;font-weight:900">
    여러분이 사는 건 강의가 아닙니다.<br>
    <span class="hl">강의를 들은 뒤의 자신</span>입니다.
  </div>
</div>
`;

// ── 6개월 두 갈래 미래 (대본 17번) — 클로징 앞 ──
const TWO_FUTURES = `
<div class="sec dark pad">
  <div class="h2">6개월은<br>어차피 지나갑니다</div>
  <div class="ba" style="margin-top:34px">
    <div class="row">
      <div class="cell">
        <div class="lab" style="color:#8a8a8a">6개월 뒤 · A</div>
        <div class="txt">여전히 &ldquo;인스타 해야 하는데&rdquo;를 검색하고 있습니다.<br><br>
          &ldquo;릴스 뭐 찍지&rdquo;, &ldquo;왜 안 크지&rdquo;, &ldquo;이걸 어떻게 돈으로 만들지&rdquo;를 그때도 검색하고 있습니다.</div>
      </div>
      <div class="cell right">
        <div class="lab yellow">6개월 뒤 · B</div>
        <div class="txt" style="color:#fff">계정의 방향이 잡혀 있고, 콘텐츠가 쌓여 있고, 나를 아는 사람이 생겼습니다.<br><br>
          상품이 있으면 고객을 만들고 있고, 없으면 나에게 맞는 수익모델을 테스트하고 있습니다.</div>
      </div>
    </div>
  </div>
  <div class="body-t" style="margin-top:30px;color:#fff">
    어느 쪽이든 <b class="yellow">6개월은 똑같이 지나갑니다.</b><br>
    오늘의 선택은 강의를 살지 말지가 아니라, 6개월 뒤 어디에 서 있을지에 대한 선택입니다.
  </div>
  ${cta("6개월 뒤를 B로 만들기", "정원 10명 · 웨비나 참석자 195만원")}
</div>
`;

// ── 추신 교체: 시간 프레임으로 ──
const OLD_PS_MARK = '<div class="h3">추신.</div>';
const NEW_PS_BODY = `<div class="h3">추신.</div>
  <div class="body-t" style="margin-top:18px">
    인스타그램은 누구나 무료로 시작할 수 있습니다. <span class="hl">하지만 여러분의 시간은 무료가 아닙니다.</span>
    온라인 건물에서 가장 비싼 자원이 그겁니다.
  </div>
  <div class="body-t" style="margin-top:16px">
    이 기수는 <b>10명</b>입니다. 3주차에 한 분당 20분씩 직접 만나야 해서 늘리고 싶어도 못 늘립니다.
    정원이 차면 웨비나 참석자가 195만원은 닫히고, 다음 기수는 정가 325만원으로 다시 엽니다.
  </div>
  <div class="body-t" style="margin-top:16px">
    &ldquo;내가 끝까지 할 수 있을까&rdquo;가 걱정이시라면 — 그건 제 일입니다.
    못 따라오시면 다음 기수에 다시 오시면 됩니다. <span class="hl">잃을 게 없는 쪽으로 만들어뒀습니다.</span>
  </div>
  <div class="body-t" style="margin-top:16px;font-weight:900">
    5주 뒤, 여러분의 온라인 건물 <span class="hl">첫 번째 층</span>을 완성해봅시다.
  </div>`;

function align(html) {
  let out = html;

  // 보너스 섹션 끝문장과 보장 헤드라인이 똑같아 중복으로 읽힌다 → 보장 쪽을 바꾼다
  out = out.replace(
    '<div class="h2" style="margin-top:26px">한 번 잡은 멱살,<br/>수료했다고 놓지 않습니다.</div>',
    '<div class="h2" style="margin-top:26px">따라오다 멈춰도,<br/>여기서 끝나지 않습니다.</div>'
  );

  // 히어로 문구 교체
  if (out.includes(OLD_AUDIENCE)) out = out.replace(OLD_AUDIENCE, NEW_AUDIENCE);
  if (out.includes(OLD_PROMISE)) out = out.replace(OLD_PROMISE, NEW_PROMISE);

  // 온라인 건물 구조 — "무료 강의 회고" 섹션 뒤, 5가지 문제 앞
  const problemIdx = out.indexOf("무엇부터 해야 할지 모른다");
  if (problemIdx > 0 && !out.includes("지금 몇 층까지 서 있나요")) {
    const secStart = out.lastIndexOf('<div class="sec', problemIdx);
    out = out.slice(0, secStart) + BUILDING + "\n" + out.slice(secStart);
  }

  // 상품 없어도 된다 — 업종 사례 섹션 앞
  const casesIdx = out.indexOf("저는 예쁘지도, 어리지도");
  if (casesIdx > 0 && !out.includes("저는 팔 상품이")) {
    const secStart = out.lastIndexOf('<div class="sec', casesIdx);
    out = out.slice(0, secStart) + NO_PRODUCT + "\n" + out.slice(secStart);
  }

  // 가격 비교 프레임 — 가격 공개 뒤(= 보장 섹션 앞)에 와야 한다.
  // "한 번 잡은 멱살"은 보너스 섹션 끝에도 나와서 앵커로 쓸 수 없다 → 보장 섹션의 도장 마커를 쓴다.
  const guaranteeIdx = out.indexOf('<div class="stamp">약 속</div>');
  if (guaranteeIdx > 0 && !out.includes("무엇과 비교하실 건가요")) {
    const secStart = out.lastIndexOf('<div class="sec', guaranteeIdx);
    out = out.slice(0, secStart) + PRICE_FRAME + "\n" + out.slice(secStart);
  }

  // 두 갈래 미래 — 마지막 클로징 앞
  // 본문 텍스트는 "지도는<br>이미 드렸습니다"처럼 태그가 끼어 있어 주석 마커를 앵커로 쓴다
  const closingIdx = out.indexOf("<!-- 11. 클로징 -->");
  if (closingIdx > 0 && !out.includes("6개월은<br>어차피 지나갑니다")) {
    out = out.slice(0, closingIdx) + TWO_FUTURES + "\n" + out.slice(closingIdx);
  }

  // 추신 본문 교체 (기존 추신 블록 전체를 새 본문으로)
  const psIdx = out.indexOf(OLD_PS_MARK);
  if (psIdx > 0 && !out.includes("여러분의 시간은 무료가 아닙니다")) {
    const ctaIdx = out.indexOf('<div style="margin-top:34px;text-align:center">', psIdx);
    if (ctaIdx > 0) out = out.slice(0, psIdx) + NEW_PS_BODY + "\n  " + out.slice(ctaIdx);
  }
  return out;
}

const slugs = ["5-week-challenge", "5-week-challenge-plus-consulting"];
const cur = await prisma.product.findUnique({
  where: { slug: "5-week-challenge" },
  select: { descriptionDesign: true },
});
if (!cur?.descriptionDesign) { console.error("상세 HTML 없음"); process.exit(1); }

// 되돌릴 수 있게 현재 상태를 먼저 파일로 남긴다
fs.writeFileSync("scripts/assets/challenge-detail-backup.html", cur.descriptionDesign);

const next = align(cur.descriptionDesign);
fs.writeFileSync("scripts/assets/challenge-detail-lecture-aligned.html", next);

console.log(`원본 ${cur.descriptionDesign.length}자 → 정렬 ${next.length}자 (+${next.length - cur.descriptionDesign.length})`);
const checks = [
  ["팔 상품이 있든 없든", "히어로 오디언스"],
  ["사람을 모으는 온라인 건물", "히어로 약속"],
  ["지금 몇 층까지 서 있나요", "간판→미로→세일즈 계단"],
  ["팔로워를 모으지 마세요", "미래 고객 프레임"],
  ["무엇과 비교하실 건가요", "가격 비교 프레임"],
  ["6개월은<br>어차피 지나갑니다", "두 갈래 미래"],
  ["여러분의 시간은 무료가 아닙니다", "추신 교체"],
];
for (const [k, label] of checks) console.log(`  ${next.includes(k) ? "✔" : "✘"} ${label}`);
const o = (next.match(/<div/g) || []).length, c = (next.match(/<\/div>/g) || []).length;
console.log(`  div 여닫이 ${o}/${c} ${o === c ? "✔" : "✘ 불일치"}`);

if (!WRITE) {
  console.log("\n(미리보기만. 반영하려면 --write · 백업: scripts/assets/challenge-detail-backup.html)");
} else {
  for (const slug of slugs) {
    const p = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!p) continue;
    await prisma.product.update({ where: { id: p.id }, data: { descriptionDesign: next } });
    console.log(`  ✔ ${slug} 반영`);
  }
}
await prisma.$disconnect();
