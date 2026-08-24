// 상세페이지를 DESIGN-clay.md(Clay 디자인 시스템)로 재디자인한다.
//
// 기존: 흰 배경 + 검정 섹션 교차, 900 굵기 제목, 노란 테이프/빨간 도장, 인스타 그라디언트 바
// Clay: 크림 캔버스(#fffaf0) 위에 채도 높은 단색 피처 카드(핑크·틸·라벤더·피치·오커·크림)를
//       리듬으로 배치. 디스플레이는 500 굵기 + 음수 자간. 그림자 없음. 푸터도 크림.
//
// 방식: HTML 본문은 살리고 <style> 블록을 통째로 Clay 토큰으로 교체한 뒤,
//       섹션 배경 클래스를 6색 로테이션으로 다시 칠한다(같은 색 연속 금지).
//       인라인 hex 는 옛 팔레트 → Clay 토큰으로 일괄 치환한다.
//
// 실행: node scripts/restyle-detail-clay.mjs [--write]
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

// ── Clay 스타일시트 (클래스 이름은 유지, 값만 Clay 토큰으로) ──
const CLAY_STYLE = `
/* DESIGN-clay.md 기반. 색·자간·라운드는 전부 토큰 값 그대로. */
.product-landing{
  --ink:#0a0a0a; --body:#3a3a3a; --muted:#6a6a6a; --muted-soft:#9a9a9a;
  --hairline:#e5e5e5; --canvas:#fffaf0; --soft:#faf5e8; --card:#f5f0e0; --strong:#ebe6d6;
  --pink:#ff4d8b; --teal:#1a3a3a; --lav:#b8a4ed; --peach:#ffb084; --ochre:#e8b94a;
  --mint:#a4d4c5; --coral:#ff6b5a; --on-dark:#ffffff; --on-dark-soft:#a0a0a0;
  max-width:1280px; margin:0 auto; background:var(--canvas); color:var(--ink);
  font-family:Inter,'Apple SD Gothic Neo','Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif;
  line-height:1.55; -webkit-font-smoothing:antialiased;
}
.product-landing *{margin:0;padding:0;box-sizing:border-box}

/* 섹션 = 크림 캔버스 위에 얹히는 라운드 카드 */
.product-landing .sec{width:100%;overflow:hidden;background:var(--canvas);color:var(--ink);border-radius:24px;margin:0 0 16px}
.product-landing .pad{padding:96px 64px}
.product-landing .hero{padding:96px 64px}
@media (max-width:900px){
  .product-landing .pad,.product-landing .hero{padding:56px 24px}
  .product-landing .sec{border-radius:20px}
}

/* 피처 카드 색상 — 같은 색 연속 금지 (스크립트에서 로테이션) */
.product-landing .c-canvas{background:var(--canvas)}
.product-landing .c-soft{background:var(--soft)}
.product-landing .c-cream{background:var(--card)}
.product-landing .c-strong{background:var(--strong)}
.product-landing .c-pink{background:var(--pink);color:#fff}
.product-landing .c-teal{background:var(--teal);color:#fff}
.product-landing .c-lav{background:var(--lav);color:var(--ink)}
.product-landing .c-peach{background:var(--peach);color:var(--ink)}
.product-landing .c-ochre{background:var(--ochre);color:var(--ink)}
/* 어두운 카드(틸·핑크) 위에서는 보조 텍스트도 밝게 */
.product-landing .c-teal .gray,.product-landing .c-teal .lgray,.product-landing .c-teal .small.gray,
.product-landing .c-pink .gray,.product-landing .c-pink .lgray{color:rgba(255,255,255,.72)}

/* 타이포 — Plain Black 대체: Inter 500 + 음수 자간. 500 초과 금지 */
.product-landing .h1,.product-landing .line-lg{font-size:72px;font-weight:500;line-height:1;letter-spacing:-2.5px}
.product-landing .h2{font-size:56px;font-weight:500;line-height:1.05;letter-spacing:-2px}
.product-landing .h3{font-size:40px;font-weight:500;line-height:1.1;letter-spacing:-1px}
.product-landing .line-sm{font-size:32px;font-weight:500;line-height:1.15;letter-spacing:-.5px;color:var(--muted);margin-bottom:8px}
.product-landing .storyquote{font-size:40px;font-weight:500;line-height:1.2;letter-spacing:-1px}
.product-landing .body-t{font-size:18px;font-weight:400;line-height:1.55;color:var(--body)}
.product-landing .body-s{font-size:16px;font-weight:400;line-height:1.55;color:var(--body)}
.product-landing .small{font-size:14px;line-height:1.55;color:var(--muted)}
.product-landing .serif{font-family:inherit}
@media (max-width:900px){
  .product-landing .h1,.product-landing .line-lg{font-size:36px;letter-spacing:-1.2px}
  .product-landing .h2{font-size:30px;letter-spacing:-1px}
  .product-landing .h3,.product-landing .storyquote{font-size:24px;letter-spacing:-.5px}
  .product-landing .line-sm{font-size:20px}
}
.product-landing .gray{color:var(--muted)}
.product-landing .lgray{color:var(--muted)}
.product-landing .yellow{color:var(--ochre)}
.product-landing .c-teal .yellow,.product-landing .c-pink .yellow{color:var(--ochre)}

/* 뱃지 = pill, 강조 = 밑줄 대신 오커 하이라이트 */
.product-landing .tape{display:inline-block;background:var(--card);color:var(--ink);
  font-size:12px;font-weight:600;letter-spacing:1.5px;padding:6px 14px;border-radius:9999px;transform:none;box-shadow:none}
.product-landing .c-teal .tape,.product-landing .c-pink .tape{background:rgba(255,255,255,.16);color:#fff}
.product-landing .tape.straight{transform:none}
.product-landing .hl{background:linear-gradient(transparent 62%, var(--ochre) 62%);padding:0 2px;font-weight:600;color:inherit}
.product-landing .c-teal .hl,.product-landing .c-pink .hl{background:linear-gradient(transparent 62%, rgba(232,185,74,.55) 62%);color:#fff}
.product-landing .hl-red{background:var(--coral);color:#fff;padding:2px 8px;border-radius:6px;font-weight:600}
.product-landing .stamp{display:inline-block;border:1px solid var(--ink);color:var(--ink);
  font-size:12px;font-weight:600;letter-spacing:1.5px;padding:6px 14px;border-radius:9999px;transform:none}
.product-landing .igbar{height:1px;width:100%;background:var(--hairline);border-radius:0}
.product-landing .divider-zig{display:none}

/* 리스트 체크 — 노란 네모 대신 오커 도트 */
.product-landing .chk{display:table;width:100%;margin-bottom:16px}
.product-landing .chk .box{display:table-cell;width:36px;vertical-align:top;padding-top:5px}
.product-landing .chk .box span{display:inline-flex;align-items:center;justify-content:center;
  width:22px;height:22px;border:0;border-radius:9999px;background:var(--ochre);color:var(--ink);font-size:12px;font-weight:600}
.product-landing .c-teal .chk .box span,.product-landing .c-pink .chk .box span{background:rgba(255,255,255,.9);color:var(--ink)}
.product-landing .chk .txt{display:table-cell;font-size:18px;font-weight:400;line-height:1.55;letter-spacing:0;color:inherit}

/* 카드류 — 그림자 없음, 헤어라인 또는 크림 면 */
.product-landing .card2{display:inline-block;width:31.5%;min-width:240px;vertical-align:top;
  background:var(--canvas);border:1px solid var(--hairline);border-radius:16px;padding:24px;margin:0 4px 12px;text-align:left}
.product-landing .c-teal .card2,.product-landing .c-pink .card2{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#fff}
.product-landing .card2 .t{font-size:18px;font-weight:600;letter-spacing:0;margin-bottom:6px}
.product-landing .card2 .n{font-size:13px;color:var(--muted-soft);margin-bottom:8px}
.product-landing .card2 .d{font-size:14px;line-height:1.55;color:var(--body)}
.product-landing .c-teal .card2 .d,.product-landing .c-pink .card2 .d{color:rgba(255,255,255,.8)}
.product-landing .grid{width:100%;text-align:left}
@media (max-width:900px){.product-landing .card2{width:100%;margin:0 0 10px}}

.product-landing .resbar{background:var(--card);border-radius:16px;padding:24px 28px;margin-top:24px;color:var(--ink)}
.product-landing .c-teal .resbar,.product-landing .c-pink .resbar{background:rgba(255,255,255,.12);color:#fff}
.product-landing .res{display:table;width:100%;padding:12px 0}
.product-landing .res .who{display:table-cell;font-size:16px;color:var(--muted);vertical-align:middle;width:60%}
.product-landing .c-teal .res .who,.product-landing .c-pink .res .who{color:rgba(255,255,255,.72)}
.product-landing .res .num{display:table-cell;text-align:right;font-size:18px;font-weight:600;letter-spacing:0;vertical-align:middle}

.product-landing .statbox{margin-top:32px;border:1px solid var(--hairline);border-radius:16px;padding:8px 0;background:var(--canvas)}
.product-landing .c-teal .statbox{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.06)}
.product-landing .statrow{display:table;width:100%;padding:16px 24px}
.product-landing .statrow .k{display:table-cell;width:58%;font-size:14px;color:var(--muted);vertical-align:middle}
.product-landing .c-teal .statrow .k{color:rgba(255,255,255,.72)}
.product-landing .statrow .v{display:table-cell;text-align:right;font-size:24px;font-weight:600;letter-spacing:-.3px;vertical-align:middle}
.product-landing .statdiv{height:1px;background:var(--hairline);margin:0 24px}
.product-landing .c-teal .statdiv{background:rgba(255,255,255,.16)}
.product-landing .resdiv{height:1px;background:var(--hairline);margin:0}

.product-landing .ba{border:1px solid var(--hairline);border-radius:16px;margin-top:24px;overflow:hidden}
.product-landing .c-teal .ba{border-color:rgba(255,255,255,.2)}
.product-landing .ba .row{display:table;width:100%}
.product-landing .ba .cell{display:table-cell;width:50%;padding:24px;vertical-align:top}
.product-landing .ba .cell.right{border-left:1px solid var(--hairline)}
.product-landing .c-teal .ba .cell.right{border-left-color:rgba(255,255,255,.2)}
.product-landing .ba .lab{font-size:12px;font-weight:600;letter-spacing:1.5px;margin-bottom:10px;color:var(--muted)}
.product-landing .c-teal .ba .lab{color:rgba(255,255,255,.6)}
.product-landing .ba .txt{font-size:16px;line-height:1.55;color:var(--body)}
.product-landing .c-teal .ba .txt{color:rgba(255,255,255,.82)}
@media (max-width:900px){
  .product-landing .ba .row,.product-landing .ba .cell{display:block;width:100%}
  .product-landing .ba .cell.right{border-left:0;border-top:1px solid var(--hairline)}
}

/* 여백 유틸 */
.product-landing .mb16{margin-bottom:16px}.product-landing .mb24{margin-bottom:24px}
.product-landing .mb32{margin-bottom:32px}.product-landing .mb40{margin-bottom:40px}
.product-landing .mb48{margin-bottom:48px}
.product-landing .mt16{margin-top:16px}.product-landing .mt24{margin-top:24px}
.product-landing .mt32{margin-top:32px}.product-landing .mt40{margin-top:40px}
.product-landing .mt48{margin-top:48px}
.product-landing .center{text-align:center}.product-landing .right{text-align:right}
.product-landing .strike{text-decoration:line-through;color:var(--muted-soft)}

/* CTA — primary 는 near-black, 라운드 12px */
.product-landing a.clay-cta{display:inline-block;background:var(--ink);color:#fff;
  font-size:16px;font-weight:600;letter-spacing:0;padding:16px 28px;border-radius:12px;
  text-decoration:none;box-shadow:none;line-height:1}
.product-landing .c-teal a.clay-cta,.product-landing .c-pink a.clay-cta{background:var(--canvas);color:var(--ink)}

/* 남은 구조 요소들 최소 보정 */
.product-landing .pricebox,.product-landing .prob,.product-landing .faq,.product-landing .dcard,
.product-landing .wk3box,.product-landing .pframe{border-radius:16px}
.product-landing .vline,.product-landing .spine,.product-landing .bdiv{background:var(--hairline)}
.product-landing img{max-width:100%;border-radius:16px;display:block}
`;

