import "dotenv/config";
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const FILE = "/Users/yeomhogeun/Downloads/그렇게 인스타 하면 돈은 못 벌어요.pdf";
const KEY = "ebook2_url";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const buffer = fs.readFileSync(FILE);
const filename = `ebook2-insta-money-${Date.now()}.pdf`;
const { error } = await supabase.storage
  .from("uploads")
  .upload(filename, buffer, { contentType: "application/pdf", upsert: false });
if (error) { console.error(error); process.exit(1); }

const url = supabase.storage.from("uploads").getPublicUrl(filename).data.publicUrl;
console.log("업로드:", url);

await prisma.setting.upsert({
  where: { key: KEY },
  update: { value: url },
  create: { key: KEY, value: url },
});
console.log("Setting 저장 완료:", KEY);
await prisma.$disconnect();
