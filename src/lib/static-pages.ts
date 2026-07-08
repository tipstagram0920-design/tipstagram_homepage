/**
 * 코드 기반 정적 페이지 목록. 어드민 페이지 관리에 표시되어 어떤 페이지가 있는지 한눈에 보게 한다.
 * 추가/수정 시 이 배열만 갱신하면 어드민 화면에 반영된다.
 */

export type StaticPageCategory =
  | "메인"
  | "마케팅 랜딩"
  | "강의"
  | "커뮤니티"
  | "인증"
  | "결제"
  | "법적·정책"
  | "기타";

export interface StaticPage {
  path: string;
  title: string;
  desc: string;
  category: StaticPageCategory;
  /** 동적 경로(`[slug]` 같은) 일 때 데모 링크용 예시 path. 비어 있으면 path 그대로 */
  examplePath?: string;
  /** 페이지의 소스 파일 경로 (어드민에서 보고 코드 위치 찾기 쉽게) */
  source: string;
}

export const STATIC_PAGES: StaticPage[] = [
  // 메인
  { path: "/", title: "홈", desc: "메인 페이지(슬라이드·소개·추천 강의·인터뷰)", category: "메인", source: "src/app/page.tsx" },

  // 마케팅 랜딩
  { path: "/live", title: "무료 라이브 신청", desc: "라이브 대기방 신청 폼·강사 실적·라이브 토픽·혜택", category: "마케팅 랜딩", source: "src/app/live/page.tsx" },
  { path: "/ebook", title: "1차 전자책 신청", desc: "이름·이메일 입력 → 1차 전자책 메일 발송", category: "마케팅 랜딩", source: "src/app/ebook/page.tsx" },
  { path: "/ebook/step2", title: "2차 전자책 인증", desc: "인스타 스토리 스크린샷 업로드 → 2차 전자책 메일", category: "마케팅 랜딩", source: "src/app/ebook/step2/page.tsx" },
  { path: "/live/summary", title: "강의 요약본 신청", desc: "@tipstagram2023 태그해 스토리 인증 → 요약본 메일 자동 발송", category: "마케팅 랜딩", source: "src/app/live/summary/page.tsx" },
  { path: "/consultation", title: "1:1 진단 세션 신청", desc: "무료 라이브 한정, 단 5분 선정 1:1 계정 진단 신청 페이지", category: "마케팅 랜딩", source: "src/app/consultation/page.tsx" },

  // 강의
  { path: "/courses", title: "강의 목록", desc: "전체 강의 카드 그리드", category: "강의", source: "src/app/courses/page.tsx" },
  { path: "/courses/[slug]", title: "강의 상세", desc: "강의 소개·커리큘럼·결제 카드", category: "강의", examplePath: "/courses/marketing-booster", source: "src/app/courses/[slug]/page.tsx" },
  { path: "/classroom", title: "내 강의실", desc: "구매한 강의 목록", category: "강의", source: "src/app/classroom/page.tsx" },
  { path: "/classroom/[slug]", title: "강의실 (수강 화면)", desc: "Vimeo/YouTube 플레이어·커리큘럼·진도", category: "강의", examplePath: "/classroom/marketing-booster", source: "src/app/classroom/[slug]/page.tsx" },

  // 커뮤니티
  { path: "/board", title: "게시판", desc: "전체 글 목록", category: "커뮤니티", source: "src/app/board/page.tsx" },
  { path: "/board/[id]", title: "게시글 상세", desc: "글 본문·작성자 정보", category: "커뮤니티", examplePath: "/board", source: "src/app/board/[id]/page.tsx" },
  { path: "/board/write", title: "글쓰기", desc: "Tiptap 에디터로 새 글 작성", category: "커뮤니티", source: "src/app/board/write/page.tsx" },

  // 인증
  { path: "/login", title: "로그인", desc: "이메일/비밀번호 로그인", category: "인증", source: "src/app/(auth)/login/page.tsx" },
  { path: "/register", title: "회원가입", desc: "신규 회원가입 폼", category: "인증", source: "src/app/(auth)/register/page.tsx" },

  // 결제
  { path: "/payment/success", title: "결제 성공", desc: "결제 완료 후 안내 화면", category: "결제", source: "src/app/payment/success/page.tsx" },
  { path: "/payment/fail", title: "결제 실패", desc: "결제 실패 안내 화면", category: "결제", source: "src/app/payment/fail/page.tsx" },

  // 법적·정책
  { path: "/terms", title: "이용약관", desc: "13개 조항 (회사명·환불·저작권 등)", category: "법적·정책", source: "src/app/terms/page.tsx" },
  { path: "/privacy", title: "개인정보처리방침", desc: "수집·이용·보유·제3자 제공 등", category: "법적·정책", source: "src/app/privacy/page.tsx" },
  { path: "/refund", title: "환불규정", desc: "학원법 시행령 별표 4 기준 준용", category: "법적·정책", source: "src/app/refund/page.tsx" },

  // 기타
  { path: "/unsubscribe", title: "메일 수신 거부", desc: "HMAC 토큰으로 수신 거부 처리", category: "기타", source: "src/app/unsubscribe/page.tsx" },
];
