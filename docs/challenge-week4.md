# 5주 챌린지 · 4주차

## 이번 주 구성

| 항목 | 내용 |
|------|------|
| 강의 | Claude Code로 내 일 자동화하기 (VS Code 확장 기준) |
| 강의 노트 | `/resources/claude-code-card-news` — 주차 페이지 "강의 자료" 맨 위에 상시 노출 |
| 숙제 | 레퍼런스 5개를 찾아 변형해 릴스 5개를 올리고 URL 제출 |

## 숙제 폼

- `formData.kind` = **`week4_reels_5`**
- 필드: `reels[] = { refUrl, myUrl, note }`
  - `refUrl` — 참고한 레퍼런스 릴스 URL (필수)
  - `myUrl` — 내가 만들어 올린 릴스 URL (필수)
  - `note` — 어떻게 바꿨는지 한 줄 (선택, AI 피드백 품질에 크게 기여)
- 제출 조건: `refUrl` 5개 + `myUrl` 5개. 부족하면 제출 버튼에서 남은 개수를 안내한다.
- 기본 5칸이 미리 깔려 있고, `릴스 추가` 버튼으로 6개 이상도 가능하다.
- 임시저장(draft)은 검증 없이 저장된다. 마감 전이면 재편집 가능.

## 관련 파일

| 파일 | 역할 |
|------|------|
| `src/app/challenge/[cohortId]/week/[weekIndex]/HomeworkForm.tsx` | 입력 폼 (`isWeek4` 분기) |
| `src/app/challenge/[cohortId]/week/[weekIndex]/SubmissionView.tsx` | 제출 후 읽기 전용 표시 |
| `src/app/challenge/[cohortId]/week/[weekIndex]/page.tsx` | `WEEK_GUIDE`에서 강의 노트 링크 노출 |
| `src/lib/challenge-ai-feedback.ts` | AI 피드백용 제출물 직렬화 (`week4_reels_5` 분기) |
| `scripts/seed-challenge-week4.mjs` | 제목 · 이번 주 안내 · 편지 시드 |

## 강의 노트 링크

주차 페이지의 링크는 DB가 아니라 코드(`WEEK_GUIDE`)에 있다. 업로드 자료(`materials`)가 비어 있어도
항상 노출되고, 기수가 늘어도 자동으로 붙는다. 다른 주차에 노트를 추가하려면 `WEEK_GUIDE`에 한 줄 추가하면 된다.

## 시드 실행

```bash
node scripts/seed-challenge-week4.mjs
```

`weekIndex = 4`인 모든 기수의 주차를 대상으로 `title` / `description` / `homeworkPrompt`만 갱신한다.
일정(`openAt` / `homeworkDueAt`)은 건드리지 않는다.

## AI 자동 피드백

숙제 마감 30분 뒤 크론이 초안을 만든다(`/api/cron/challenge-auto-feedback`). 4주차 평가 관점:

1. 5개를 실제로 채웠는가 (실행량)
2. 레퍼런스를 베낀 게 아니라 자기 상품·고객 이야기로 변형했는가
3. 레퍼런스가 왜 잘 됐는지의 핵심(첫 3초·구성·자막)을 가져왔는가
4. 5개가 서로 다른 각도인가, 같은 포맷 반복인가
5. 1주차에 정의한 소비자·상품과 이어지는가

생성된 피드백은 **초안(미발송)** 상태다. 어드민에서 검토·수정 후 직접 전송해야 학생에게 보인다.
