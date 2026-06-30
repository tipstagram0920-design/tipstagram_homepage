import { prisma } from "@/lib/prisma";

const SITE = "https://tipstagram-homepage.vercel.app";

/**
 * 카톡방용 메시지 12개. 운영자가 카톡방에 그대로 복사·붙여넣기 하는 게 목적.
 * 톤: 1인칭 "팁스타그램" / 진중·솔직 / 짧은 문장 / 이모지는 핵심 강조용만.
 *
 * 변수 자리:
 *   {{webinarDate}}     — 캠페인 webinarDate (KST 한국어 포맷)
 *   {{zoomUrl}}         — 캠페인.zoomUrl ?? Setting.webinarZoomUrl
 *   {{ebook1Url}}       — Setting.ebook1Url
 *   {{preQuestionUrl}}  — 캠페인.preQuestionUrl ?? `${SITE}/webinar/ask/<id>`
 *   {{salesUrl}}        — 캠페인.salesUrl ?? Setting.externalCheckoutUrl
 */
export interface KakaoBroadcastMessage {
  /** webinar 기준 offsetDays (음수=라이브 전) 또는 endDate 기준 */
  kind: "webinar" | "endDate";
  offsetDays: number;
  time: string; // "HH:MM" KST
  label: string;
  body: string;
}

