import sharp from "sharp";

const input = "/Users/yeomhogeun/Desktop/Claud code/tipstagram homepage/PNGPNG.png";
const output = "/Users/yeomhogeun/Desktop/Claud code/tipstagram homepage/booster-thumbnail.jpg";

const W = 1200;
const H = 675;

// 1) 배경 — 인스타 그라디언트 + 어두운 비네팅으로 텍스트 가독성 ↑
const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#5b2887"/>
      <stop offset="45%" stop-color="#c11a3a"/>
      <stop offset="100%" stop-color="#FCAF45"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.25" cy="0.5" r="0.85">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <rect width="100%" height="100%" fill="url(#vignette)"/>
</svg>`;

// 2) 인물 — 더 크게(680), 우측에 거의 붙여서 캔버스 가득 채움
const PERSON_HEIGHT = 670;
const person = await sharp(input)
  .resize({ height: PERSON_HEIGHT, fit: "inside" })
  .png()
  .toBuffer();
const meta = await sharp(person).metadata();
const personW = meta.width ?? 0;
const personH = meta.height ?? 0;

const personLeft = W - personW + 10; // 우측 끝에 살짝 걸치게
const personTop = H - personH;

// 3) 텍스트 + 데코 오버레이 (인물 위로 가는 부분도 있어서 인물 합성 후 얹음)
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#833AB4"/>
      <stop offset="50%" stop-color="#FD1D1D"/>
      <stop offset="100%" stop-color="#FCAF45"/>
    </linearGradient>
    <linearGradient id="dark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.78"/>
      <stop offset="55%" stop-color="#000000" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <style>
      .h { font-family: "Apple SD Gothic Neo", "Noto Sans CJK KR", sans-serif; font-weight: 900; }
      .b { font-family: "Apple SD Gothic Neo", "Noto Sans CJK KR", sans-serif; font-weight: 700; }
      .r { font-family: "Apple SD Gothic Neo", "Noto Sans CJK KR", sans-serif; font-weight: 500; }
      .mono { font-family: "SF Mono", "Menlo", monospace; font-weight: 700; }
    </style>
  </defs>

  <!-- 좌측 가독성용 검정 페이드 -->
  <rect width="100%" height="100%" fill="url(#dark)"/>

  <!-- 거대한 백그라운드 워터마크 -->
  <text x="-30" y="595" class="h" font-size="280" fill="#FFFFFF" opacity="0.07" letter-spacing="-6">BOOSTER</text>

  <!-- 상단 라벨 + 별점 -->
  <g transform="translate(64, 96)">
    <rect x="0" y="0" width="120" height="32" rx="16" fill="url(#brand)"/>
    <text x="60" y="22" class="b" font-size="14" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">COURSE</text>
  </g>
  <text x="208" y="118" class="b" font-size="16" fill="#FCAF45" letter-spacing="2">★ ★ ★ ★ ★</text>
  <text x="320" y="118" class="r" font-size="14" fill="#F5F5F5" opacity="0.85">수강생 평점</text>

  <!-- 메인 타이틀 -->
  <text x="64" y="240" class="h" font-size="78" fill="#FFFFFF">인스타그램</text>
  <text x="64" y="330" class="h" font-size="78" fill="#FFFFFF">마케팅 <tspan fill="#FCAF45">부스터</tspan></text>

  <!-- 액센트 라인 + 영문 카피 -->
  <rect x="64" y="362" width="64" height="5" fill="url(#brand)"/>
  <text x="142" y="370" class="mono" font-size="15" fill="#FCAF45" letter-spacing="4">INSTAGRAM · MARKETING · BOOSTER</text>

  <!-- 서브 카피 -->
  <text x="64" y="424" class="b" font-size="22" fill="#FFFFFF">팔로워·매출을 끌어올리는 실전 강의</text>

  <!-- 하단 키 포인트 -->
  <g transform="translate(64, 480)">
    <rect x="0" y="0" width="118" height="58" rx="14" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)"/>
    <text x="59" y="26" class="r" font-size="11" fill="#FCAF45" text-anchor="middle" letter-spacing="2">FOLLOWERS</text>
    <text x="59" y="48" class="h" font-size="20" fill="#FFFFFF" text-anchor="middle">+10K</text>
  </g>
  <g transform="translate(196, 480)">
    <rect x="0" y="0" width="118" height="58" rx="14" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)"/>
    <text x="59" y="26" class="r" font-size="11" fill="#FCAF45" text-anchor="middle" letter-spacing="2">CONVERSION</text>
    <text x="59" y="48" class="h" font-size="20" fill="#FFFFFF" text-anchor="middle">300%</text>
  </g>
  <g transform="translate(328, 480)">
    <rect x="0" y="0" width="118" height="58" rx="14" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)"/>
    <text x="59" y="26" class="r" font-size="11" fill="#FCAF45" text-anchor="middle" letter-spacing="2">CHAPTERS</text>
    <text x="59" y="48" class="h" font-size="20" fill="#FFFFFF" text-anchor="middle">6강</text>
  </g>

  <!-- 우측 상단 데코 (스파클 점) -->
  <circle cx="1140" cy="60" r="4" fill="#FCAF45"/>
  <circle cx="1100" cy="90" r="2.5" fill="#FFFFFF" opacity="0.7"/>
  <circle cx="1160" cy="105" r="2" fill="#FFFFFF" opacity="0.5"/>

  <!-- 우측 하단 브랜드 와터마크 -->
  <text x="${W - 32}" y="${H - 28}" class="b" font-size="14" fill="#FFFFFF" opacity="0.7" text-anchor="end" letter-spacing="3">TIPSTAGRAM</text>
</svg>`;

await sharp(Buffer.from(bg))
  .composite([
    { input: person, top: Math.round(personTop), left: Math.round(personLeft) },
    { input: Buffer.from(overlay), top: 0, left: 0 },
  ])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(output);

console.log("done:", output, `(person ${personW}x${personH})`);
