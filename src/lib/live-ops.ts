import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { setSetting, SETTING_KEYS } from "@/lib/settings";
import { PRESET_STEPS } from "@/lib/crm/webinar-preset";
import { reseedCampaignSequences } from "@/lib/crm/campaign-reseed";
import { createCohortWithWeeks } from "@/lib/challenge-cohort";
import { syncLiveToTipskit } from "@/lib/tipskit-sync";
import { scheduleLivePromos } from "@/lib/live-promo";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tipstagram-homepage.vercel.app";
const CHALLENGE_SLUG = "5-week-challenge";

/**
 * 라이브 '내용'의 해시. ack·예고 기록 같은 부수 갱신은 updatedAt 을 바꾸지만 내용은 그대로다 —
 * 그걸 "바뀌었다"고 보면 맥이 5분마다 캠페인을 다시 만든다. 그래서 비교는 전부 이 값으로 한다.
 */
export function liveContentVersion(l: {
  title: string; startsAt: Date; youtubeUrl: string | null; replayUrl: string | null;
  salesCloseAt: Date | null; chatUrl: string | null; cohortId: string | null;
}): string {
  const raw = JSON.stringify([l.title, l.startsAt.toISOString(), l.youtubeUrl, l.replayUrl, l.salesCloseAt?.toISOString() ?? null, l.chatUrl, l.cohortId]);
  return createHash("sha1").update(raw).digest("hex").slice(0, 12);
}

export interface LiveOpsInput {
  id?: string;
  title: string;
  startsAt: string; // ISO
  youtubeUrl?: string | null;
  replayUrl?: string | null;
  signupCloseAt?: string | null;
  salesCloseAt?: string | null;
  chatUrl?: string | null;
  /** 기존 기수에 연결 */
  cohortId?: string | null;
  /** 새 기수 만들기 — 시작일만 주면 주차·라이브 일정은 규칙대로 깔린다 */
  newCohort?: { name: string; week1StartAt: string } | null;
  cohortChatUrl?: string | null;
}

const clean = (v: string | null | undefined) => {
  const t = (v ?? "").trim();
  if (!t) return null;
  const m = t.match(/https?:\/\/\S+/); // 초대장 전문이 통째로 와도 첫 URL만
  return m ? m[0] : t;
};

/**
 * 라이브 한 회차 저장 — 여기 한 번이면 아래가 전부 맞춰진다.
 *  ① LiveEvent(원본)  ② /live 랜딩·신청 메일이 읽는 설정값  ③ 웨비나 메일 캠페인(11단계) + 카톡 문안
 *  ④ 챌린지 기수(생성 또는 연결)  ⑤ 팁스킷 live_events(→ 팁스킷 /live·메타 광고 랜딩)
 */
