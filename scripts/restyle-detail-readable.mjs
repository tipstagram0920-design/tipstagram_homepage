// 상세페이지 재디자인 — 한글 장문 세일즈 페이지 기준으로 "읽히는 것"을 1순위로.
//
// 앞선 두 번(Clay / Airbnb)의 실패 원인과 이번 처방:
//   ① 글줄이 너무 길었다. 원본은 max-width:800px 였는데 1280px 로 넓혀버렸다.
//      → 본문 측정폭(measure)을 640px 로 고정. 한글은 한 줄 35~45자가 편하다.
//   ② 라틴 디스플레이용 음수 자간(-2.5px, -1px)을 한글에 그대로 썼다. 한글은 뭉갠다.
//      → px 자간 폐기. 큰 제목만 -0.02em, 본문은 0. (em 기준이라 크기 따라 비례)
//   ③ 행간 1.5 는 한글에 좁다. → 본문 1.8, 제목 1.4.
//   ④ 폰트가 라틴 우선이라 한글이 제각각 폴백됐다. → Pretendard 우선 로드.
//
// 위계는 색 블록이 아니라 **크기 · 굵기 · 여백**으로 만든다.
// 강조색은 브랜드(인스타 그라디언트) 계열 한 색만 CTA·가격에 쓴다.
//
// 실행: node scripts/restyle-detail-readable.mjs [--write]
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

const STYLE = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css');

/* ── 한글 장문 가독성 우선 설계 ────────────────────────────────
   측정폭 640px · 행간 1.8 · 자간 em 기준 · 위계는 크기와 여백으로
   ──────────────────────────────────────────────────────────── */
.product-landing{
  --ink:#17171a; --body:#43454b; --muted:#7b7d85; --faint:#a3a5ac;
  --line:#e8e8ec; --line-soft:#f1f1f4;
  --bg:#ffffff; --bg-soft:#f8f8fa; --bg-ink:#17171a;
  --accent:#e8365d;              /* 브랜드 계열 단일 강조색 */
  --accent-soft:#fdeef2;
  max-width:820px; margin:0 auto; background:var(--bg); color:var(--ink);
  font-family:Pretendard,'Pretendard Variable','Apple SD Gothic Neo','Noto Sans KR',
              -apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  font-size:17px; line-height:1.8; letter-spacing:0;
  word-break:keep-all;           /* 한글 단어 중간에서 안 끊기게 */
  -webkit-font-smoothing:antialiased;
}
.product-landing *{margin:0;padding:0;box-sizing:border-box}

/* 섹션 — 색 블록 대신 여백과 얇은 선으로 구분 */
.product-landing .sec{width:100%;background:var(--bg);color:var(--ink)}
/* 측정폭 640px 단을 패딩으로 만든다.
   .sec > * 에 max-width 를 걸면 igbar 같은 좁은 요소가 가운데로 밀린다. */
