import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const input = "/Users/yeomhogeun/Desktop/Claud code/tipstagram homepage/IMG_8892.JPG";
const outDir = path.resolve(__dirname, "../../");
const output = path.join(outDir, "booster-thumbnail.jpg");

const W = 1200;
const H = 675;

const photo = await sharp(input)
  .rotate() // EXIF orientation 적용 (사진이 옆으로 누워 있어서)
  .resize({ width: W, height: H, fit: "cover", position: sharp.strategy.attention })
  .toBuffer();

const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="dark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.92"/>
      <stop offset="50%" stop-color="#000000" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#833AB4"/>
      <stop offset="50%" stop-color="#FD1D1D"/>
      <stop offset="100%" stop-color="#FCAF45"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#dark)"/>
  <rect x="64" y="120" width="56" height="4" fill="url(#brand)"/>
  <text x="64" y="190" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif" font-size="28" fill="#FCAF45" font-weight="700" letter-spacing="2">COURSE</text>
  <text x="64" y="300" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif" font-size="70" fill="#FFFFFF" font-weight="800">인스타그램</text>
  <text x="64" y="390" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif" font-size="70" fill="#FFFFFF" font-weight="800">마케팅 부스터</text>
  <rect x="64" y="500" width="220" height="6" fill="url(#brand)"/>
  <text x="64" y="560" font-family="Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif" font-size="24" fill="#E5E5E5" font-weight="500">팔로워·매출을 끌어올리는 실전 강의</text>
</svg>`;

await sharp(photo)
  .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(output);

console.log("done:", output);
