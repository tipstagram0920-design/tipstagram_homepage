// 5주 챌린지 4주차 주차 콘텐츠 시드.
// 강의: Claude Code로 내 일 자동화하기 (강의 노트: /resources/claude-code-card-news)
// 숙제: 레퍼런스 5개를 찾아 변형해 릴스 5개를 올리고, 레퍼런스 URL + 내 릴스 URL 제출.
// 제목 · 이번 주 안내 · 팁스타그램의 편지를 채운다. 일정(openAt/dueAt)은 건드리지 않음.
// 실행: node scripts/seed-challenge-week4.mjs
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";

const env = fs.readFileSync(".env", "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const TITLE = "Week 4 · 레퍼런스 → 내 릴스 5개";

const DESCRIPTION = `<p>이번 주 강의는 <strong>Claude Code로 반복 작업을 자동화하는 법</strong>입니다. 다시보기용 강의 노트를 강의 자료 칸에 올려두었으니, 수업을 놓쳤거나 따라 하다 막히면 그 페이지를 보면서 하시면 됩니다.</p>
<p>숙제는 <strong>레퍼런스 5개를 찾아 내 콘텐츠로 변형해, 릴스 5개를 올리는 것</strong>입니다. 아래에 레퍼런스 URL과 내가 올린 릴스 URL을 짝지어 남겨 주세요.</p>`;

const PROMPT = `3주차에 릴스 3개를 올려보셨습니다. 이번 주는 5개입니다.

개수만 늘린 게 아닙니다. 이번엔 반드시 '레퍼런스 → 변형' 순서로 가세요.

무에서 창조하지 마세요.
내 주제로 검색해서 반응이 좋은 릴스 5개를 먼저 저장하세요. 저장한 계정에 들어가서 그 계정의 다른 릴스도 훑어보면 더 좋은 걸 건집니다. 이게 5분이면 끝나는데, 이 5분이 촬영 두 시간을 아낍니다.

베끼지 말고 옮기세요.
그 릴스가 왜 잘 됐는지를 한 줄로 정리하세요. 첫 3초에서 무엇을 보여줬는지, 자막이 어떻게 붙었는지, 어떤 순서로 넘어갔는지. 그 '구조'만 가져와서 내 상품과 내 고객 이야기로 채우는 겁니다. 화면에 나오는 내용이 아니라 뼈대를 가져오세요.

5개를 다르게 시도하세요.
같은 포맷 5번은 정보가 1개입니다. 서로 다른 각도 5개는 정보가 5개입니다. 어떤 게 내 계정에서 먹히는지는 올려봐야만 알 수 있고, 이번 주가 그걸 알아낼 마지막 기회에 가깝습니다.

제출할 때 '어떻게 바꿨나' 칸이 있습니다. 선택이지만 적어 주세요.
레퍼런스와 내 릴스를 나란히 놓고 봐야 제가 "여기서 핵심을 놓쳤다" 또는 "이건 잘 옮겼다"를 정확히 짚어드릴 수 있습니다. 무엇을 노렸는지 모르면 결과만 보고 일반적인 말밖에 못 해드려요.

그리고 이번 주 강의 내용은 숙제와 별개입니다.
자동화는 지금 당장 안 만들어도 됩니다. 다만 강의 노트는 꼭 한 번 열어보세요. 나중에 콘텐츠를 매주 만들어야 할 때, 그 페이지가 여러분 시간을 가장 많이 아껴줄 겁니다.

릴스 URL은 게시물에서 공유 → 링크 복사로 가져오시면 됩니다.

5개입니다. 이번 주도 끌려오세요.

— 팁스타그램 드림`;

const weeks = await prisma.challengeWeek.findMany({
  where: { weekIndex: 4 },
  include: { cohort: { select: { name: true } } },
});

for (const w of weeks) {
  await prisma.challengeWeek.update({
    where: { id: w.id },
    data: { title: TITLE, description: DESCRIPTION, homeworkPrompt: PROMPT },
  });
  console.log(`✓ ${w.cohort.name} — Week 4 콘텐츠 반영`);
}

console.log(`총 ${weeks.length}개 주차 업데이트 완료`);
await prisma.$disconnect();
