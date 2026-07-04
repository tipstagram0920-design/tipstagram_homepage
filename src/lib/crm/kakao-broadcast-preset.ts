import { prisma } from "@/lib/prisma";

const SITE = "https://tipstagram-homepage.vercel.app";

/**
 * 카톡방용 메시지 12개. 운영자가 카톡방에 그대로 복사·붙여넣기 하는 게 목적.
 * 톤: 1인칭 "팁스타그램" / 진중·솔직 / 짧은 문장 / 이모지는 핵심 강조용만.
 *
 * 변수:
 *   {{webinarDate}}     — 캠페인 webinarDate (KST 한국어 포맷)
 *   {{zoomUrl}}         — 캠페인.zoomUrl ?? Setting
 *   {{ebook1Url}}       — Setting
 *   {{preQuestionUrl}}  — 캠페인.preQuestionUrl ?? 자체 페이지
 *   {{salesUrl}}        — 캠페인.salesUrl ?? Setting
 *   {{consultationUrl}} — Setting
 *   {{replayUrl}}       — 캠페인.replayUrl ?? zoomUrl
 */
export interface KakaoBroadcastMessage {
  kind: "webinar" | "endDate";
  offsetDays: number;
  time: string;
  label: string;
  body: string;
}

export const KAKAO_BROADCAST_MESSAGES: KakaoBroadcastMessage[] = [
  {
    kind: "webinar",
    offsetDays: -10,
    time: "09:00",
    label: "D-10 · 환영·대상자",
    body: `안녕하세요. 팁스타그램입니다.

이번 무료 라이브에 신청해 주셔서 감사드립니다.

📅 일시 {{webinarDate}}
📍 장소 Zoom
💰 참가비 0원

이번 라이브는 특히 이런 분들께 필요한 자리입니다.

· 인스타를 시작했지만 팔로워가 좀처럼 늘지 않아 답답한 분
· 콘텐츠를 열심히 올려도 왜 노출이 안 되는지 이유를 모르는 분
· 광고비 한 푼 없이 인스타를 매출로 연결하고 싶은 분
· 본업·육아·N잡을 병행하며 짧은 시간에 결과를 내야 하는 분
· 인스타로 나만의 브랜드와 영향력을 만들고 싶은 분

한 가지라도 해당되신다면 라이브가 정말 잘 맞을 겁니다.

앞으로 열흘 동안 짧은 메시지 몇 번 더 드리겠습니다.

오늘은 워밍업으로 1차 전자책 한 권 두고 갑니다.
{{ebook1Url}}

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -7,
    time: "09:00",
    label: "D-7 · 라이브 후 변화 3가지",
    body: `팁스타그램입니다.

이번 라이브를 듣고 나면 뭐가 달라질까요? 세 가지 변화를 미리 알려드립니다.

첫째. 콘텐츠 만드는 시간이 절반으로 줄어듭니다.
"오늘 뭘 올려야 하지" 하고 30분씩 고민하지 않게 됩니다. 구조가 잡히면 소재는 저절로 흘러나옵니다.

둘째. 팔로워가 이전과 다른 속도로 늘기 시작합니다.
알고리즘이 콘텐츠를 밀어주기 시작하면 며칠 사이에 눈에 띄게 달라집니다.

셋째. 인스타가 부담이 아니라 도구가 됩니다.
"올려야 하는데…" 하는 압박이 사라지고, 매출·연결·기회를 만드는 도구로 자리 잡습니다.

라이브에서 이 셋을 어떻게 만드는지 시간 순서대로 풀어드립니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -5,
    time: "09:00",
    label: "D-5 · 자유·시간·자동화",
    body: `팁스타그램입니다.

오늘은 짧게 제 이야기 하나 두고 갑니다.

제가 인스타로 얻은 건 팔로워나 매출 숫자 이상이었어요. 1년에 6억이라는 수익도 감사한 일이지만, 진짜 컸던 건 다른 세 가지였습니다.

첫째. 시간의 자유입니다.
아웃소싱과 자동화로 하루에 인스타에 쓰는 시간을 크게 줄였습니다. 인스타 시스템을 정확히 알아야 무엇을 맡기고 무엇을 자동화할지 결정할 수 있습니다.

둘째. 원하는 사람을 만날 수 있게 됐어요.
예전엔 상상도 못 하던 분들이 먼저 연락해오고, 함께 일하자고 제안을 해옵니다. 인스타 위에서 저를 알아보는 사람들이 자연스럽게 모이는 구조가 만들어지거든요.

셋째. 통장 잔고에 마음 졸이던 시절이 없어졌습니다.

혹시 지금 인스타 때문에 하루 종일 골머리 썩고 계신가요? 라이브에서 이 구조를 어떻게 만들었는지 시간 순서대로 풀어드립니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -4,
    time: "09:00",
    label: "D-4 · 페르소나 + 공감·권유",
    body: `팁스타그램입니다.

"저는 인플루언서도 아니고 그냥 평범한 사람이에요. 저 같은 사람도 되나요?"

자주 받는 질문입니다. 사례로 답해드리겠습니다.

· 워킹맘 — 아이 재운 밤 한 시간만 써서 6개월에 1만 팔로워
· 동네 네일샵 사장님 — 게시물 하나로 매출 5배
· 현직 회계사 — N잡으로 월 300
· 음악학원 원장님 — 학생 모집 줄이 끊긴 적 없음

공통점 하나. 모두 처음엔 "저는 안 될 것 같은데…"로 시작하셨습니다.

혹시 지금 같은 마음이신가요?
"나는 특별할 것도 없는데.", "이미 늦은 거 아닌가."

그 마음, 정확히 이해합니다. 저도 그렇게 시작했으니까요.

부탁 하나만 드리겠습니다. 이번 라이브에는 꼭 들어와 주세요. "안 될 것 같다"고 시작하신 분들이 어떻게 결과를 만들어냈는지, 그 첫 번째 스텝을 하나하나 풀어드립니다.

라이브가 끝날 때쯤이면 "혹시 나도?" 하는 마음이 생겨 있을 겁니다. 그 마음이 시작점입니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -3,
    time: "09:00",
    label: "D-3 · 다시보기 답변 3가지",
    body: `팁스타그램입니다.

"라이브 못 볼 것 같은데 다시보기 되나요?"라는 질문에 답해드리겠습니다.

답변에 앞서 세 가지만 꼭 말씀드립니다.

1. 라이브는 처음이 가장 중요합니다.
초반 30분에 알고리즘·구조·실행 핵심을 다 담아둡니다. 가능하면 시작 시간에 맞춰 들어와 주세요.

2. 끝까지 들으시면 특별한 혜택이 있습니다.
참여자 한정으로 65만 원 상당의 실전 자료 세트를 무료로 드립니다. 다시보기로는 받으실 수 없어요. 가능하면 끝까지 함께해 주세요.

3. 그래도 놓치신 분을 위한 안전장치.
참여 신청하신 분께는 72시간 동안 다시보기 링크를 보내드립니다. 출근길에, 잠들기 전에 들으셔도 좋습니다.

정리하면 — 가능하면 시작 시간에 오시고, 끝까지 함께해 주세요. 그게 가장 많이 가져가시는 방법입니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -2,
    time: "09:00",
    label: "D-2 · 질문 짧은 답 + 진단 세션",
    body: `팁스타그램입니다.

라이브까지 48시간 남았습니다.

가장 많이 받은 질문 세 가지에 짧게 답해드립니다. 자세한 것은 라이브에서 직접 풀어드리겠습니다.

1. "콘텐츠를 매일 올려야 하나요?"
아니요. 매일 올리는 것보다 구조가 잡힌 콘텐츠 세 편이 훨씬 강합니다.

2. "릴스와 피드 중 뭘 먼저?"
현재 계정 상태에 따라 다릅니다. 팔로워 3천 이하라면 릴스, 이상이라면 피드부터. 자세한 기준은 라이브에서.

3. "팔로워는 느는데 매출은 그대로예요."
콘텐츠와 매출을 잇는 세일즈 퍼널이 빠져 있는 겁니다. 이걸 어떻게 설계하는지가 이번 라이브 핵심 중 하나입니다.

각자의 상황이 또 다르실 겁니다. 본인 계정을 라이브 전에 미리 진단받고 싶으신 분은 1:1 진단 세션을 열어두었습니다. 소수 정원 · 선착순.

▶ 1:1 진단 세션 신청
{{consultationUrl}}

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -1,
    time: "09:00",
    label: "D-1 · 내일 · 진단 세션",
    body: `팁스타그램입니다.

내일이 라이브 당일입니다.

📅 일시 {{webinarDate}}
📍 장소 Zoom (입장 링크는 시작 1시간 전 다시 안내드립니다)
🖊 준비물 노트와 펜, 지금 운영 중인 인스타 계정

혹시 라이브 전에 본인 계정을 개별적으로 진단받고 싶으신 분 계시면, 오늘까지 1:1 진단 세션을 열어두었습니다.

▶ 1:1 진단 세션
{{consultationUrl}}

내일 뵙겠습니다. 정말로 기대해 주셔도 좋습니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: 0,
    time: "09:00",
    label: "LIVE 당일 아침 · 리마인드",
    body: `팁스타그램입니다.

오늘 저녁이 라이브 당일입니다.

1시간 전에 입장 링크를 다시 안내드리겠습니다.

오늘 가져가실 것 세 가지를 다시 한 번 정리해 드립니다.
1. 노출 알고리즘의 진짜 원리
2. 팔로워를 빠르게 늘리는 4단계 루틴
3. 팔로워를 매출로 바꾸는 세일즈 퍼널

저녁에 뵙겠습니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: 0,
    time: "19:00",
    label: "LIVE −1h · 입장 링크",
    body: `🔴 라이브가 한 시간 후에 시작됩니다.

▶ 입장 링크
{{zoomUrl}}

Zoom 방은 시작 15분 전부터 열립니다. 오디오·화면 상태 미리 점검하시고 편하게 들어와 계셔도 좋습니다.

노트와 펜, 지금 운영 중이신 인스타 계정 준비해 주세요. 채팅으로 질문 자유롭게 받습니다.

팁스타그램`,
  },
  {
    kind: "webinar",
    offsetDays: 1,
    time: "09:00",
    label: "D+1 · 다시보기 + 강의",
    body: `팁스타그램입니다.

어제 라이브에 함께해 주신 모든 분께 진심으로 감사드립니다.

📺 다시보기는 72시간만 열어둡니다.
{{replayUrl}}

라이브에서 다룬 핵심 세 가지를 다시 정리해 드립니다.
1. 노출은 알고리즘이 아니라 콘텐츠 구조가 결정합니다.
2. 팔로워를 빠르게 늘리는 4단계 루틴.
3. 팔로워를 매출로 바꾸는 세일즈 퍼널 설계.

여기서 멈추지 않고 다음 단계를 함께 가고 싶으신 분께 강의 페이지를 안내드립니다.
{{salesUrl}}

팁스타그램 드림`,
  },
  {
    kind: "endDate",
    offsetDays: -3,
    time: "09:00",
    label: "마감 D-3 · 5자리 남음",
    body: `팁스타그램입니다.

이번 기수 모집 마감까지 3일 남았습니다.

이번 기수는 20명 한정입니다. 진도 확인과 피드백을 직접 드리는 구조라 더 늘리기 어렵습니다.

지금 5자리 남았습니다.

3일 후에 이번 기수 모집을 닫습니다.

아직 망설이고 계시다면 남은 자리만 한 번 확인해 보세요. 결정은 그 다음에 하셔도 됩니다.

▶ 신청 페이지
{{salesUrl}}

팁스타그램 드림`,
  },
  {
    kind: "endDate",
    offsetDays: -1,
    time: "09:00",
    label: "마감 D-1 · 변화 vs 정체",
    body: `팁스타그램입니다.

솔직히 말씀드리겠습니다.

마감을 앞두고 이런 메시지 드리는 게 저도 부담스럽습니다. 그럼에도 한 번만 드리는 이유는 한 가지입니다.

한 달 뒤를 상상해 보세요.

누군가는 이번 기수를 신청해서, 한 달 동안 하나씩 실행하면서 무언가가 달라지고 있을 겁니다. 콘텐츠에 반응이 오거나, 팔로워가 눈에 띄게 늘거나, 처음으로 매출이 찍히거나.

또 누군가는 아무 결정도 안 하고 그대로 있을 겁니다. 한 달 뒤에도 오늘과 똑같은 팔로워 수, 똑같은 게시물이 그대로일 겁니다.

어느 쪽이 원하시는 한 달 뒤인가요?

▶ 신청 페이지
{{salesUrl}}

결정은 여러분의 것입니다. 응원하겠습니다.

팁스타그램 드림`,
  },
];

