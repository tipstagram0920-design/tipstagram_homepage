import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 누락");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: list, error: listErr } = await supabase.storage.listBuckets();
if (listErr) {
  console.error("listBuckets error:", listErr);
  process.exit(1);
}

const exists = list?.some((b) => b.name === "uploads");
if (exists) {
  console.log("'uploads' 버킷 이미 존재");
} else {
  const { error: createErr } = await supabase.storage.createBucket("uploads", {
    public: true,
    fileSizeLimit: 1024 * 1024 * 10, // 10 MB
  });
  if (createErr) {
    console.error("createBucket error:", createErr);
    process.exit(1);
  }
  console.log("'uploads' 버킷 생성 완료 (public)");
}
