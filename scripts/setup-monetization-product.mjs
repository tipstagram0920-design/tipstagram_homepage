// 100만원 단일 상품 "팁스타그램 수익화 프로그램" 만들기 + 기존 상품 판매 숨김 (기존 구매자 접근은 유지)
// 사용: node scripts/setup-monetization-product.mjs --dry   (확인만)
//       node scripts/setup-monetization-product.mjs         (적용)
import "dotenv/config";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const DRY = process.argv.includes("--dry");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const SLUG = "monetization-program";
const HIDE = ["marketing-booster", "5-week-challenge", "5-week-challenge-plus-consulting"];
const landing = fs.readFileSync(new URL("./monetization-landing.html", import.meta.url), "utf8");

const data = {
  slug: SLUG,
  title: "팁스타그램 수익화 프로그램",
  subtitle: "내 컴퓨터에 설치하는 수익화 스튜디오 + 인스타 마케팅 강의 전부",
  description: "브랜드만 적어두면 소재 찾기 → 카드뉴스 → 릴스(그림·자막·목소리)까지 버튼 몇 번으로 만드는 프로그램과, 인스타그램 마케팅 부스터 강의 전부를 함께 드립니다.",
  descriptionDesign: landing,
  price: 1000000,
  thumbnail: `/api/og/course/${SLUG}`,
  highlights: [
    "팁스타그램 수익화 스튜디오 — 내 컴퓨터에 설치, 평생 사용",
    "소재 찾기 → 카드뉴스 → 릴스(그림·자막·목소리) 자동 제작",
    "인스타그램 마케팅 부스터 강의 전부 (평생 이용권)",
    "설치는 파일 하나 더블클릭, 그림으로 보는 설치 안내",
    "업데이트 무료 — 설치 파일 다시 실행하면 끝",
  ],
  isActive: true,
  order: 0,
};

const before = await prisma.product.findMany({ orderBy: { order: "asc" }, select: { slug: true, title: true, price: true, isActive: true, order: true } });
console.log("현재:"); before.forEach((p) => console.log(`  ${p.isActive ? "●" : "○"} [${p.order}] ${p.slug} ${p.price.toLocaleString()}원`));

if (DRY) {
  console.log(`\n(확인만) 만들/갱신할 상품: ${SLUG} ${data.price.toLocaleString()}원, 랜딩 ${landing.length}자`);
  console.log(`(확인만) 숨길 상품: ${HIDE.join(", ")}`);
} else {
  const p = await prisma.product.upsert({ where: { slug: SLUG }, create: data, update: data });
  console.log(`\n✓ ${p.slug} ${p.isActive ? "판매중" : "숨김"} ${p.price.toLocaleString()}원 (id ${p.id})`);
  const r = await prisma.product.updateMany({ where: { slug: { in: HIDE } }, data: { isActive: false } });
  console.log(`✓ 숨김 처리 ${r.count}개: ${HIDE.join(", ")} (기존 구매자 접근은 그대로)`);
  const after = await prisma.product.findMany({ orderBy: { order: "asc" }, select: { slug: true, price: true, isActive: true, order: true } });
  console.log("이후:"); after.forEach((p) => console.log(`  ${p.isActive ? "●" : "○"} [${p.order}] ${p.slug} ${p.price.toLocaleString()}원`));
}
await prisma.$disconnect(); await pool.end();