export async function saveLiveEvent(input: LiveOpsInput) {
  const startsAt = new Date(input.startsAt);
  if (isNaN(startsAt.getTime())) throw new Error("라이브 일시가 올바르지 않습니다.");
  const youtubeUrl = clean(input.youtubeUrl);
  const replayUrl = clean(input.replayUrl);
  const chatUrl = clean(input.chatUrl);
  const cohortChatUrl = clean(input.cohortChatUrl);
  const salesCloseAt = input.salesCloseAt ? new Date(input.salesCloseAt) : null;
  const signupCloseAt = input.signupCloseAt ? new Date(input.signupCloseAt) : null;

  // ④ 기수 — 새로 만들거나 기존 것에 연결. 기수 오픈챗은 여기서 같이 갱신한다.
  let cohortId = input.cohortId ?? null;
  if (input.newCohort?.week1StartAt) {
    const created = await createCohortWithWeeks({
      name: input.newCohort.name || `${startsAt.getFullYear()}년 ${startsAt.getMonth() + 2}월 기수`,
      productSlug: CHALLENGE_SLUG,
      week1StartAt: new Date(input.newCohort.week1StartAt),
      openChatUrl: cohortChatUrl,
    });
    cohortId = created.id;
  } else if (cohortId && cohortChatUrl !== undefined) {
    await prisma.challengeCohort.update({ where: { id: cohortId }, data: { openChatUrl: cohortChatUrl } });
  }

  // ① 원본
  const existing = input.id ? await prisma.liveEvent.findUnique({ where: { id: input.id } }) : null;
  const live = existing
    ? await prisma.liveEvent.update({
        where: { id: existing.id },
        data: { title: input.title, startsAt, youtubeUrl, replayUrl, signupCloseAt, salesCloseAt, chatUrl, cohortId },
      })
    : await prisma.liveEvent.create({
        data: { title: input.title, startsAt, youtubeUrl, replayUrl, signupCloseAt, salesCloseAt, chatUrl, cohortId },
      });

  // ② /live 신청 메일·프리셋 폴백이 읽는 설정값을 같은 값으로
  if (chatUrl) await setSetting(SETTING_KEYS.kakaoChatUrl, chatUrl);
  if (youtubeUrl) await setSetting(SETTING_KEYS.webinarZoomUrl, youtubeUrl);

  // ③ 캠페인 — 없으면 프리셋으로 만들고 켠다. 있으면 날짜·링크만 갱신하고, 바뀐 게 있으면 문안을 다시 깐다.
  const campaignData = {
    name: input.title,
    webinarDate: startsAt,
    endDate: salesCloseAt,
    zoomUrl: youtubeUrl,
    replayUrl,
    kakaoChatUrl: chatUrl,
    salesUrl: `${SITE}/courses/monetization-program`, // 라이브에서 파는 상품 = 100만원 수익화 프로그램 (2026-10-20 통합)
    isActive: true,
  };
  let campaignId = live.campaignId;
  let reseeded = false;
  if (!campaignId) {
    const c = await prisma.webinarCampaign.create({
      data: { ...campaignData, audience: {}, steps: PRESET_STEPS as unknown as object, skipPast: true },
    });
    await prisma.webinarCampaign.update({ where: { id: c.id }, data: { preQuestionUrl: `${SITE}/webinar/ask/${c.id}` } });
    campaignId = c.id;
    await reseedCampaignSequences(campaignId);
    reseeded = true;
  } else {
    const prev = await prisma.webinarCampaign.findUnique({ where: { id: campaignId } });
    await prisma.webinarCampaign.update({ where: { id: campaignId }, data: campaignData });
    const changed =
      !prev ||
      prev.webinarDate.getTime() !== startsAt.getTime() ||
      (prev.endDate?.getTime() ?? 0) !== (salesCloseAt?.getTime() ?? 0) ||
      prev.zoomUrl !== youtubeUrl ||
      prev.replayUrl !== replayUrl ||
      prev.kakaoChatUrl !== chatUrl;
    if (changed) {
      await reseedCampaignSequences(campaignId); // 카톡 문안엔 날짜·링크가 박혀 있어 다시 만들어야 한다
      reseeded = true;
    }
  }

  // ⑤ 팁스킷 — 팁스킷 /live 와 메타 광고 랜딩이 여기서 읽는다
  const tipskitSlug = live.tipskitSlug ?? `hp-${live.id}`;
  const sync = await syncLiveToTipskit({ slug: tipskitSlug, title: input.title, startsAt, chatUrl, visible: true });

  // ⑥ 인스타·스레드 예고 카드뉴스 6건 (D-7…D-day). 결과는 promoNote 에, 실패해도 저장은 성공
  await scheduleLivePromos(live.id).catch(() => {});

  return prisma.liveEvent.update({
    where: { id: live.id },
    data: {
      campaignId,
      tipskitSlug,
      tipskitSyncedAt: sync.ok ? new Date() : live.tipskitSyncedAt,
      tipskitSyncError: sync.ok ? null : sync.error,
    },
    include: { cohort: true, campaign: true },
  }).then((row) => ({ live: row, reseeded }));
}

/** 다음 라이브(아직 안 지난 것 중 가장 이른). /live 랜딩이 쓴다. */
export async function nextLiveEvent() {
  return prisma.liveEvent.findFirst({
    where: { isActive: true, startsAt: { gte: new Date(Date.now() - 3 * 60 * 60 * 1000) } }, // 진행 중(3시간)까지 포함
    orderBy: { startsAt: "asc" },
    include: { cohort: { select: { id: true, name: true, week1StartAt: true, openChatUrl: true } } },
  });
}

export interface ChecklistItem { ok: boolean; label: string; hint?: string; href?: string }