/**
 * 캠페인의 webinarDate/endDate 기준으로 message.time(KST)에 맞는 UTC Date 계산.
 */
function computeFireAt(msg: KakaoBroadcastMessage, campaign: { webinarDate: Date; endDate: Date | null }): Date | null {
  const base = msg.kind === "webinar" ? campaign.webinarDate : campaign.endDate;
  if (!base) return null;
  const [hh, mm] = msg.time.split(":").map(Number);
  const kstBase = new Date(base.getTime() + 9 * 60 * 60 * 1000);
  const y = kstBase.getUTCFullYear();
  const m = kstBase.getUTCMonth();
  const d = kstBase.getUTCDate() + msg.offsetDays;
  const kstMs = Date.UTC(y, m, d, hh, mm) - 9 * 60 * 60 * 1000;
  return new Date(kstMs);
}

function formatKstDate(d: Date): string {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const dow = ["일", "월", "화", "수", "목", "금", "토"][kst.getUTCDay()];
  const hour = kst.getUTCHours();
  const ampm = hour < 12 ? "오전" : "오후";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${month}월 ${day}일(${dow}) ${ampm} ${h12}시`;
}

function applyVars(body: string, vars: Record<string, string>): string {
  let s = body;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{{${k}}}`, v);
  }
  return s;
}

