# 팁스타그램 홈페이지 — Claude 작업 규칙

## 0. 의사소통
- 사용자 대화는 **항상 한국어**로 응답한다.
- 사용자 노출 텍스트(버튼, 라벨, 안내문, 에러 메시지)도 한국어를 기본으로 한다.
- 변수명/함수명/주석은 영어를 기본으로 한다 (코드 일관성).

## 1. 기술 스택 고정값
- Next.js 16 (App Router) + React 19 + TypeScript strict
- Tailwind CSS **v4** — `@theme` CSS 방식. `tailwind.config.js` 만들지 말 것.
- Prisma **7** + `@prisma/adapter-pg` (드라이버 어댑터 필수)
- NextAuth **v5 beta** — `auth()` 헬퍼 사용, `getServerSession` 쓰지 말 것.
- 결제: **PG 중립** (Toss / KakaoPay / NicePay / PortOne 등 가능). 어댑터 패턴으로 분리. 기본 SDK 의존성은 현재 `@tosspayments/tosspayments-sdk`지만 다른 PG로 교체/추가 가능.
- 그 외: Resend(메일) + Vimeo Embed(영상) + Tiptap(에디터)

## 2. Server / Client 컴포넌트
- **Server Components가 기본.** `"use client"`는 다음일 때만 추가:
  - `useState`/`useEffect` 등 React 훅
  - 이벤트 핸들러 (`onClick`, `onChange`)
  - 브라우저 전용 API (`window`, `localStorage`)
- 데이터 조회는 가능한 한 Server Component에서 직접 `prisma.xxx.findMany()`. 클라이언트에서 fetch 라우트 호출은 mutation/실시간 갱신이 필요한 경우에만.

## 3. Prisma 7 주의사항
- `schema.prisma`에 `url`/`directUrl` 넣지 말 것 → `prisma.config.ts`에서 관리.
- `previewFeatures = ["driverAdapters"]` 유지 (deprecated 경고는 무시).
- 마이그레이션은 `npx prisma migrate dev --name <변경요약>`.
- `prisma generate`는 `DATABASE_URL` 환경변수 있어야 동작 → 빌드 전 `.env` 로드 확인.
- 스키마 변경 후 항상 `npx prisma generate` 실행.

## 4. 인증·권한
- 로그인 체크: `const session = await auth()` (서버), 미인증이면 `redirect("/login")`.
- 관리자 페이지(`/admin/*`)는 `session.user.role === "ADMIN"` 체크 필수. `/admin/layout.tsx`에서 가드.
- API 라우트에서도 mutation은 반드시 세션·권한 검증 후 진행. 클라이언트 신뢰 금지.
- 결제 검증은 **반드시 서버에서** PG 시크릿 키로 confirm 호출. PG에 종속되지 않게 `src/lib/payment/`에 어댑터 분리. 클라이언트 응답값만 보고 DB 업데이트 금지.

## 5. 브랜드·UI
- 색상: 인스타그램 그라디언트 `#833AB4 → #FD1D1D → #FCAF45`.
- 공용 클래스: `ig-gradient`, `ig-gradient-text`, `ig-gradient-border` (globals.css 정의).
- 로고는 `src/components/ui/Logo.tsx` 재사용. 새로 그리지 말 것.
- 폼·다이얼로그·드롭다운은 Radix 기반 `src/components/ui/*` 우선 사용. 새로 만들기 전 있는지 먼저 확인.
- 아이콘은 `lucide-react`만 사용. emoji 사용 금지 (사용자 명시 요청시만).

## 6. 파일 구조 규칙
- 페이지: `src/app/(group)/route/page.tsx`
- 페이지 내부 컴포넌트: 해당 페이지 폴더 안에 `_components/`로 둘 것. 전역 재사용 컴포넌트만 `src/components/`로.
- API: `src/app/api/<resource>/route.ts`. RESTful naming.
- 비즈니스 로직: `src/lib/<domain>.ts` (예: `lib/payment.ts`, `lib/course.ts`).

## 7. 데이터·시크릿
- `.env`는 절대 커밋·로그 출력·tool 결과로 노출 금지.
- 새 시크릿 키 필요시 `.env`에 추가 후 사용자에게 값을 채워달라고 안내.
- 개발 DB는 Supabase의 dev 프로젝트. 마이그레이션 적용은 사용자가 명시적으로 요청한 경우에만.

## 8. 작업 진행 방식
- 큰 기능은 먼저 1) 영향받는 파일, 2) DB 스키마 변경 여부, 3) 추가 환경변수 — 3가지를 짧게 정리한 뒤 진행.
- 스키마/결제/인증/관리자 권한 관련 변경은 **반드시 사용자 승인 후** 적용.
- UI 변경 후엔 `npm run dev` 떠 있다면 직접 브라우저 확인 못 한다고 명시 (자동으로 "성공" 보고 금지).
- 빌드 확인: `npm run lint && npx tsc --noEmit` 수준의 정적 검사만 자동 실행 가능.

## 9. 자주 쓰는 명령
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 린트: `npm run lint`
- Prisma 마이그레이션: `npx prisma migrate dev --name <name>`
- Prisma Studio: `npx prisma studio`

## 11. 5주 챌린지 자동 피드백 (규칙)
- 각 주차의 **숙제 마감 시각(`ChallengeWeek.homeworkDueAt`)이 지나고 30분 후**, 그 주에 정식 제출된 숙제들에 대해 AI(Claude, `claude-opus-4-8`)가 강사 피드백 **초안을 자동 생성**한다. (제출 시점 기준 아님 — 마감 시점 기준)
- 마감 시각은 어드민 주차 편집(`/admin/challenge/[cohortId]/weeks/[weekId]/edit` → 일정 → 숙제 마감)에서 조정 가능. 바꾸면 자동 생성 시점도 따라감.
- 자동 생성된 피드백은 **초안(미발송) 상태**로 저장된다 → `feedbackHtml`만 채우고 `feedbackAt`은 비움. **학생에게는 보이지 않음.**
- 어드민(`/admin/challenge/[기수]/weeks/[주차]/submissions`)에서 **"🤖 AI 초안"** 으로 표시되고, 관리자가 **검토·수정 후 "확인 후 전송"(또는 일괄 전송)** 을 눌러야만 학생에게 공개·이메일 발송된다. **자동 발송 금지.**
- 구현: 크론 `/api/cron/challenge-auto-feedback` (10분마다) + `src/lib/challenge-ai-feedback.ts`. 발송 로직은 `src/lib/challenge-feedback.ts` 재사용.
- 환경변수 `ANTHROPIC_API_KEY` 필요(미설정 시 크론은 no-op). draft/임시저장(status=draft)·이미 피드백 있는 제출은 대상 제외.

## 10. 금지 사항
- `tailwind.config.js` 생성 (v4는 CSS @theme 사용)
- `getServerSession` 사용 (v5는 `auth()`)
- 클라이언트에서 결제 confirm 결과만 믿고 DB 변경
- 특정 PG SDK 호출을 결제 라우트/페이지에 직접 박아넣기 (반드시 `lib/payment/` 어댑터 경유)
- `prisma.schema`에 url 직접 작성
- 마이그레이션 없는 스키마 변경
- 사용자 데이터(이메일, 결제정보) 콘솔/로그 출력