.product-landing .pad{padding:72px max(22px, calc((100% - 640px) / 2))}
.product-landing .hero{padding:72px max(22px, calc((100% - 640px) / 2)) 60px}
.product-landing .r-soft{background:var(--bg-soft)}
.product-landing .r-ink{background:var(--bg-ink);color:#fff}
.product-landing .r-line{border-top:1px solid var(--line-soft)}
@media (max-width:760px){
  .product-landing .pad,.product-landing .hero{padding:52px 22px}
  .product-landing{font-size:16px}
}

/* 타이포 — 자간은 em, 큰 제목만 살짝 좁힌다 */
.product-landing .h1,.product-landing .line-lg{
  font-size:40px;font-weight:800;line-height:1.35;letter-spacing:-0.022em;color:inherit}
.product-landing .h2{font-size:29px;font-weight:800;line-height:1.4;letter-spacing:-0.018em;color:inherit}
.product-landing .h3{font-size:22px;font-weight:700;line-height:1.45;letter-spacing:-0.012em;color:inherit}
.product-landing .line-sm{font-size:19px;font-weight:600;line-height:1.5;letter-spacing:-0.01em;color:var(--muted);margin-bottom:8px}
.product-landing .storyquote{font-size:25px;font-weight:700;line-height:1.55;letter-spacing:-0.015em;color:inherit}
.product-landing .body-t{font-size:17px;font-weight:400;line-height:1.8;letter-spacing:0;color:var(--body)}
.product-landing .body-s{font-size:16px;font-weight:400;line-height:1.75;letter-spacing:0;color:var(--body)}
.product-landing .small{font-size:14px;font-weight:400;line-height:1.7;letter-spacing:0;color:var(--muted)}
.product-landing .serif{font-family:inherit}
.product-landing .gray,.product-landing .lgray{color:var(--muted)}
.product-landing .r-ink .body-t,.product-landing .r-ink .body-s{color:rgba(255,255,255,.82)}
.product-landing .r-ink .gray,.product-landing .r-ink .lgray,.product-landing .r-ink .small{color:rgba(255,255,255,.62)}
.product-landing .yellow{color:var(--accent);font-weight:700}
.product-landing .r-ink .yellow{color:#ff8fa6}
@media (max-width:760px){
  .product-landing .h1,.product-landing .line-lg{font-size:29px;line-height:1.4}
  .product-landing .h2{font-size:23px}
  .product-landing .h3,.product-landing .storyquote{font-size:19px}
  .product-landing .line-sm{font-size:17px}
  .product-landing .body-t{font-size:16px}
}

/* 큰 숫자 한 번 — 가격 */
.product-landing .r-num{font-size:52px;font-weight:800;line-height:1.2;letter-spacing:-0.02em;color:var(--accent)}

/* 라벨·강조 */
.product-landing .tape{display:inline-block;background:var(--accent-soft);color:var(--accent);
  font-size:13px;font-weight:700;letter-spacing:0;padding:6px 14px;border-radius:8px;transform:none;box-shadow:none}
.product-landing .r-ink .tape{background:rgba(255,255,255,.14);color:#fff}
.product-landing .tape.straight{transform:none}
.product-landing .stamp{display:inline-block;background:transparent;border:1.5px solid var(--accent);color:var(--accent);
  font-size:13px;font-weight:700;letter-spacing:0;padding:5px 13px;border-radius:8px;transform:none}
.product-landing .hl{background:linear-gradient(transparent 58%, rgba(232,54,93,.16) 58%);
  color:inherit;font-weight:700;padding:0 1px}
.product-landing .r-ink .hl{background:linear-gradient(transparent 58%, rgba(255,143,166,.28) 58%);color:#fff}
.product-landing .hl-red{background:var(--accent);color:#fff;padding:2px 8px;border-radius:6px;font-weight:700}
.product-landing .igbar{height:3px;width:64px;background:var(--accent);border-radius:2px}
.product-landing .divider-zig{display:none}

/* 체크 리스트 — 행간 넉넉히 */
.product-landing .chk{display:flex;gap:12px;margin-bottom:18px;align-items:flex-start}
.product-landing .chk .box{flex:0 0 auto;width:auto;padding-top:5px}
.product-landing .chk .box span{display:inline-flex;align-items:center;justify-content:center;
  width:22px;height:22px;border:0;border-radius:7px;background:var(--accent-soft);color:var(--accent);
  font-size:12px;font-weight:800}
.product-landing .r-ink .chk .box span{background:rgba(255,255,255,.16);color:#fff}
.product-landing .chk .txt{display:block;font-size:17px;font-weight:400;line-height:1.75;letter-spacing:0;color:var(--body)}
.product-landing .r-ink .chk .txt{color:rgba(255,255,255,.85)}

/* 카드 */
.product-landing .grid{width:100%;display:flex;flex-wrap:wrap;gap:10px;text-align:left}
.product-landing .card2{flex:1 1 calc(50% - 5px);min-width:220px;display:block;width:auto;vertical-align:top;
  background:var(--bg-soft);border:1px solid var(--line-soft);border-radius:14px;padding:20px;margin:0}
.product-landing .r-ink .card2{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14)}
.product-landing .card2 .t{font-size:17px;font-weight:700;letter-spacing:-0.01em;margin-bottom:5px;color:inherit}
.product-landing .card2 .n{font-size:13px;color:var(--faint);margin-bottom:8px}
.product-landing .card2 .d{font-size:15px;line-height:1.7;color:var(--body)}
.product-landing .r-ink .card2 .d{color:rgba(255,255,255,.78)}
@media (max-width:760px){.product-landing .card2{flex:1 1 100%}}

.product-landing .resbar{background:var(--bg-soft);border:1px solid var(--line-soft);border-radius:14px;
  padding:8px 22px;margin-top:22px;color:var(--ink)}
.product-landing .r-ink .resbar{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14);color:#fff}
.product-landing .res{display:flex;justify-content:space-between;gap:16px;padding:14px 0;align-items:baseline}
.product-landing .res .who{display:block;font-size:15px;line-height:1.6;color:var(--muted);width:auto}
.product-landing .r-ink .res .who{color:rgba(255,255,255,.68)}
.product-landing .res .num{display:block;text-align:right;font-size:16px;font-weight:700;white-space:nowrap;color:inherit}

.product-landing .statbox{margin-top:30px;border:1px solid var(--line);border-radius:14px;padding:4px 0;background:var(--bg)}
.product-landing .r-ink .statbox{border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.05)}
.product-landing .statrow{display:flex;justify-content:space-between;gap:16px;padding:16px 22px;align-items:center}
.product-landing .statrow .k{display:block;width:auto;font-size:15px;color:var(--muted)}
.product-landing .r-ink .statrow .k{color:rgba(255,255,255,.66)}
.product-landing .statrow .v{display:block;text-align:right;font-size:20px;font-weight:800;letter-spacing:-0.015em;white-space:nowrap}
.product-landing .statdiv,.product-landing .resdiv{height:1px;background:var(--line-soft);margin:0 22px}
.product-landing .r-ink .statdiv{background:rgba(255,255,255,.14)}

.product-landing .ba{border:1px solid var(--line);border-radius:14px;margin-top:24px;overflow:hidden}
.product-landing .r-ink .ba{border-color:rgba(255,255,255,.18)}
.product-landing .ba .row{display:flex;flex-wrap:wrap}
.product-landing .ba .cell{flex:1 1 50%;display:block;width:auto;padding:22px;vertical-align:top;min-width:240px}
.product-landing .ba .cell.right{border-left:1px solid var(--line-soft)}
.product-landing .r-ink .ba .cell.right{border-left-color:rgba(255,255,255,.14)}
.product-landing .ba .lab{font-size:13px;font-weight:700;letter-spacing:0;margin-bottom:10px;color:var(--muted)}
.product-landing .r-ink .ba .lab{color:rgba(255,255,255,.6)}
.product-landing .ba .txt{font-size:16px;line-height:1.75;color:var(--body)}
.product-landing .r-ink .ba .txt{color:rgba(255,255,255,.82)}
@media (max-width:760px){
  .product-landing .ba .cell{flex:1 1 100%}
  .product-landing .ba .cell.right{border-left:0;border-top:1px solid var(--line-soft)}
}

/* 여백 유틸 */
.product-landing .mb16{margin-bottom:14px}.product-landing .mb24{margin-bottom:20px}
.product-landing .mb32{margin-bottom:26px}.product-landing .mb40{margin-bottom:32px}
.product-landing .mb48{margin-bottom:40px}
.product-landing .mt16{margin-top:14px}.product-landing .mt24{margin-top:20px}
.product-landing .mt32{margin-top:26px}.product-landing .mt40{margin-top:32px}
.product-landing .mt48{margin-top:40px}
.product-landing .center{text-align:center}.product-landing .right{text-align:right}
.product-landing .strike{text-decoration:line-through;color:var(--faint)}

/* CTA */
.product-landing a.r-cta{display:inline-block;background:var(--accent);color:#fff;
  font-size:17px;font-weight:700;letter-spacing:-0.01em;line-height:1.4;padding:17px 34px;border-radius:12px;
  text-decoration:none;box-shadow:none}
.product-landing .r-ink a.r-cta{background:#fff;color:var(--ink)}

.product-landing .pricebox,.product-landing .prob,.product-landing .faq,.product-landing .dcard,
.product-landing .wk3box,.product-landing .pframe{border-radius:14px}
.product-landing .vline,.product-landing .spine,.product-landing .bdiv{background:var(--line-soft)}
.product-landing img{max-width:100%;border-radius:14px;display:block}
`;

// 옛 팔레트 정리
const HEX = [
  [/#131313/gi, "#17171a"], [/#1a1a1a/gi, "#17171a"], [/#0a0a0a/gi, "#17171a"],
  [/#222222/gi, "#17171a"],
  [/#FFD54A/gi, "#e8365d"], [/#e8b94a/gi, "#e8365d"],
  [/#FF3B30/gi, "#e8365d"], [/#ff385c/gi, "#e8365d"],
  [/#F4F4F2/gi, "#f8f8fa"], [/#FFF7DC/gi, "#f8f8fa"], [/#f5f0e0/gi, "#f8f8fa"],
  [/#fffaf0/gi, "#ffffff"], [/#f7f7f7/gi, "#f8f8fa"],
  [/#B9B9B9/gi, "#7b7d85"], [/#a0a0a0/gi, "#7b7d85"], [/#7a7a7a/gi, "#7b7d85"],
  [/#8a8a8a/gi, "#a3a5ac"], [/#929292/gi, "#a3a5ac"], [/#6a6a6a/gi, "#7b7d85"],
  [/#3a3a3a/gi, "#e8e8ec"], [/#3f3f3f/gi, "#43454b"], [/#ddd\b/gi, "#43454b"],
];

/**
 * 배경 배치 — 대부분 흰 면. 숨 고르는 곳만 연회색, 서사 정점 두 곳만 잉크.
 * 원래 .dark 였던 섹션 중 "스토리"와 "두 갈래 미래"만 어둡게 남기고
 * 나머지는 흰 면으로 올린다(흰 글자는 아래에서 일괄 보정).
 */
const INK_KEYS = ["이 챌린지를 만든 이유", "어차피 지나갑니다"];
const SOFT_KEYS = ["무엇부터 해야 할지 모른다", "챌린지가 약속하는", "받는 것을 다 합치면", "자주 묻는 질문"];

function recolor(html) {
  const re = /<div class="sec([^"]*)"/g;
  const bounds = [];
  let m;
  while ((m = re.exec(html))) bounds.push({ i: m.index, len: m[0].length, rest: m[1] });

  let out = "", cursor = 0, prev = "";
  bounds.forEach((b, idx) => {
    const seg = html.slice(b.i, bounds[idx + 1] ? bounds[idx + 1].i : html.length);
    let tone = "";
    if (INK_KEYS.some((k) => seg.includes(k))) tone = "r-ink";
    else if (SOFT_KEYS.some((k) => seg.includes(k)) && prev !== "r-soft") tone = "r-soft";
    // 흰 면이 연달아 오면 얇은 선으로 경계를 준다
    const line = !tone && prev === "" ? " r-line" : "";
    prev = tone;
    const kept = b.rest.replace(/\b(dark|cream|soft)\b/g, "").replace(/\s+/g, " ").trim();
    out += html.slice(cursor, b.i) + `<div class="sec${tone ? " " + tone : ""}${line}${kept ? " " + kept : ""}"`;
    cursor = b.i + b.len;
  });
  return out + html.slice(cursor);
}

/** 밝은 섹션에 남은 인라인 흰 글자를 잉크로 (다크→라이트 이동분) */
function fixContrast(html) {
  const re = /<div class="sec([^"]*)"/g;
  const bounds = [];
  let m;
  while ((m = re.exec(html))) bounds.push({ i: m.index, ink: /r-ink/.test(m[1]) });
  let out = "", cursor = 0;
  bounds.forEach((b, i) => {
    const end = bounds[i + 1] ? bounds[i + 1].i : html.length;
    let seg = html.slice(b.i, end);
    if (!b.ink) seg = seg.replace(/color:#fff\b/gi, "color:#17171a").replace(/color:#ffffff\b/gi, "color:#17171a");
    out += html.slice(cursor, b.i) + seg;
    cursor = end;
  });
  return out + html.slice(cursor);
}

function restyle(html) {
  let out = html;
  const s = out.indexOf("<style>"), e = out.indexOf("</style>");
  out = out.slice(0, s + 7) + STYLE + out.slice(e);

  out = recolor(out);
  out = out.replace(/<a href="#apply"[^>]*>/g, '<a href="#apply" class="r-cta">');

  const cut = out.indexOf("</style>");
  let head = out.slice(0, cut), body = out.slice(cut);
  for (const [re, to] of HEX) body = body.replace(re, to);
  body = body.replace(/background:linear-gradient\([^)]*833AB4[^)]*\)/gi, "background:#e8e8ec");
  out = head + body;

  out = fixContrast(out);
  // 가격 한 번만 크게
  out = out.replace(
    /(웨비나 참석자는 )<span class="hl">195만원<\/span>/,
    '$1<span class="r-num" style="display:block;margin-top:10px">195만원</span>'
  );
  return out;
}

const src = fs.readFileSync("scripts/assets/challenge-detail-preclay.html", "utf8");
const next = restyle(src);
fs.writeFileSync("scripts/assets/challenge-detail-readable.html", next);

const st = next.slice(next.indexOf("<style>"), next.indexOf("</style>"));
const body = next.slice(next.indexOf("</style>"));
const ck = (ok, l) => console.log(`  ${ok ? "✔" : "✘"} ${l}`);
console.log(`${src.length}자 → ${next.length}자`);
ck(st.includes("calc((100% - 640px) / 2)"), "본문 측정폭 640px (한 줄 35~45자)");
ck(!/letter-spacing:-[0-9.]+px/.test(st), "px 음수 자간 없음 (전부 em)");
ck(st.includes("line-height:1.8"), "본문 행간 1.8");
ck(st.includes("Pretendard"), "한글 폰트 Pretendard 우선");
ck(st.includes("word-break:keep-all"), "한글 단어 안 끊김");
ck(!/#131313|#FFD54A|833AB4|#ff385c/i.test(body), "옛 팔레트 제거");
ck(!/color:#fff\b/i.test(body.replace(/r-ink[\s\S]{0,4000}?(?=<div class="sec)/g, "")), "밝은 면 흰 글자 없음");
const o = (next.match(/<div/g) || []).length, c = (next.match(/<\/div>/g) || []).length;
ck(o === c, `div 여닫이 ${o}/${c}`);
const tones = [...body.matchAll(/<div class="sec([^"]*)"/g)].map((x) =>
  /r-ink/.test(x[1]) ? "잉크" : /r-soft/.test(x[1]) ? "연회색" : "흰색"
);
console.log("  배경 배치:", tones.join(" "));

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
