import "dotenv/config";
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const FILE = "/Users/yeomhogeun/Downloads/상세페이지.png";
const PRODUCT_QUERY = "부스터";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Supabase env missing");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// 1. 상품 후보 출력
const products = await prisma.product.findMany({
  where: { title: { contains: PRODUCT_QUERY } },
  select: { id: true, title: true, slug: true, description: true },
});
console.log("\n후보 상품:");
for (const p of products) {
  console.log(`  - [${p.slug}] ${p.title}  (description ${p.description?.length ?? 0}자)`);
}
if (products.length === 0) {
  console.error("일치 상품 없음. 종료.");
  await prisma.$disconnect();
  process.exit(1);
}

// 가장 좋은 매치: title에 "매출 부스터" 또는 "매출부스터" 우선
const target =
  products.find((p) => p.title.includes("매출")) ||
  products[0];
console.log("\n→ 선택:", target.title, `(slug: ${target.slug})`);

// 2. 기존 description 백업 출력 (앞 500자만)
console.log("\n[기존 description 백업 — 앞 500자]");
console.log(target.description?.slice(0, 500) || "(empty)");

// 3. 파일 업로드
const buffer = fs.readFileSync(FILE);
const filename = `detail-${target.slug}-${Date.now()}.png`;
const { error: upErr } = await supabase.storage
  .from("uploads")
  .upload(filename, buffer, { contentType: "image/png", upsert: false });
if (upErr) {
  console.error("업로드 실패:", upErr);
  await prisma.$disconnect();
  process.exit(1);
}
const { data: pub } = supabase.storage.from("uploads").getPublicUrl(filename);
console.log("\n업로드 URL:", pub.publicUrl);

// 4. description 교체 (백업은 파일로)
const backupPath = `/tmp/${target.slug}-description-backup-${Date.now()}.txt`;
fs.writeFileSync(backupPath, target.description ?? "");
console.log("백업 파일:", backupPath);

const newDescription = `<img src="${pub.publicUrl}" alt="${target.title} 상세" style="width:100%;max-width:1080px;display:block;margin:0 auto;" />`;
await prisma.product.update({
  where: { id: target.id },
  data: { description: newDescription },
});

console.log("\n✓ 업데이트 완료");
console.log("URL:", `/courses/${target.slug}`);

await prisma.$disconnect();
