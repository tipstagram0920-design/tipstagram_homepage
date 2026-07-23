import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 별도 프로젝트 reelspy의 Supabase에 직접 접속해 참고 릴스를 조회한다(서버 전용).
// 필요한 env: REELSPY_SUPABASE_URL, REELSPY_SUPABASE_SERVICE_ROLE_KEY

export const REELSPY_CATEGORIES = [
  "비즈니스재테크",
  "라이프스타일",
  "전문직교육",
  "푸드",
  "여행",
  "취미창작",
] as const;

export interface ReelspyReel {
  id: string;
  reel_url: string;
  thumbnail_url: string | null;
  view_count: number | null;
  like_count: number | null;
  username: string | null;
  caption: string | null;
  claude_summary: string | null;
  category_main: string | null;
}

let cached: SupabaseClient | null = null;
function getClient(): SupabaseClient | null {
  const url = process.env.REELSPY_SUPABASE_URL;
  const key = process.env.REELSPY_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!cached) cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export function isReelspyConfigured(): boolean {
  return !!process.env.REELSPY_SUPABASE_URL && !!process.env.REELSPY_SUPABASE_SERVICE_ROLE_KEY;
}

// ILIKE 안전화 (reelspy와 동일 규칙)
function sanitize(q: string): string {
  return q.replace(/[%_(),]/g, " ").trim().slice(0, 80);
}

export async function searchReels(opts: {
  q?: string;
  category?: string;
  limit?: number;
}): Promise<{ configured: boolean; items: ReelspyReel[]; error?: string }> {
  const client = getClient();
  if (!client) return { configured: false, items: [] };

  const limit = Math.min(Math.max(opts.limit ?? 12, 1), 30);
  let query = client
    .from("reels")
    .select("id, reel_url, thumbnail_url, view_count, like_count, username, caption, claude_summary, category_main")
    .order("view_count", { ascending: false })
    .limit(limit);

  const q = opts.q ? sanitize(opts.q) : "";
  if (q) {
    query = query.or(
      [
        `caption.ilike.%${q}%`,
        `thumbnail_text.ilike.%${q}%`,
        `claude_summary.ilike.%${q}%`,
        `username.ilike.%${q}%`,
      ].join(",")
    );
  }
  if (opts.category && (REELSPY_CATEGORIES as readonly string[]).includes(opts.category)) {
    query = query.eq("category_main", opts.category);
  }

  const { data, error } = await query;
  if (error) return { configured: true, items: [], error: error.message };
  return { configured: true, items: (data ?? []) as ReelspyReel[] };
}
