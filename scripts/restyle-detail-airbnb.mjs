// 상세페이지를 DESIGN-airbnb.md 로 재디자인한다.
//
// Airbnb 는 Clay 와 정반대다.
//   · 캔버스는 순백 #ffffff. 크림도 다크도 없다. 푸터도 흰색(대비 푸터 없음).
//   · 브랜드 색은 Rausch #ff385c **하나뿐**이고, "대부분의 페이지는 90% 흰색+잉크에
//     Rausch 순간이 한두 번"이라고 명시돼 있다 → 채도 카드 전면 금지.
//   · 잉크는 순검정이 아니라 #222222.
//   · 그림자는 단 한 단계만 존재. 깊이는 사진·라운드·흰 면 분리로 만든다.
//   · 섹션 리듬 64px (Clay 96px 보다 촘촘).
//   · 라운드: 버튼 8px, 카드 14px, pill 9999px, 카테고리 스트립 32px.
//
// 입력은 Clay 적용 **이전** 원본(challenge-detail-preclay.html)을 쓴다.
// Clay 판에는 이미 크림/채도 보정이 들어가 있어 그 위에 덧칠하면 색이 꼬인다.
//
// 실행: node scripts/restyle-detail-airbnb.mjs [--write]
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

const AIRBNB_STYLE = `
/* DESIGN-airbnb.md 기반. 흰 캔버스 + Rausch 단일 악센트 + 잉크 #222. */
.product-landing{
  --rausch:#ff385c; --rausch-active:#e00b41;
  --ink:#222222; --body:#3f3f3f; --muted:#6a6a6a; --muted-soft:#929292;
  --hairline:#dddddd; --hairline-soft:#ebebeb; --border-strong:#c1c1c1;
  --canvas:#ffffff; --soft:#f7f7f7; --strong:#f2f2f2;
  --shadow:rgba(0,0,0,.02) 0 0 0 1px, rgba(0,0,0,.04) 0 2px 6px 0, rgba(0,0,0,.1) 0 4px 8px 0;
  max-width:1280px; margin:0 auto; background:var(--canvas); color:var(--ink);
  font-family:'Airbnb Cereal VF',Circular,Inter,-apple-system,system-ui,'Apple SD Gothic Neo','Noto Sans KR',Roboto,sans-serif;
  line-height:1.5; -webkit-font-smoothing:antialiased;
}
.product-landing *{margin:0;padding:0;box-sizing:border-box}

/* 섹션 = 흰 면. 구분은 색이 아니라 헤어라인 + 64px 리듬 */
.product-landing .sec{width:100%;overflow:hidden;background:var(--canvas);color:var(--ink);
  border-top:1px solid var(--hairline-soft)}
.product-landing .sec:first-of-type{border-top:0}
.product-landing .pad{padding:64px 40px}
.product-landing .hero{padding:64px 40px 56px}
.product-landing .a-soft{background:var(--soft);border-top-color:transparent}
@media (max-width:744px){ .product-landing .pad,.product-landing .hero{padding:44px 20px} }

/* 타이포 — Cereal 대체 스택. 무게는 400/500/600/700 만 쓴다 */
.product-landing .h1,.product-landing .line-lg{font-size:48px;font-weight:700;line-height:1.1;letter-spacing:-1px;color:var(--ink)}
.product-landing .h2{font-size:28px;font-weight:700;line-height:1.28;letter-spacing:0;color:var(--ink)}
.product-landing .h3{font-size:21px;font-weight:700;line-height:1.35;letter-spacing:0;color:var(--ink)}
.product-landing .line-sm{font-size:20px;font-weight:600;line-height:1.2;letter-spacing:-.18px;color:var(--muted);margin-bottom:6px}
.product-landing .storyquote{font-size:28px;font-weight:700;line-height:1.3;letter-spacing:0;color:var(--ink)}
.product-landing .body-t{font-size:16px;font-weight:400;line-height:1.5;color:var(--body)}
.product-landing .body-s{font-size:14px;font-weight:400;line-height:1.43;color:var(--body)}
.product-landing .small{font-size:13px;font-weight:400;line-height:1.4;color:var(--muted)}
.product-landing .serif{font-family:inherit}
.product-landing .gray,.product-landing .lgray{color:var(--muted)}
/* 시스템에서 노란색은 없다 — 강조는 잉크 굵기로 */
.product-landing .yellow{color:var(--ink);font-weight:600}
@media (max-width:744px){
  .product-landing .h1,.product-landing .line-lg{font-size:30px;letter-spacing:-.5px}
  .product-landing .h2{font-size:22px}
  .product-landing .h3,.product-landing .storyquote{font-size:19px}
  .product-landing .line-sm{font-size:17px}
}

/* 유일하게 크게 가는 자리 = rating-display(64/700). 가격·핵심 수치에만 */
.product-landing .a-hero-num{font-size:64px;font-weight:700;line-height:1.1;letter-spacing:-1px;color:var(--ink)}

/* 뱃지 = pill. 색은 흰 배경 + 헤어라인. Rausch 는 아껴 쓴다 */
.product-landing .tape{display:inline-block;background:var(--canvas);color:var(--ink);border:1px solid var(--hairline);
  font-size:11px;font-weight:600;letter-spacing:0;padding:5px 12px;border-radius:9999px;transform:none;box-shadow:none}
.product-landing .tape.straight{transform:none}
.product-landing .stamp{display:inline-block;background:var(--canvas);border:1px solid var(--ink);color:var(--ink);
  font-size:11px;font-weight:600;letter-spacing:0;padding:5px 12px;border-radius:9999px;transform:none}
/* 강조는 형광펜 대신 잉크 굵기 + 얇은 밑줄 */
/* 강조는 잉크 굵기 + 회색 밑줄. Rausch 는 CTA·가격에만 남긴다(시스템: 페이지당 한두 순간) */
.product-landing .hl{background:none;color:var(--ink);font-weight:600;box-shadow:inset 0 -2px 0 var(--border-strong);padding:0 1px}
.product-landing .hl-red{background:var(--rausch);color:#fff;padding:2px 8px;border-radius:4px;font-weight:600}
.product-landing .igbar{height:1px;width:100%;background:var(--hairline-soft)}
.product-landing .divider-zig{display:none}

/* 리스트 — Rausch 도트 대신 잉크 도트(악센트 남용 금지) */
.product-landing .chk{display:table;width:100%;margin-bottom:14px}
.product-landing .chk .box{display:table-cell;width:32px;vertical-align:top;padding-top:4px}
.product-landing .chk .box span{display:inline-flex;align-items:center;justify-content:center;
  width:20px;height:20px;border:0;border-radius:9999px;background:var(--ink);color:#fff;font-size:11px;font-weight:600}
.product-landing .chk .txt{display:table-cell;font-size:16px;font-weight:400;line-height:1.5;letter-spacing:0;color:var(--body)}

/* 카드 — 흰 면 + 14px 라운드 + 헤어라인. 그림자는 단일 티어만 */
.product-landing .card2{display:inline-block;width:31.5%;min-width:230px;vertical-align:top;
  background:var(--canvas);border:1px solid var(--hairline);border-radius:14px;padding:20px;margin:0 4px 12px;text-align:left}
.product-landing .card2 .t{font-size:16px;font-weight:600;margin-bottom:4px;color:var(--ink)}
.product-landing .card2 .n{font-size:13px;color:var(--muted-soft);margin-bottom:6px}
.product-landing .card2 .d{font-size:14px;line-height:1.43;color:var(--body)}
.product-landing .grid{width:100%;text-align:left}
@media (max-width:744px){.product-landing .card2{width:100%;margin:0 0 10px}}

.product-landing .resbar{background:var(--canvas);border:1px solid var(--hairline);border-radius:14px;
  padding:20px 24px;margin-top:20px;color:var(--ink);box-shadow:var(--shadow)}
.product-landing .res{display:table;width:100%;padding:10px 0}
.product-landing .res .who{display:table-cell;font-size:14px;color:var(--muted);vertical-align:middle;width:62%}
.product-landing .res .num{display:table-cell;text-align:right;font-size:16px;font-weight:600;vertical-align:middle;color:var(--ink)}

.product-landing .statbox{margin-top:28px;border:1px solid var(--hairline);border-radius:14px;padding:4px 0;background:var(--canvas)}
.product-landing .statrow{display:table;width:100%;padding:14px 20px}
.product-landing .statrow .k{display:table-cell;width:58%;font-size:14px;color:var(--muted);vertical-align:middle}
.product-landing .statrow .v{display:table-cell;text-align:right;font-size:21px;font-weight:700;vertical-align:middle;color:var(--ink)}
.product-landing .statdiv,.product-landing .resdiv{height:1px;background:var(--hairline-soft);margin:0 20px}

.product-landing .ba{border:1px solid var(--hairline);border-radius:14px;margin-top:20px;overflow:hidden}
.product-landing .ba .row{display:table;width:100%}
.product-landing .ba .cell{display:table-cell;width:50%;padding:20px;vertical-align:top}
.product-landing .ba .cell.right{border-left:1px solid var(--hairline-soft)}
.product-landing .ba .lab{font-size:12px;font-weight:700;letter-spacing:0;margin-bottom:8px;color:var(--muted)}
.product-landing .ba .txt{font-size:14px;line-height:1.43;color:var(--body)}
@media (max-width:744px){
  .product-landing .ba .row,.product-landing .ba .cell{display:block;width:100%}
  .product-landing .ba .cell.right{border-left:0;border-top:1px solid var(--hairline-soft)}
}

/* 여백 유틸 — 64px 리듬에 맞춰 축소 */
.product-landing .mb16{margin-bottom:12px}.product-landing .mb24{margin-bottom:16px}
.product-landing .mb32{margin-bottom:24px}.product-landing .mb40{margin-bottom:32px}
.product-landing .mb48{margin-bottom:40px}
.product-landing .mt16{margin-top:12px}.product-landing .mt24{margin-top:16px}
.product-landing .mt32{margin-top:24px}.product-landing .mt40{margin-top:32px}
.product-landing .mt48{margin-top:40px}
.product-landing .center{text-align:center}.product-landing .right{text-align:right}
.product-landing .strike{text-decoration:line-through;color:var(--muted-soft)}

/* CTA — Rausch, 8px 라운드, 48px 높이. 이 페이지의 유일한 색 순간 */
.product-landing a.ab-cta{display:inline-block;background:var(--rausch);color:#fff;
  font-size:16px;font-weight:500;line-height:1.25;padding:14px 24px;border-radius:8px;
  text-decoration:none;box-shadow:none;min-height:48px}

.product-landing .pricebox,.product-landing .prob,.product-landing .faq,.product-landing .dcard,
.product-landing .wk3box,.product-landing .pframe{border-radius:14px}
.product-landing .vline,.product-landing .spine,.product-landing .bdiv{background:var(--hairline-soft)}
.product-landing img{max-width:100%;border-radius:14px;display:block}
`;

