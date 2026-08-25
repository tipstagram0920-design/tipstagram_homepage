-- 기수별 카카오 오픈채팅방 URL. 기수마다 방을 새로 열기 때문에 전역 설정이 아니라 기수에 매단다.
ALTER TABLE "challenge_cohorts" ADD COLUMN "openChatUrl" TEXT;
