import sharp from "sharp";

const input = "/Users/yeomhogeun/Downloads/상세페이지.png";

// 너비 720으로 리사이즈 후 8개 부분으로 자르기
const TARGET_W = 720;
const meta = await sharp(input).metadata();
const ratio = TARGET_W / meta.width;
const resizedH = Math.round(meta.height * ratio);
const PARTS = 8;
const partH = Math.ceil(resizedH / PARTS);

const resized = await sharp(input).resize({ width: TARGET_W }).png().toBuffer();

for (let i = 0; i < PARTS; i++) {
  const top = i * partH;
  const h = Math.min(partH, resizedH - top);
  if (h <= 0) break;
  await sharp(resized)
    .extract({ left: 0, top, width: TARGET_W, height: h })
    .png()
    .toFile(`/tmp/detail-part-${i + 1}.png`);
  console.log(`part ${i + 1}: top=${top} h=${h}`);
}