export const KAKAO_BROADCAST_MESSAGES: KakaoBroadcastMessage[] = [
  {
    kind: "webinar",
    offsetDays: -10,
    time: "09:00",
    label: "D-10 · 환영",
    body: `안녕하세요. 팁스타그램입니다.

이번 무료 라이브에 신청해 주신 분들께 먼저 감사드립니다.

라이브 일정 안내드립니다.
📅 일시 {{webinarDate}}
📍 장소 Zoom
💰 참가비 0원

라이브까지 약 열흘. 그 사이에 짧은 메시지 몇 번 더 드릴 예정입니다. 모두 라이브에서 더 잘 받아가실 수 있도록 준비하는 내용이에요.

오늘은 워밍업으로 1차 전자책 한 권 두고 갑니다.
{{ebook1Url}}

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -7,
    time: "09:00",
    label: "D-7 · 무료 여부 명시",
    body: `팁스타그램입니다.

"이거 진짜로 무료가 맞느냐"는 질문을 자주 받습니다.

명확히 말씀드리겠습니다.
· 결제 절차 없습니다.
· 카드 등록 없습니다.
· 시간을 내어 들어와 주시면 그것으로 충분합니다.

광고비 없이 인스타로 결과 내는 방법을 보여드리는 자리이기에, 이 자리 자체에도 비용을 부과하지 않습니다.

라이브에서는 1차 전자책의 가장 많이 캡처되는 챕터 "왜 내 게시물은 30명만 보는가"를 직접 풀어드립니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -5,
    time: "09:00",
    label: "D-5 · 강사 스토리",
    body: `팁스타그램입니다.

오늘은 짧은 이야기 하나만 두고 가겠습니다.

저도 처음 인스타를 시작했을 때 팔로워는 0이었습니다. 첫 6개월 동안 200명. 한 달에 33명씩 늘어나는 속도였습니다.

그러다 한 가지를 바꿨습니다. 콘텐츠의 "구조"입니다. 그 다음 한 달 만에 1만 명이 늘었고, 그 흐름이 1년 동안 이어졌습니다.

라이브에서는 그 변곡점을 시간 순서대로 풀어드립니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -4,
    time: "09:00",
    label: "D-4 · 페르소나 사례",
    body: `팁스타그램입니다.

"저는 인플루언서도 아니고 평범한 사람이에요. 저 같은 사람도 되나요?"

자주 받는 질문입니다. 짧게 사례만 적어드리겠습니다.

· 워킹맘 — 아이 재운 밤 한 시간만 써서 6개월에 1만 팔로워
· 동네 네일샵 사장님 — 게시물 하나로 매출 5배
· 현직 회계사 — N잡으로 월 300
· 음악학원 원장님 — 학생 모집 줄이 끊긴 적 없음

공통점은 한 가지입니다. 모두 "저는 안 될 것 같은데..."로 시작하셨습니다.

라이브에서 더 보여드리겠습니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -3,
    time: "09:00",
    label: "D-3 · 시간 부담 해소",
    body: `팁스타그램입니다.

"그날 바빠서 들어가지 못할 것 같다"는 메시지를 종종 받습니다. 두 가지만 말씀드리겠습니다.

첫째, 라이브는 1시간 30분이지만, 첫 30분에 핵심을 다 담아둡니다. 30분만 들으셔도 가져가실 게 충분합니다.

둘째, 참여자분들께만 72시간 동안 다시보기 링크를 보내드립니다. 출근길에, 잠들기 전에 들으셔도 됩니다.

신청 취소하지 마시고 그대로 두세요. 그게 가장 안전한 선택입니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -2,
    time: "09:00",
    label: "D-2 · 사전 질문 받기",
    body: `팁스타그램입니다.

라이브까지 48시간 남았습니다.

지금까지 받은 질문 중 가장 많은 세 가지를 공유드립니다.
1. 콘텐츠를 매일 올리는 것이 정답인가요?
2. 릴스와 피드 중 어느 쪽을 먼저 해야 하나요?
3. 팔로워는 느는데 매출이 그대로입니다.

라이브에서 모두 답해드릴 예정입니다.

다만 각자의 상황은 또 다르실 겁니다. 본인이 가장 궁금한 것 하나만 미리 보내주시면, 라이브 중에 익명으로 직접 답해드리겠습니다.

▶ 사전 질문 보내기
{{preQuestionUrl}}

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -1,
    time: "09:00",
    label: "D-1 · 입장 안내",
    body: `팁스타그램입니다.

내일이 라이브 당일입니다.

📅 일시 {{webinarDate}}
📍 장소 Zoom (입장 링크는 당일 1시간 전 다시 안내드립니다)
🖊 준비물 노트와 펜 (영상은 끄셔도 무방합니다)

사전 질문 아직 보내지 않으신 분 계시면 아래로 한 줄만 적어주세요.
{{preQuestionUrl}}

내일 뵙겠습니다.

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

노트와 펜 준비해 주세요. 채팅으로 질문 자유롭게 받습니다.

팁스타그램`,
  },
  {
    kind: "webinar",
    offsetDays: 1,
    time: "09:00",
    label: "D+1 · 다시보기 + 강의 안내",
    body: `팁스타그램입니다.

어제 라이브에 함께해 주신 모든 분께 진심으로 감사드립니다.

📺 다시보기는 72시간만 열어둡니다.
{{zoomUrl}}

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
    label: "마감 D-3 · 정원 한정",
    body: `팁스타그램입니다.

이번 기수 모집 마감까지 3일 남았습니다.

이번 기수는 100명 한정으로 받고 있습니다. 진도 확인과 피드백을 직접 드리는 구조라 더 늘리기 어렵습니다.

다음 기수는 한 달 후이며, 그때부터 수강료가 인상됩니다.

망설이고 계시다면 남은 자리만 한 번 확인해 보세요. 결정은 그 다음에 하셔도 됩니다.
{{salesUrl}}

팁스타그램 드림`,
  },
  {
    kind: "endDate",
    offsetDays: -1,
    time: "09:00",
    label: "마감 D-1 · 24h 임박",
    body: `팁스타그램입니다.

오늘 자정까지 모집을 받습니다.

이런 메시지는 자주 드리지 않습니다. 그럼에도 한 번 말씀드리는 이유는 한 가지입니다. 이번 기수를 놓치시면 한 달을 더 기다리셔야 하고, 그때는 수강료가 인상되어 있을 것이기 때문입니다.

한 달 뒤 같은 자리에서 다시 망설이는 자신을 마주하고 싶지 않으시다면, 오늘이 마지막입니다.

👉 신청 페이지
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
  // KST 기준 시각 — base의 날짜를 KST로 변환, offsetDays 적용, 그 날 HH:MM (KST)
  const kstBase = new Date(base.getTime() + 9 * 60 * 60 * 1000);
  const y = kstBase.getUTCFullYear();
  const m = kstBase.getUTCMonth();
  const d = kstBase.getUTCDate() + msg.offsetDays;
  // KST HH:MM → UTC = KST - 9h
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
 * 캠페인에 카톡 메시지 12개를 BroadcastDraft로 자동 시드.
 * 멱등성: notes 필드에 `[campaign:<id>:step:<n>]` 태그 → 같은 태그 draft 있으면 skip.
 */
export async function seedBroadcastsForCampaign(
  campaignId: string
): Promise<{ created: number; skipped: number }> {
  const campaign = await prisma.webinarCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("campaign not found");

  const settings = Object.fromEntries(
    (await prisma.setting.findMany()).map((s) => [s.key, s.value])
  );

  const vars: Record<string, string> = {
    webinarDate: formatKstDate(campaign.webinarDate),
    zoomUrl: campaign.zoomUrl || settings.webinar_zoom_url || "[Zoom URL 미설정]",
    ebook1Url: campaign.zoomUrl ? "" : "",  // overwrite below
    preQuestionUrl:
      campaign.preQuestionUrl ||
      settings.webinar_pre_question_url ||
      `${SITE}/webinar/ask/${campaign.id}`,
    salesUrl: campaign.salesUrl || settings.external_checkout_url || "[강의 신청 페이지 URL 미설정]",
  };
  vars.ebook1Url = settings.ebook1_url || settings.ebook_url || "[1차 전자책 URL 미설정]";

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < KAKAO_BROADCAST_MESSAGES.length; i++) {
    const msg = KAKAO_BROADCAST_MESSAGES[i];
    const fireAt = computeFireAt(msg, campaign);
    if (!fireAt) {
      skipped++;
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

  return { created, skipped };
}
