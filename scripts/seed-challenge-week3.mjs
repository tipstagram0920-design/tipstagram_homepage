// 5주 챌린지 3주차 주차 콘텐츠 시드.
// 숙제: 인스타그램에 릴스 최소 3개 올리고 URL 제출.
// 제목 · 이번 주 안내 · 팁스타그램의 편지를 채운다. 일정(openAt/dueAt)은 건드리지 않음.
// 실행: node scripts/seed-challenge-week3.mjs
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

const TITLE = "Week 3 · 릴스 3개 올리기";

const DESCRIPTION = `<p>오프라인 1:1에서 나눈 이야기를 <strong>바로 콘텐츠로 옮기는 주</strong>입니다.</p>
<p>이번 주 숙제는 딱 하나예요. <strong>인스타그램에 릴스를 최소 3개 올리고, URL을 제출하는 것.</strong> 아래에 링크만 붙여 주시면 됩니다.</p>`;

const PROMPT = `오프라인에서 여러분 계정을 하나씩 다 봤습니다. 이제 말한 걸 실제로 올릴 차례예요.

이번 주 숙제는 딱 하나입니다.
인스타그램에 릴스를 최소 3개 올리고, 그 URL을 제출하세요.

조건을 복잡하게 걸지 않았습니다. 이번 주에 필요한 건 완성도가 아니라 '양'이기 때문입니다.
3개를 올린 사람과 0개를 올린 사람 사이에는 다음 주에 제가 봐줄 수 있는 게 있느냐 없느냐의 차이가 생깁니다. 그 차이가 5주 뒤 결과를 가릅니다.

몇 가지만 기억해 주세요.

카메라부터 켜지 마세요.
대상 → 한 줄 메시지 → 후킹(첫 3초) → 구조 → 컷 리스트. 종이 한 장에 먼저 적고 찍으세요. 기획은 시간을 버는 일입니다.

무에서 창조하지 마세요.
이미 터진 릴스를 찾아서, 왜 터졌는지 핵심만 살려 내 주제로 옮기세요. 2주차에 연습한 그 방식 그대로입니다.

3개를 똑같이 만들지 마세요.
같은 포맷 3번보다, 서로 다른 각도 3개가 훨씬 많은 걸 알려줍니다. 어떤 각도가 내 계정에서 먹히는지는 올려봐야만 알 수 있어요.

70점이어도 올리세요.
완벽하게 만들려다 한 개도 못 올리는 게 이번 주의 유일한 실패입니다.

제출할 때 각 릴스 아래 '주제·후킹 한 줄' 칸이 있습니다. 선택이지만, 적어 주시면 제 피드백이 훨씬 정확해집니다. 여러분이 무엇을 노리고 만들었는지 알아야 그게 실제로 전달됐는지 짚어드릴 수 있으니까요.

릴스 URL은 게시물에서 공유 → 링크 복사로 가져오시면 됩니다.

이번 주도 끌려오세요. 3개만 올리면 됩니다.

— 팁스타그램 드림`;

const weeks = await prisma.challengeWeek.findMany({
  where: { weekIndex: 3 },
  include: { cohort: { select: { name: true } } },
});

for (const w of weeks) {
  await prisma.challengeWeek.update({
    where: { id: w.id },
    data: { title: TITLE, description: DESCRIPTION, homeworkPrompt: PROMPT },
  });
  console.log(`✓ ${w.cohort.name} — Week 3 콘텐츠 반영`);
}

console.log(`총 ${weeks.length}개 주차 업데이트 완료`);
await prisma.$disconnect();