/** 관제탑 체크리스트 — "놓친 것"을 저장 화면에서 바로 보여준다 */
export async function liveOpsChecklist(liveId: string): Promise<ChecklistItem[]> {
  const live = await prisma.liveEvent.findUnique({
    where: { id: liveId },
    include: { cohort: true, campaign: { include: { _count: { select: { sends: true } } } } },
  });
  if (!live) return [];
  const items: ChecklistItem[] = [];
  const now = Date.now();

  items.push({ ok: live.startsAt.getTime() > now, label: "라이브 일시가 미래", hint: "지난 일시면 메일·문안이 전부 건너뛰어진다" });
  items.push({ ok: !!live.youtubeUrl, label: "입장 링크(유튜브) 입력", hint: "비면 당일 '입장 링크' 메일이 빈칸으로 나간다" });
  items.push({ ok: !!live.chatUrl, label: "라이브 오픈채팅 입력", hint: "신청 완료 메일이 이 주소를 보낸다" });
  items.push({ ok: !!live.salesCloseAt, label: "판매 마감 설정", hint: "마감 D-3 메일과 카운트다운의 기준" });
  items.push({
    ok: !!live.campaign?.isActive,
    label: "웨비나 메일 캠페인 활성",
    hint: live.campaign ? `발송 ${live.campaign._count.sends}건` : "캠페인 없음",
    href: live.campaign ? `/admin/crm/webinar/${live.campaign.id}/edit` : "/admin/crm/webinar",
  });
  items.push({ ok: !!live.cohort, label: "챌린지 기수 연결", hint: "라이브에서 파는 기수. 없으면 수강생 안내 페이지가 안 생긴다", href: live.cohort ? `/admin/challenge/${live.cohort.id}` : "/admin/challenge" });
  items.push({ ok: !!live.cohort?.openChatUrl, label: "기수 오픈채팅 입력", hint: "결제 직후 안내 페이지의 입장 버튼" });
  items.push({ ok: !!live.tipskitSyncedAt && !live.tipskitSyncError, label: "팁스킷·광고 랜딩 동기화", hint: live.tipskitSyncError ?? undefined });

  // 맥의 카톡 자동화는 5분마다 당겨간다. 저장(updatedAt) 이후에 ack 가 왔어야 "반영됨"이다.
  const version = liveContentVersion(live);
  const kakaoFresh = !!live.kakaoQueuedAt && live.kakaoVersion === version;
  items.push({
    ok: kakaoFresh,
    label: "카톡 대기방 공지·시퀀스 예약",
    hint: kakaoFresh
      ? live.kakaoNote ?? undefined
      : "맥의 카톡 자동화가 5분 안에 가져갑니다. 10분 넘게 안 바뀌면 맥이 꺼져 있거나 잠겨 있는 것입니다.",
  });

  const promoFresh = !!live.promoQueuedAt && live.promoVersion === version;
  items.push({
    ok: promoFresh && !(live.promoNote ?? "").includes("실패") && !(live.promoNote ?? "").includes("미설정"),
    label: "인스타·스레드 예고 카드뉴스 (D-7·5·3·2·1·당일)",
    hint: live.promoNote ?? "저장하면 SNS automation 에 6건 예약됩니다",
  });

  const clicks = await prisma.liveEnterClick.groupBy({ by: ["via"], where: { liveId }, _count: { _all: true } }).catch(() => []);
  const total = clicks.reduce((s, c) => s + c._count._all, 0);
  if (total > 0 || live.startsAt.getTime() < now) {
    const byVia = clicks.map((c) => `${c.via === "email" ? "메일" : c.via === "kakao" ? "카톡" : c.via} ${c._count._all}`).join(" · ");
    items.push({ ok: true, label: `입장 링크 클릭 ${total}명${byVia ? ` (${byVia})` : ""}`, hint: "참석의 근사치. 메일은 누가 눌렀는지까지 남습니다" });
  }

  const wf = await prisma.workflow.findMany({ where: { trigger: "live_signup" }, select: { isActive: true } }).catch(() => []);
  items.push({ ok: wf.some((w) => w.isActive), label: "신청 직후 워크플로우 활성", hint: "꺼져 있으면 신청자가 오픈챗 메일 한 통만 받는다", href: "/admin/crm/workflows" });

  return items;
}