/**
 * 캠페인에 카톡 메시지 12개를 BroadcastDraft로 자동 시드. 멱등성 태그: [campaign:<id>:step:<n>].
 * 시드 시점에 이미 24시간 이상 지난 step은 skippedPast로 스킵.
 */
export async function seedBroadcastsForCampaign(
  campaignId: string
): Promise<{ created: number; skipped: number; skippedPast: number }> {
  const campaign = await prisma.webinarCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("campaign not found");
  const now = new Date();

  const settings = Object.fromEntries(
    (await prisma.setting.findMany()).map((s) => [s.key, s.value])
  );

  const vars: Record<string, string> = {
    webinarDate: formatKstDate(campaign.webinarDate),
    zoomUrl: campaign.zoomUrl || settings.webinar_zoom_url || "[Zoom URL 미설정]",
    ebook1Url: settings.ebook1_url || settings.ebook_url || "[1차 전자책 URL 미설정]",
    preQuestionUrl:
      campaign.preQuestionUrl ||
      settings.webinar_pre_question_url ||
      `${SITE}/webinar/ask/${campaign.id}`,
    salesUrl: campaign.salesUrl || settings.external_checkout_url || "[강의 신청 페이지 URL 미설정]",
    consultationUrl: settings.consultation_url || `${SITE}/consultation`,
    replayUrl: campaign.replayUrl || campaign.zoomUrl || "[다시보기 URL 미설정]",
  };

  let created = 0;
  let skipped = 0;
  let skippedPast = 0;

  for (let i = 0; i < KAKAO_BROADCAST_MESSAGES.length; i++) {
    const msg = KAKAO_BROADCAST_MESSAGES[i];
    const fireAt = computeFireAt(msg, campaign);
    if (!fireAt) {
      skipped++;
      continue;
    }
    if (now.getTime() - fireAt.getTime() > 24 * 60 * 60 * 1000) {
      skippedPast++;
      continue;
    }
    const tag = `[campaign:${campaign.id}:step:${i}]`;
    const existing = await prisma.broadcastDraft.findFirst({
      where: { notes: { contains: tag } },
    });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.broadcastDraft.create({
      data: {
        channel: "openchat",
        title: `[${msg.label}] ${campaign.name}`,
        body: applyVars(msg.body, vars),
        scheduledAt: fireAt,
        status: "scheduled",
        notes: tag,
      },
    });
    created++;
  }

  return { created, skipped, skippedPast };
}
