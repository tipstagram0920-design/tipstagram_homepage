// 웨비나 사전 질문 폼에서 쓰는 선택지·정규화 헬퍼.
// 폼(클라이언트)과 API(서버) 양쪽에서 같은 값을 쓰기 위해 분리했다.

/** 인스타 계정 카테고리 — 프로필에 설정하는 계정 성격 */
export const ACCOUNT_CATEGORIES = [
  "개인 브랜드 · 전문가",
  "매장 · 오프라인 사업",
  "온라인 쇼핑몰 · 판매",
  "코칭 · 상담 · 강의",
  "크리에이터 · 콘텐츠",
  "아직 없음 · 준비 중",
  "기타",
] as const;

export function isValidAccountCategory(v: string): boolean {
  return (ACCOUNT_CATEGORIES as readonly string[]).includes(v);
}

/**
 * 입력한 인스타 계정을 프로필 URL로 정규화한다.
 * "@myshop", "myshop", "instagram.com/myshop", 전체 URL 모두 허용.
 * 형식이 아예 아니면 null.
 */
export function normalizeInstagramUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  // URL 형태면 경로에서 핸들만 뽑는다
  const urlMatch = raw.match(/instagram\.com\/([^/?#\s]+)/i);
  const handle = (urlMatch ? urlMatch[1] : raw).replace(/^@/, "").trim();

  // 인스타 핸들 규칙: 영문/숫자/밑줄/마침표, 최대 30자
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) return null;
  return `https://www.instagram.com/${handle}`;
}

/** 저장된 URL에서 화면 표시용 핸들(@id)만 뽑는다 */
export function instagramHandle(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/instagram\.com\/([^/?#\s]+)/i);
  return m ? `@${m[1]}` : url;
}
