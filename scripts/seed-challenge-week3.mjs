// 5주 챌린지 3주차(오프라인 1:1 진단) 주차 콘텐츠 시드.
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

const TITLE = "Week 3 · 진짜 멱살 잡는 날 (오프라인 1:1 진단)";

const DESCRIPTION = `<p>이번 주는 <strong>서울 종로에서 직접 만나는 주</strong>입니다. 한 분당 20분, 제가 여러분 계정을 직접 뜯어봅니다.</p>
<p>20분은 짧습니다. <strong>아래 숙제를 미리 채워 주셔야</strong> 그 20분을 설명이 아니라 진단에만 쓸 수 있어요. 인스타 인사이트 화면을 열어두고 작성해 주세요.</p>`;

const PROMPT = `2주 동안 방향을 잡고, 릴스를 만들어 올렸습니다. 이제 숫자가 쌓였어요.

이번 주는 제가 직접 봅니다. 서울 종로, 한 분당 20분. 역대 수강생 중 가장 많이 성공한 그룹이 이 오프라인 참석자들이었습니다. 우연이 아니에요. 자기 계정의 문제를 남의 눈으로 정확히 들은 사람만이 다음 주부터 다르게 움직였기 때문입니다.

다만 20분은 정말 짧습니다.
그 20분을 "제 계정이 어떤 계정이냐면요..." 설명하는 데 다 쓰면, 진단은 못 하고 끝납니다.
그래서 이번 주 숙제는 '설명을 미리 끝내두는 일'입니다.

숫자를 추측해서 적지 마세요.
인스타 앱 → 프로페셔널 대시보드 → 인사이트를 켜고, 보이는 숫자를 그대로 옮겨 적어 주세요.
조회수만 적지 말고 저장·프로필 방문·신규 팔로우까지 함께 적어야 합니다. 진짜 문제는 대부분 조회수가 아니라 그 다음 칸에서 발견되거든요. 조회수 3천에 프로필 방문 20명이면, 그건 릴스 문제가 아니라 프로필 문제입니다. 숫자가 있어야 이런 진단이 가능합니다.

그리고 '내 해석' 칸을 비우지 마세요.
틀려도 됩니다. 오히려 틀린 해석이 저에겐 가장 유용한 정보예요. 여러분이 무엇을 원인이라고 믿고 있는지 알아야, 그 믿음부터 고칠 수 있으니까요.

마지막으로 질문 3개.
검색하면 나오는 질문은 적지 마세요. "릴스 몇 개 올려야 하나요" 같은 건 아까운 20분을 씁니다.
"제 주제에서 이 후킹이 과한가요", "이 상품 가격을 지금 올려도 되나요" 처럼 내 계정이라서 생기는 질문을 적어 주세요.

이번 주 숙제:
1) 오프라인 1:1 참석 여부와 희망 시간대를 남긴다.
2) 계정 현황(팔로워·30일 도달·30일 프로필 방문)을 인사이트에서 그대로 옮긴다.
3) 2주차에 올린 릴스 3개의 실제 지표와 내 해석을 적는다.
4) 지금 가장 막힌 지점을 한 장면으로 구체적으로 적는다.
5) 현장에서 꼭 묻고 싶은 질문을 적는다.

잘 안 된 릴스를 숨기지 마세요. 저는 잘 된 걸 칭찬하러 가는 게 아니라, 안 된 걸 고치러 갑니다. 그날 하루가 변곡점이 되게 만들어 봅시다.

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
