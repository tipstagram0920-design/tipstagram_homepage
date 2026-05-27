import "dotenv/config";
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const PERSON_FILE = "/Users/yeomhogeun/Desktop/Claud code/tipstagram homepage/PNGPNG.png";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// 강사 사진 업로드
const buffer = fs.readFileSync(PERSON_FILE);
const personFile = `instructor-${Date.now()}.png`;
const { error: upErr } = await supabase.storage
  .from("uploads")
  .upload(personFile, buffer, { contentType: "image/png", upsert: false });
if (upErr) {
  console.error(upErr);
  process.exit(1);
}
const PERSON_URL = supabase.storage.from("uploads").getPublicUrl(personFile).data.publicUrl;
console.log("강사 사진:", PERSON_URL);

// 공통 스타일 변수
const FONT = `font-family:'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;`;
const GRAD = `linear-gradient(135deg,#833AB4 0%,#FD1D1D 50%,#FCAF45 100%)`;
const GRAD_TEXT = `background:linear-gradient(90deg,#833AB4,#FD1D1D,#FCAF45);-webkit-background-clip:text;background-clip:text;color:transparent;`;

const html = `
<div style="${FONT}color:#111;max-width:1080px;margin:0 auto;line-height:1.6;">

  <!-- 1) 마감 임박 HERO -->
  <section style="background:#0A0A0A;border-radius:24px;padding:clamp(36px,6vw,72px) clamp(20px,4vw,40px);text-align:center;color:#fff;margin-bottom:clamp(28px,5vw,48px);">
    <p style="font-size:clamp(14px,2vw,16px);font-weight:700;letter-spacing:4px;color:#FCAF45;margin:0 0 12px 0;">LAST CHANCE</p>
    <h2 style="font-size:clamp(30px,6vw,60px);font-weight:900;line-height:1.1;margin:0 0 12px 0;">
      지금 이 가격,<br/>
      <span style="${GRAD_TEXT}">마지막 기회</span>입니다
    </h2>
    <div style="display:inline-block;background:rgba(253,29,29,0.12);border:2px solid #FD1D1D;border-radius:18px;padding:20px 28px;margin:28px 0 24px;max-width:520px;text-align:left;">
      <div style="display:flex;align-items:flex-start;gap:14px;">
        <div style="flex-shrink:0;width:36px;height:36px;border-radius:10px;background:#FD1D1D;color:#fff;font-size:22px;font-weight:900;text-align:center;line-height:36px;">!</div>
        <p style="margin:0;font-size:clamp(14px,2vw,16px);color:#fff;font-weight:500;line-height:1.6;">
          이 페이지를 나가면, <strong style="color:#FCAF45;">지금 보고 계신 이 가격</strong>으로<br/>
          구매할 수 없을지도 모릅니다.
        </p>
      </div>
    </div>
    <p style="font-size:clamp(15px,2.4vw,18px);color:rgba(255,255,255,0.85);margin:24px 0 28px;line-height:1.7;">
      팁스타그램 강의는 희소성 운영 원칙으로<br/>
      <strong style="color:#FCAF45;">매 기수마다 수강료가 인상</strong>됩니다.
    </p>
    <div style="display:grid;gap:10px;max-width:420px;margin:0 auto;">
      ${[
        ["💎", "매 기수 가격이 단계적으로 상승"],
        ["🔥", "매월 선착순 100명만 모집"],
        ["⏳", "다음 기수는 한 달 후에야 개강"],
      ]
        .map(
          ([e, t]) => `
        <div style="display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);border-radius:14px;padding:14px 18px;text-align:left;">
          <span style="font-size:20px;">${e}</span>
          <span style="font-size:15px;font-weight:600;color:#fff;">${t}</span>
        </div>`
        )
        .join("")}
    </div>
  </section>

  <!-- 2) 우유부단의 비용 -->
  <section style="text-align:center;background:#FFFBF3;border:1px solid #FCE6C2;border-radius:24px;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);margin-bottom:clamp(28px,5vw,48px);">
    <div style="display:inline-block;background:${GRAD};border-radius:50%;padding:14px;margin-bottom:18px;">
      <span style="font-size:28px;">📈</span>
    </div>
    <h3 style="font-size:clamp(22px,3.6vw,30px);font-weight:800;margin:0 0 10px 0;color:#111;line-height:1.3;">
      늦게 구매할수록,<br/>
      <span style="${GRAD_TEXT}">더 높은 가격</span>을 지불하게 됩니다
    </h3>
    <p style="margin:14px 0 24px;font-size:clamp(14px,2vw,16px);color:#666;">
      가격은 오르고, 자리는 줄어듭니다.
    </p>
    <div style="display:inline-block;background:#fff;border:2px dashed #FD1D1D;border-radius:18px;padding:18px 28px;">
      <p style="margin:0;font-size:clamp(15px,2.2vw,18px);font-weight:700;color:#FD1D1D;">⏰ 고민하는 시간이 아깝습니다 — 오늘이 가장 저렴합니다.</p>
    </div>
  </section>

  <!-- 3) 비교: 발전 vs 제자리 -->
  <section style="background:${GRAD};border-radius:24px;padding:clamp(36px,6vw,72px) clamp(20px,4vw,40px);color:#fff;margin-bottom:clamp(28px,5vw,48px);text-align:center;">
    <p style="font-size:clamp(16px,2.4vw,20px);font-weight:700;color:rgba(255,255,255,0.95);margin:0 0 32px 0;">
      누군가는 몇 개월 동안<br/>
      <strong style="color:#fff;font-size:clamp(20px,3vw,28px);">발전하고 매출을 올리지만,</strong>
    </p>
    <div style="display:inline-block;background:rgba(255,255,255,0.18);border:2px solid rgba(255,255,255,0.4);border-radius:50%;width:64px;height:64px;line-height:60px;font-size:30px;margin:0 0 28px;">↓</div>
    <p style="font-size:clamp(16px,2.4vw,20px);font-weight:700;color:rgba(255,255,255,0.95);margin:0 0 36px 0;">
      누군가는 여전히<br/>
      <strong style="color:#fff;font-size:clamp(20px,3vw,28px);">제자리에 머무를 것입니다.</strong>
    </p>
    <div style="display:inline-block;background:rgba(0,0,0,0.4);border-radius:20px;padding:24px 28px;backdrop-filter:blur(8px);">
      <h3 style="margin:0 0 8px;font-size:clamp(22px,3.6vw,32px);font-weight:900;color:#fff;">변화하고 싶다면,</h3>
      <p style="margin:0;font-size:clamp(15px,2.2vw,18px);color:#fff;font-weight:600;">저와 함께 <span style="color:#FCAF45;">성공의 지름길</span>을 함께 시작하세요</p>
    </div>
  </section>

  <!-- 4) 강사 소개 -->
  <section style="background:#fff;border:1px solid #EEE;border-radius:24px;padding:clamp(28px,5vw,52px) clamp(20px,4vw,40px);margin-bottom:clamp(28px,5vw,48px);">
    <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 8px 0;">INSTRUCTOR</p>
    <h3 style="font-size:clamp(24px,4vw,34px);font-weight:900;margin:0 0 28px 0;color:#111;line-height:1.3;">
      안녕하세요, <span style="${GRAD_TEXT}">팁스타그램</span>입니다.
    </h3>

    <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start;">
      <div style="flex:1 1 240px;max-width:340px;">
        <div style="position:relative;border-radius:20px;overflow:hidden;background:${GRAD};aspect-ratio:1/1.1;">
          <img src="${PERSON_URL}" alt="강사 사진" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:bottom;" />
        </div>
      </div>
      <div style="flex:1 1 320px;">
        <p style="font-size:clamp(15px,2.2vw,17px);color:#333;line-height:1.85;margin:0 0 16px 0;">
          저는 <strong>처음부터 마케터가 아니었습니다.</strong><br/>
          평범한 직장인으로 시작해, 인스타그램 한 개의 계정에서<br/>
          하루 매출 0원에서 출발했습니다.
        </p>
        <p style="font-size:clamp(15px,2.2vw,17px);color:#333;line-height:1.85;margin:0 0 16px 0;">
          수많은 시행착오 끝에 알고리즘과 콘텐츠 공식을 정리했고,
          그 시스템으로 다양한 분야의 사장님과 1인 사업가의 계정을
          <strong style="color:#FD1D1D;">팔로워 0 → 10K+ 까지</strong> 성장시켰습니다.
        </p>
        <p style="font-size:clamp(15px,2.2vw,17px);color:#333;line-height:1.85;margin:0 0 24px 0;">
          이제는 그 노하우를 정리한 강의를 통해
          <strong>1,200명 이상의 수강생</strong>들과 함께
          진짜 매출이 일어나는 인스타그램을 만들고 있습니다.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">
          ${[
            ["1,200+", "누적 수강생"],
            ["4.9 / 5", "강의 만족도"],
            ["10K+", "팔로워 성장 사례"],
            ["94%", "수료율"],
          ]
            .map(
              ([n, l]) => `
            <div style="background:#FAFAFA;border:1px solid #EEE;border-radius:14px;padding:14px 12px;text-align:center;">
              <div style="font-size:clamp(18px,2.6vw,22px);font-weight:900;${GRAD_TEXT}margin-bottom:2px;">${n}</div>
              <div style="font-size:12px;color:#777;font-weight:600;">${l}</div>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </div>
  </section>

  <!-- 5) 수강생 다양성 -->
  <section style="margin-bottom:clamp(28px,5vw,48px);">
    <div style="text-align:center;margin-bottom:28px;">
      <p style="font-size:13px;font-weight:700;color:#833AB4;letter-spacing:3px;margin:0 0 8px 0;">STUDENTS</p>
      <h3 style="font-size:clamp(22px,3.6vw,30px);font-weight:800;margin:0 0 12px 0;color:#111;line-height:1.3;">
        <span style="${GRAD_TEXT}">20대부터 70대까지</span>,<br/>
        나이·직업과 상관없이 성장하고 있습니다.
      </h3>
      <p style="font-size:clamp(14px,2vw,16px);color:#666;margin:0;">검증된 구조와 시스템은 누구에게나 똑같이 작동합니다.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;max-width:920px;margin:0 auto;">
      ${[
        ["🏋️", "스포츠"],
        ["🍽️", "요식업"],
        ["🛋️", "인테리어"],
        ["☕", "카페"],
        ["🥗", "다이어트"],
        ["🌱", "농부"],
        ["🔮", "무속인"],
        ["📚", "지식사업"],
        ["💅", "미용"],
        ["✂️", "패션"],
        ["🎨", "프리랜서"],
        ["🏥", "전문직"],
      ]
        .map(
          ([e, t]) => `
        <div style="background:#fff;border:1px solid #EEE;border-radius:14px;padding:18px 12px;text-align:center;">
          <div style="font-size:24px;margin-bottom:6px;">${e}</div>
          <div style="font-size:13px;font-weight:700;color:#333;">${t}</div>
        </div>`
        )
        .join("")}
    </div>
  </section>

  <!-- 6) 수강생 후기 영상 -->
  <section style="background:#0F1730;border-radius:24px;padding:clamp(36px,6vw,72px) clamp(20px,4vw,40px);color:#fff;margin-bottom:clamp(28px,5vw,48px);">
    <p style="font-size:13px;font-weight:700;color:#FCAF45;letter-spacing:3px;margin:0 0 8px 0;text-align:center;">REAL VOICES</p>
    <h3 style="font-size:clamp(22px,3.6vw,32px);font-weight:800;margin:0 0 12px 0;color:#fff;text-align:center;line-height:1.3;">
      실제 수강생들의 <span style="${GRAD_TEXT}">인터뷰 영상</span>
    </h3>
    <p style="margin:0 0 32px;text-align:center;font-size:clamp(14px,2vw,16px);color:rgba(255,255,255,0.7);">서로 다른 분야, 같은 결과 — 인스타그램이 바꾼 사장님들의 이야기</p>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;max-width:900px;margin:0 auto;">
      ${[
        { id: "vXHRJNTPfps", name: "네일샵 사장님", desc: "한 콘텐츠로 매출이 달라진 이야기" },
        { id: "MrPrmaKPyyY", name: "음악학원 원장님", desc: "교육 사업이 인스타그램을 만난 후" },
        { id: "ih4jJ2er3eE", name: "무속인", desc: "직종과 상관없이 통하는 시스템" },
      ]
        .map(
          (v) => `
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:12px;">
          <div style="position:relative;width:100%;aspect-ratio:9/16;border-radius:12px;overflow:hidden;background:#000;">
            <iframe
              src="https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1&playsinline=1"
              style="position:absolute;inset:0;width:100%;height:100%;border:0;"
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowfullscreen
              title="${v.name} 인터뷰"
            ></iframe>
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#FD1D1D;"></span>
              <div style="font-size:15px;font-weight:800;color:#fff;">${v.name}</div>
            </div>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.55;">${v.desc}</p>
          </div>
        </div>`
        )
        .join("")}
    </div>

    <p style="margin:28px 0 0;text-align:center;font-size:13px;color:rgba(255,255,255,0.5);">
      ▶ 영상을 누르면 바로 인터뷰가 재생됩니다.
    </p>
  </section>

  <!-- 7) 추가 혜택 -->
  <section style="margin-bottom:clamp(28px,5vw,48px);">
    <div style="text-align:center;margin-bottom:28px;">
      <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 8px 0;">EXTRA BENEFITS</p>
      <h3 style="font-size:clamp(22px,3.6vw,30px);font-weight:800;margin:0 0 8px 0;color:#111;line-height:1.3;">
        강의 외에도 <span style="${GRAD_TEXT}">다양한 혜택</span>을 누릴 수 있습니다
      </h3>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;">
      ${[
        ["🏁", "3주 챌린지 함께 진행", "혼자서는 절대 안 되는 것, 동기·실행을 함께 챙기는 3주 챌린지로 끝까지 달립니다."],
        ["💬", "평생 가는 수강생 카톡방", "수강이 끝나도 끝이 아닙니다. 평생 함께하는 수강생 전용 카톡방에서 피드백·자료·네트워크를 이어갑니다."],
        ["❓", "Q&A 카카오방 참여", "강의 중 궁금한 점, 운영 중 막히는 점을 실시간으로 질문할 수 있습니다."],
        ["📂", "릴스파이 1개월 무료 이용권", "50만 개 이상의 릴스 레퍼런스가 담긴 ‘릴스파이’를 1개월 동안 무료로 이용할 수 있는 이용권을 드립니다."],
        ["🗺️", "지식창업 로드맵 자료", "팔로워 → 매출 전환까지의 단계별 체크리스트와 로드맵 파일을 드립니다."],
        ["🎟️", "오프라인 이벤트 우선 참여권", "정기 모임·세미나·네트워킹 자리에 우선 초대됩니다."],
      ]
        .map(
          ([e, t, d]) => `
        <div style="background:#fff;border:1px solid #EEE;border-radius:18px;padding:22px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="width:40px;height:40px;border-radius:12px;background:${GRAD};color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;">${e}</div>
            <h4 style="margin:0;font-size:16px;font-weight:800;color:#111;">${t}</h4>
          </div>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.65;">${d}</p>
        </div>`
        )
        .join("")}
    </div>
  </section>

  <!-- 8) 자주 묻는 질문 -->
  <section style="margin-bottom:clamp(28px,5vw,48px);">
    <div style="text-align:center;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:700;color:#833AB4;letter-spacing:3px;margin:0 0 8px 0;">FAQ</p>
      <h3 style="font-size:clamp(22px,3.6vw,30px);font-weight:800;margin:0;color:#111;">자주 묻는 질문</h3>
    </div>
    <div style="display:grid;gap:12px;">
      ${[
        ["인스타그램을 잘 모르는데 괜찮을까요?",
         "네, 인스타그램 왕초보를 위한 입문 강의부터 준비되어 있습니다. 기본적인 기능조차 잘 모르는 분들을 위한 입문 강의부터 꼼꼼하게 준비했습니다."],
        ["수강 후 즉시 적용 가능할까요?",
         "네 가능합니다. VOD 강의 내용만 잘 따라오신다면 수강 후 나의 브랜드에 어떻게 적용할 것인지, 기본 세팅부터 콘텐츠 기획까지 모두 직접 하실 수 있습니다."],
        ["강의는 언제든지 구매가 가능한가요?",
         "네 가능합니다. 강의는 구매 후 즉시 내 강의실에서 시청하실 수 있습니다."],
        ["수업이 끝나도 질문할 수 있을까요?",
         "네 물론입니다. 수강생 카톡방을 통해 궁금한 점은 언제든 물어보세요."],
        ["VOD 강의는 영구 소장 가능한가요?",
         "아니요, 영구 소장 불가합니다. VOD 강의 유효 기간은 구매 날짜 기준 4개월입니다. 4개월 이내 익숙해진 강의 시청이 불가하니 반드시 4개월 이내 완강해주세요."],
        ["수강 신청했습니다. 이제 무엇을 기다리나요?",
         "구매 후 24시간 내의 문자로 ‘수강생 오픈 카톡방’으로 초대가 됩니다. 공지사항을 확인 후 ‘20day 챌린지’를 신청합니다. 강의 수강법·동영상을 통해 강의를 수강합니다."],
      ]
        .map(
          ([q, a]) => `
        <details style="background:#fff;border:1px solid #EEE;border-radius:14px;overflow:hidden;">
          <summary style="cursor:pointer;list-style:none;padding:18px 22px;font-size:15px;font-weight:700;color:#111;display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <span><span style="color:#FD1D1D;margin-right:8px;">Q.</span>${q}</span>
            <span style="color:#999;font-size:18px;">+</span>
          </summary>
          <div style="padding:0 22px 20px;font-size:14px;color:#555;line-height:1.7;">
            <span style="color:#833AB4;font-weight:700;margin-right:6px;">A.</span>${a}
          </div>
        </details>`
        )
        .join("")}
    </div>
  </section>

  <!-- 9) 마지막 CTA -->
  <section style="background:#0A0A0A;border-radius:24px;padding:clamp(36px,6vw,72px) clamp(20px,4vw,40px);text-align:center;color:#fff;">
    <p style="font-size:13px;font-weight:700;color:#FCAF45;letter-spacing:4px;margin:0 0 12px 0;">START NOW</p>
    <h3 style="font-size:clamp(24px,4.4vw,40px);font-weight:900;margin:0 0 16px 0;color:#fff;line-height:1.2;">
      선착순 마감 전,<br/>
      <span style="${GRAD_TEXT}">지금 바로 신청</span>하세요
    </h3>
    <p style="margin:0 0 24px;font-size:clamp(14px,2vw,16px);color:rgba(255,255,255,0.8);line-height:1.7;">
      매월 100명, 한정된 자리. 다음 기수까지 한 달을 기다리지 마세요.<br/>
      우측 결제 카드에서 바로 수강 신청을 진행하실 수 있습니다.
    </p>
    <div style="display:inline-block;padding:14px 28px;border-radius:14px;background:${GRAD};color:#fff;font-weight:800;font-size:15px;">
      → 페이지 상단 우측의 결제 카드에서 신청
    </div>
  </section>

</div>
`.trim();

const target = await prisma.product.findFirst({
  where: { slug: "marketing-booster" },
  select: { id: true, description: true },
});

const backupPath = `/tmp/marketing-booster-description-backup-${Date.now()}.html`;
fs.writeFileSync(backupPath, target?.description ?? "");
console.log("백업:", backupPath);

await prisma.product.update({
  where: { id: target.id },
  data: { description: html },
});

console.log(`\n✓ 업데이트 완료 (${html.length.toLocaleString()}자)`);
console.log("확인: https://tipstagram-homepage.vercel.app/courses/marketing-booster");

await prisma.$disconnect();
