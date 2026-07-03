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
    label: "D-10 · 환영 · 대상자 명시",
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

앞으로 열흘 동안 짧은 메시지 몇 번 더 드릴 예정입니다. 라이브를 더 잘 받아가실 수 있도록 준비하는 내용이에요.

오늘은 워밍업으로 1차 전자책 한 권 두고 갑니다.
{{ebook1Url}}

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -7,
    time: "09:00",
    label: "D-7 · 라이브 후 어떻게 달라지는가",
    body: `팁스타그램입니다.

이번 라이브를 듣고 나면 어떻게 달라지실 수 있을지, 제 이야기를 들려드리고 싶습니다.

저는 인스타를 통해 세 가지를 얻었습니다.

첫째, 유명하고 영향력 있는 사람들과 자연스럽게 연결됐습니다. 예전엔 상상도 못 하던 분들이 먼저 DM을 보내오고, 함께 일하자고 제안을 해옵니다.

둘째, 시간의 자유를 얻었습니다. 출퇴근에 매이지 않고, 원할 때 일하고 원할 때 쉴 수 있는 삶이 실제로 가능하다는 걸 알게 됐습니다.

셋째, 경제적으로 부족함 없는 삶을 살고 있습니다. 매달 통장 잔고에 마음 졸이던 시절이 이제는 없습니다.

세 가지 모두 인스타그램 하나로 가능했습니다.

그리고 저는 확신합니다. 여러분도 똑같이 만드실 수 있습니다.

라이브에서는 그 세 가지를 실제로 만들어내는 구조와 실행 루틴을 시간 순서대로 풀어드립니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -5,
    time: "09:00",
    label: "D-5 · 사전 질문 · 구체성 강조",
    body: `팁스타그램입니다.

이번 무료 라이브는 조금 특별합니다.

일반적인 강의처럼 준비한 슬라이드만 읽어드리는 자리가 아닙니다. 여러분이 사전에 남겨주신 질문을 라이브 중에 익명으로 직접 답해드리는 자리입니다.

그래서 부탁 하나만 꼭 드리겠습니다.

▶ 사전 질문 남기기
{{preQuestionUrl}}

한 가지 팁을 드리면, 본인의 상황을 최대한 구체적으로 남기실수록 답변도 훨씬 구체적으로 드릴 수 있습니다.

예를 들어 "팔로워가 안 늘어요"보다는

"팔로워 2,300명에서 3개월째 정체. 뷰티 콘텐츠 위주. 릴스는 안 만들고 있음. 목표는 반년 안에 1만."

이렇게 남겨주시면, 여러분 계정에 딱 맞는 답변을 드릴 수 있습니다.

꼭 남겨주세요. 라이브가 몇 배는 더 깊어집니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -4,
    time: "09:00",
    label: "D-4 · 전자책 리마인드",
    body: `팁스타그램입니다.

혹시 1차 전자책을 아직 안 읽어보신 분 계신가요?

라이브 전에 한 번만 훑어보시길 권해드립니다. 라이브에서 다룰 개념 몇 가지가 이 안에 이미 정리되어 있어서, 미리 읽어두시면 라이브를 훨씬 더 깊게 받아가실 수 있습니다.

특히 가장 많이 캡처되는 챕터 "왜 내 게시물은 30명만 보는가"만이라도 훑어봐 주세요.

📥 1차 전자책 다운로드
{{ebook1Url}}

바쁘시면 목차만 봐도 도움이 됩니다.

이미 다 읽어보신 분은 오늘 메시지는 편하게 넘겨주셔도 좋습니다.

팁스타그램 드림`,
  },
  {
    kind: "webinar",
    offsetDays: -3,
    time: "09:00",
    label: "D-3 · 다시보기 답변 · 3가지 안내",
    body: `팁스타그램입니다.

"라이브 못 볼 것 같은데 다시보기 되나요?"라는 질문을 많이 주셔서 답해드리겠습니다.

답변에 앞서 세 가지만 꼭 말씀드리고 싶습니다.

1️⃣ 라이브는 처음이 가장 중요합니다
초반 30분에 알고리즘·구조·실행 핵심을 다 담아둡니다. 뒤늦게 들어오시면 흐름을 놓치게 됩니다. 가능하면 시작 시간에 맞춰 들어와 주세요.

2️⃣ 라이브에서만 드리는 혜택이 있습니다
참여자 한정으로 65만 원 상당의 실전 자료 세트를 무료로 드립니다. 다시보기로는 받으실 수 없는 자료이니, 가능하면 끝까지 함께해 주세요.

3️⃣ 그래도 못 오시는 분들을 위한 안전장치
참여 신청하신 분들께는 72시간 동안 다시보기 링크를 보내드립니다. 놓치신 분들도 늦지 않게 확인하실 수 있습니다.

정리하자면 — 가능하면 시작 시간에 오시고, 끝까지 있어주세요. 그게 가장 많이 가져가시는 방법입니다.

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
    label: "D-1 · 내일 · 기대감",
    body: `팁스타그램입니다.

드디어 내일입니다.

🗓 라이브 일시
{{webinarDate}}

📍 장소
Zoom (입장 링크는 시작 1시간 전에 다시 안내드립니다)

내일 이 자리에서 여러분이 얻게 되실 한 가지를 미리 말씀드릴게요.

지금까지처럼 인스타를 "감으로" 하시던 방식이 아니라, 구조를 아는 사람의 시선으로 다시 보게 되실 겁니다. 그 시선이 잡히는 순간, 내일 밤부터 올리시는 콘텐츠부터 달라집니다.

내일 준비해 두시면 좋은 것 세 가지.
· 노트와 펜
· 지금 운영 중인 인스타 계정
· 오늘까지의 성과를 짧게 정리한 메모 한 장

라이브 중 실전 적용까지 바로 하실 수 있게 준비해 두었습니다.

아직 사전 질문 안 보내신 분 계시면 오늘 중에 부탁드립니다. 오늘 남긴 질문까지만 라이브 준비에 반영합니다.
{{preQuestionUrl}}

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

노트와 펜, 그리고 지금 운영 중이신 인스타 계정 준비해 주세요. 채팅으로 질문 자유롭게 받습니다.

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
