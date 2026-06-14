import "dotenv/config";
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const FILE = "/Users/yeomhogeun/Downloads/인스타그램_자주묻는질문10 (1).pdf";
const KEY = "live_ebook_url";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const buffer = fs.readFileSync(FILE);
const filename = `ebook-insta-faq10-${Date.now()}.pdf`;

const { error: upErr } = await supabase.storage
  .from("uploads")
  .upload(filename, buffer, { contentType: "application/pdf", upsert: false });
if (upErr) {
  console.error(upErr);
  process.exit(1);
}
const { data } = supabase.storage.from("uploads").getPublicUrl(filename);
const url = data.publicUrl;
console.log("업로드:", url);

await prisma.setting.upsert({
  where: { key: KEY },
  update: { value: url },
  create: { key: KEY, value: url },
});
console.log("Setting 저장 완료:", KEY);

await prisma.$disconnect();
