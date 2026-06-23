ALTER TABLE "contacts" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL;

-- 기존 level=2 ebook 신청자에게 "전자책_2단계" 태그 백필
UPDATE "contacts" c
SET "tags" = array_append("tags", '전자책_2단계')
WHERE EXISTS (
  SELECT 1 FROM "ebook_submissions" s
  WHERE s."contactId" = c.id AND s."level" = 2
)
AND NOT ('전자책_2단계' = ANY(c."tags"));

-- 회원의 user.tags에 이미 들어 있는 태그를 contact.tags로 머지 (회원 = User.contactId 연결)
UPDATE "contacts" c
SET "tags" = ARRAY(
  SELECT DISTINCT unnest(c."tags" || u."tags")
)
FROM "users" u
WHERE u."contactId" = c.id
  AND u."tags" IS NOT NULL
  AND array_length(u."tags", 1) > 0;
