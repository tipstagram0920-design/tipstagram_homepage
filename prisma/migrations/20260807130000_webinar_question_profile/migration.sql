-- 사전 질문에 질문자 프로필 정보 추가 (인스타 계정 · 계정 카테고리 · 업종)
-- 모두 nullable 컬럼 추가라 기존 행에 영향 없음.
ALTER TABLE "webinar_questions" ADD COLUMN "instagramUrl" TEXT;
ALTER TABLE "webinar_questions" ADD COLUMN "accountCategory" TEXT;
ALTER TABLE "webinar_questions" ADD COLUMN "industry" TEXT;