// 옛 팔레트 → Airbnb 토큰. 다크 섹션이 전부 흰 면이 되므로 흰 글자는 잉크로.
const HEX = [
  [/#131313/gi, "#222222"],
  [/#1a1a1a/gi, "#222222"],
  [/#0a0a0a/gi, "#222222"],
  [/#FFD54A/gi, "#222222"], // 노랑은 시스템에 없다
  [/#e8b94a/gi, "#222222"],
  [/#FF3B30/gi, "#ff385c"], // 빨강 → Rausch
  [/#F4F4F2/gi, "#f7f7f7"],
  [/#FFF7DC/gi, "#f7f7f7"],
  [/#f5f0e0/gi, "#f7f7f7"],
  [/#fffaf0/gi, "#ffffff"],
  [/#B9B9B9/gi, "#6a6a6a"],
  [/#a0a0a0/gi, "#6a6a6a"],
  [/#7a7a7a/gi, "#6a6a6a"],
  [/#8a8a8a/gi, "#929292"],
  [/#3a3a3a/gi, "#dddddd"],
  [/#ddd\b/gi, "#3f3f3f"],
  [/color:#fff\b/gi, "color:#222222"], // 다크 섹션이 사라지므로 흰 글자 전부 잉크
  [/color:#ffffff\b/gi, "color:#222222"],
];

/** 배경은 흰색이 기본. 숨 고르는 구간 몇 개만 #f7f7f7 */
const SOFT_KEYS = ["무엇부터 해야 할지 모른다", "챌린지가 약속하는", "자주 묻는 질문", "추신"];

function recolor(html) {
  const re = /<div class="sec([^"]*)"/g;
  const bounds = [];
  let m;
  while ((m = re.exec(html))) bounds.push({ i: m.index, len: m[0].length, rest: m[1] });

  let out = "", cursor = 0, lastSoft = false;
  bounds.forEach((b, idx) => {
    const body = html.slice(b.i, bounds[idx + 1] ? bounds[idx + 1].i : html.length);
    const wantSoft = SOFT_KEYS.some((k) => body.includes(k));
    const soft = wantSoft && !lastSoft; // 연속 회색 밴드 금지
    lastSoft = soft;
    const kept = b.rest.replace(/\b(dark|cream|soft)\b/g, "").replace(/\s+/g, " ").trim();
    out += html.slice(cursor, b.i) + `<div class="sec${soft ? " a-soft" : ""}${kept ? " " + kept : ""}"`;
    cursor = b.i + b.len;
  });
  return out + html.slice(cursor);
}

/** 히어로 통계·가격을 시스템의 유일한 큰 타입(64/700)으로 */
function loudMoments(html) {
  // 가격 "195만원" 한 번만 크게
  return html.replace(
    /<div class="h2" style="margin-top:6px">424만원<\/div>/,
    '<div class="h2" style="margin-top:6px">424만원</div>'
  ).replace(
    /(<div class="body-t" style="margin-top:18px">웨비나 참석자는 )<span class="hl">195만원<\/span>/,
    '$1<span class="a-hero-num" style="display:block;margin-top:8px">195만원</span>'
  );
}

function restyle(html) {
  let out = html;
  const s = out.indexOf("<style>"), e = out.indexOf("</style>");
  if (s < 0 || e < 0) throw new Error("style 블록 없음");
  out = out.slice(0, s + 7) + AIRBNB_STYLE + out.slice(e);

  out = recolor(out);
  out = out.replace(/<a href="#apply"[^>]*>/g, '<a href="#apply" class="ab-cta">');

  const cut = out.indexOf("</style>");
  let head = out.slice(0, cut), body = out.slice(cut);
  for (const [re, to] of HEX) body = body.replace(re, to);
  body = body.replace(/background:linear-gradient\([^)]*833AB4[^)]*\)/gi, "background:#ebebeb");
  out = head + body;

  return loudMoments(out);
}

const src = fs.readFileSync("scripts/assets/challenge-detail-preclay.html", "utf8");
const next = restyle(src);
fs.writeFileSync("scripts/assets/challenge-detail-airbnb.html", next);

console.log(`${src.length}자 → ${next.length}자`);
const st = next.slice(next.indexOf("<style>"), next.indexOf("</style>"));
const bodyOnly = next.slice(next.indexOf("</style>"));
const ck = (ok, l) => console.log(`  ${ok ? "✔" : "✘"} ${l}`);
ck(st.includes("--canvas:#ffffff"), "순백 캔버스");
ck(st.includes("--ink:#222222"), "잉크 #222222 (순검정 아님)");
ck(!/#131313|#FFD54A|#e8b94a|833AB4/i.test(bodyOnly), "옛 팔레트 제거");
const rausch = (bodyOnly.match(/#ff385c/gi) || []).length + (st.match(/var\(--rausch\)/g) || []).length;
ck(rausch <= 12, `Rausch 절제 사용 (${rausch}회)`);
ck(!/color:#fff\b/i.test(bodyOnly), "흰 글자 잔존 없음 (다크 섹션 제거됨)");
ck(/border-radius:8px/.test(st) && /border-radius:14px/.test(st) && /9999px/.test(st), "라운드 8/14/pill");
ck((st.match(/box-shadow:var\(--shadow\)/g) || []).length <= 2, "그림자 단일 티어");
ck(st.includes("padding:64px"), "섹션 리듬 64px");
ck(/a-soft/.test(bodyOnly), "회색 밴드 사용");
const o = (next.match(/<div/g) || []).length, c = (next.match(/<\/div>/g) || []).length;
ck(o === c, `div 여닫이 ${o}/${c}`);

if (!WRITE) console.log("\n(미리보기만. 반영: --write)");
else {
  for (const slug of ["5-week-challenge", "5-week-challenge-plus-consulting"]) {
    const p = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!p) continue;
    await prisma.product.update({ where: { id: p.id }, data: { descriptionDesign: next } });
    console.log(`  ✔ ${slug} 반영`);
  }
}
await prisma.$disconnect();