// ── 옛 팔레트 → Clay 토큰 (인라인 style 까지 싹 치환) ──
const HEX = [
  [/#131313/gi, "#0a0a0a"],
  [/#1a1a1a/gi, "#0a0a0a"],
  [/#FFD54A/gi, "#e8b94a"],
  [/#FF3B30/gi, "#0a0a0a"], // 빨간 CTA/도장 → primary near-black
  [/#F4F4F2/gi, "#faf5e8"],
  [/#FFF7DC/gi, "#f5f0e0"],
  [/#B9B9B9/gi, "#a0a0a0"],
  [/#7a7a7a/gi, "#6a6a6a"],
  [/#8a8a8a/gi, "#9a9a9a"],
  [/#3a3a3a/gi, "#e5e5e5"], // 옛 다크 테두리 → 헤어라인
  [/#ddd\b/gi, "#a0a0a0"],
];

/**
 * 섹션 색 배정.
 * Clay 는 크림 캔버스가 "바닥"이고 채도 카드는 구두점이다. 전 섹션을 칠하면 시끄러워진다.
 * → 히어로·서사 구간은 캔버스/크림, 피처 구간만 채도 카드.
 *
 * 주의: 원래 .dark 였던 섹션은 인라인 color:#fff 가 박혀 있어 밝은 배경에 올리면 글자가 사라진다.
 *       히어로만 예외로 인라인 흰색을 잉크로 바꿔 캔버스로 올리고, 나머지 다크 섹션은 틸에 둔다.
 */
const BY_CONTENT = [
  ["이 5주 동안 알게 되는 것", "c-ochre"],   // 흥미 유발 6불릿 — 눈에 띄어야 함
  ["지금 몇 층까지 서 있나요", "c-teal"],     // 온라인 건물 = 강의의 핵심 프레임
  ["무엇부터 해야 할지 모른다", "c-cream"],   // 문제 자극
  ["이 챌린지를 만든 이유", "c-teal"],        // 스토리 (원래 다크)
  ["저는 팔 상품이", "c-lav"],                // 세 갈래 수익화
  ["저는 예쁘지도", "c-canvas"],              // 업종 사례
  ["챌린지가 약속하는", "c-peach"],           // 5가지 변화
  ["5주 로드맵", "c-teal"],                   // 로드맵 (원래 다크)
  ["무엇과 비교하실 건가요", "c-cream"],      // 가격 비교 프레임
  ["챌린지만 신청해도", "c-ochre"],           // 보너스
  ["받는 것을 다 합치면", "c-canvas"],        // 가치 스택
  ['id="apply"', "c-pink"],                  // 가격·희소성 — 가장 센 구두점
  ["따라오다 멈춰도", "c-cream"],             // 보장
  ["자주 묻는 질문", "c-canvas"],             // FAQ
  ["어차피 지나갑니다", "c-teal"],            // 두 갈래 미래 (원래 다크)
  ["부족한 건 정보가 아닙니다", "c-teal"],    // 클로징 (원래 다크)
  ["추신", "c-soft"],                         // 푸터 자리 — Clay 는 크림으로 닫는다
];

function recolorSections(html) {
  // 섹션 경계로 쪼갠 뒤 내용으로 색을 고른다
  const re = /<div class="sec([^"]*)"/g;
  const bounds = [];
  let m;
  while ((m = re.exec(html))) bounds.push({ idx: m.index, len: m[0].length, rest: m[1] });

  const matched = new Set();
  let out = "", cursor = 0, last = "";
  bounds.forEach((b, i) => {
    const body = html.slice(b.idx, bounds[i + 1] ? bounds[i + 1].idx : html.length);
    const isHero = /\bhero\b/.test(b.rest);
    let pick = isHero ? "c-canvas" : null;
    if (!pick) {
      const hit = BY_CONTENT.find(([k]) => body.includes(k));
      if (hit) matched.add(hit[0]);
      pick = hit ? hit[1] : "c-canvas";
    }
    // 같은 색 연속 회피 (캔버스는 바닥이라 예외)
    if (pick === last && pick !== "c-canvas") pick = pick === "c-cream" ? "c-soft" : "c-cream";
    last = pick;

    const kept = b.rest.replace(/\b(dark|cream|soft)\b/g, "").replace(/\s+/g, " ").trim();
    out += html.slice(cursor, b.idx) + `<div class="sec ${pick}${kept ? " " + kept : ""}"`;
    cursor = b.idx + b.len;
  });
  const missed = BY_CONTENT.filter(([k]) => !matched.has(k)).map(([k]) => k);
  if (missed.length) console.log("  ⚠ 매칭 실패한 키:", missed.join(" / "));
  return out + html.slice(cursor);
}

/**
 * 밝은 카드(캔버스·크림·소프트·라벤더·피치·오커) 위에 남은 인라인 흰 글자를 잉크로 바꾼다.
 * 원래 다크였던 섹션이 밝은 색으로 이동하면 글자가 안 보이므로 반드시 거쳐야 한다.
 */
function fixContrast(html) {
  const LIGHT = new Set(["c-canvas", "c-cream", "c-soft", "c-lav", "c-peach", "c-ochre", "c-strong"]);
  const re = /<div class="sec (c-[a-z]+)/g;
  const bounds = [];
  let m;
  while ((m = re.exec(html))) bounds.push({ i: m.index, c: m[1] });
  let out = "", cursor = 0;
  bounds.forEach((b, i) => {
    const end = bounds[i + 1] ? bounds[i + 1].i : html.length;
    let seg = html.slice(b.i, end);
    if (LIGHT.has(b.c)) {
      seg = seg
        .replace(/color:#fff\b/gi, "color:#0a0a0a")
        .replace(/color:#ffffff\b/gi, "color:#0a0a0a")
        .replace(/color:#a0a0a0/gi, "color:#6a6a6a"); // 다크용 보조색 → 밝은 면의 muted
    }
    out += html.slice(cursor, b.i) + seg;
    cursor = end;
  });
  return out + html.slice(cursor);
}

/** 히어로를 크림 캔버스로 올리기 위해 인라인 흰색 글자를 잉크로 바꾼다 */
function lightenHero(html) {
  const s = html.indexOf('<div class="sec c-canvas hero"');
  if (s < 0) return html;
  const e = html.indexOf('<div class="sec', s + 10);
  let hero = html.slice(s, e);
  hero = hero
    .replace(/color:#fff\b/g, "color:#0a0a0a")
    .replace(/color:#e8b94a/g, "color:#0a0a0a"); // 크림 위 오커 글자는 대비가 약하다
  return html.slice(0, s) + hero + html.slice(e);
}

/** 기존 CTA 앵커를 Clay 버튼으로 */
function restyleCta(html) {
  return html.replace(
    /<a href="#apply" style="[^"]*">/g,
    '<a href="#apply" class="clay-cta">'
  );
}

function restyle(html) {
  let out = html;

  // 1) 스타일 블록 교체
  const s = out.indexOf("<style>"), e = out.indexOf("</style>");
  if (s < 0 || e < 0) throw new Error("style 블록을 찾지 못했습니다.");
  out = out.slice(0, s + 7) + CLAY_STYLE + out.slice(e);

  // 2) 섹션 색 배정 + 히어로 라이트화
  out = recolorSections(out);
  out = lightenHero(out);
  out = fixContrast(out);

  // 3) CTA 버튼
  out = restyleCta(out);

  // 4) 인라인 hex 치환 (본문 영역만 — 스타일 블록은 이미 Clay)
  const cut = out.indexOf("</style>");
  let head = out.slice(0, cut), body = out.slice(cut);
  for (const [re, to] of HEX) body = body.replace(re, to);
  // 인스타 그라디언트 잔재 제거
  body = body.replace(/background:linear-gradient\(to right,#833AB4,#FD1D1D,#FCB045\)/gi, "background:#e5e5e5");
  out = head + body;

  return out;
}

const cur = await prisma.product.findUnique({
  where: { slug: "5-week-challenge" },
  select: { descriptionDesign: true },
});
if (!cur?.descriptionDesign) { console.error("상세 HTML 없음"); process.exit(1); }

fs.writeFileSync("scripts/assets/challenge-detail-preclay.html", cur.descriptionDesign);
const next = restyle(cur.descriptionDesign);
fs.writeFileSync("scripts/assets/challenge-detail-clay.html", next);

console.log(`${cur.descriptionDesign.length}자 → ${next.length}자`);
const secs = [...next.matchAll(/<div class="sec ([a-z-]+)/g)].map((m) => m[1]);
console.log("섹션 색 순서:", secs.join(" → "));
let dup = 0;
for (let i = 1; i < secs.length; i++) if (secs[i] === secs[i - 1]) dup++;
console.log(`같은 색 연속: ${dup}건 ${dup === 0 ? "✔" : "✘"}`);
console.log(`옛 팔레트 잔존: ${/#131313|#FFD54A|#FF3B30|833AB4/i.test(next.slice(next.indexOf("</style>"))) ? "✘ 있음" : "✔ 없음"}`);
const o = (next.match(/<div/g) || []).length, c = (next.match(/<\/div>/g) || []).length;
console.log(`div 여닫이 ${o}/${c} ${o === c ? "✔" : "✘"}`);

if (!WRITE) console.log("\n(미리보기만. 반영: --write · 백업: scripts/assets/challenge-detail-preclay.html)");
else {
  for (const slug of ["5-week-challenge", "5-week-challenge-plus-consulting"]) {
    const p = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!p) continue;
    await prisma.product.update({ where: { id: p.id }, data: { descriptionDesign: next } });
    console.log(`  ✔ ${slug} 반영`);
  }
}
await prisma.$disconnect();
