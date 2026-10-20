import { prisma } from "@/lib/prisma";
import { formatLive } from "@/lib/challenge-schedule";
import { liveContentVersion } from "@/lib/live-ops";

/**
 * 라이브 예고 카드뉴스 자동 예약 — D-7 · D-5 · D-3 · D-2 · D-1 · D-day, 매회 18:30 KST 에 인스타+스레드.
 *
 * 9월 라이브 신청이 0명이었던 가장 큰 이유가 "인스타 20만 팔로워에게 예고가 안 나갔다" 였다(전부 수동).
 * 관제탑에서 라이브를 저장하면 SNS automation 인입 API 로 6건을 밀어 넣는다. 이미지는 홈페이지가 직접 그린다
 * (`/api/og/live/{id}?d=n`, JPEG). 같은 jobId 로 다시 밀면 인입 쪽이 날짜·문구를 갱신한다(발행된 건 제외).
 */
const OFFSETS = [7, 5, 3, 2, 1, 0] as const;
const PROMO_HOUR_KST = 18;
const PROMO_MINUTE = 30;
const KST = 9 * 60 * 60 * 1000;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tipstagram-homepage.vercel.app";

function kstDate(d: Date) {
  const k = new Date(d.getTime() + KST);
  return { y: k.getUTCFullYear(), m: k.getUTCMonth(), day: k.getUTCDate(), dow: k.getUTCDay() };
}
/** 라이브 날짜(KST) 기준 n일 전 18:30 KST */
function promoAt(startsAt: Date, n: number): Date {
  const { y, m, day } = kstDate(startsAt);
  return new Date(Date.UTC(y, m, day - n, PROMO_HOUR_KST, PROMO_MINUTE) - KST);
}
/** 그 주 월요일 (KST) YYYY-MM-DD — 인입 API 의 weekStart 규약 */
function mondayOf(d: Date): string {
  const { y, m, day, dow } = kstDate(d);
  const mon = new Date(Date.UTC(y, m, day - ((dow + 6) % 7)));
  return mon.toISOString().slice(0, 10);
}

function caption(n: number, title: string, when: string): string {
  const base = `${title}\n🗓 ${when} · 유튜브 라이브 · 무료`;
  switch (n) {
    case 7:
      return `다음 주, 무료 라이브 엽니다.\n\n${base}\n\n팔로워는 느는데 매출이 안 붙는 분들을 위해 '어디서 끊기는지'부터 짚습니다. 실시간 참여자에게만 드리는 게 따로 있어요.\n\n신청은 프로필 링크에서 👆`;
    case 5:
      return `"열심히 올리는데 왜 안 팔릴까"\n\n이 질문에 답하는 라이브, 5일 남았습니다.\n\n${base}\n\n라이브에서 다룰 것\n① 노출이 매출로 안 이어지는 3가지 지점\n② 팔로워 수와 상관없이 파는 구조\n③ 오늘 밤부터 바꿀 수 있는 것\n\n신청은 프로필 링크에서 👆`;
    case 3:
      return `3일 뒤입니다.\n\n${base}\n\n미리 질문을 남겨주시면 라이브에서 직접 답해드려요. 댓글로 '지금 제일 막히는 것' 하나만 적어주세요.\n\n신청은 프로필 링크에서 👆`;
    case 2:
      return `모레 저녁, 같이 보시죠.\n\n${base}\n\n신청하신 분께는 입장 링크를 미리 보내드립니다. 아직이면 지금 신청해 두세요 — 자리가 한정돼 있습니다.\n\n신청은 프로필 링크에서 👆`;
    case 1:
      return `내일입니다.\n\n${base}\n\n알림 켜두세요. 시작 10분 전에 입장 링크를 보내드립니다. 다시보기는 제한적으로만 열리니 실시간으로 오시는 걸 권해요.\n\n신청은 프로필 링크에서 👆`;
    default:
      return `오늘 저녁 8시, 시작합니다.\n\n${base}\n\n신청하신 분은 메일과 대기방에서 입장 링크를 확인하세요. 아직이면 지금 신청해도 늦지 않았습니다.\n\n입장은 프로필 링크에서 👆`;
  }
}

const FIRST_COMMENT = "무료 라이브 신청은 프로필 링크에서 할 수 있어요. 자리가 한정돼 있어 미리 신청해 두세요.";

export interface PromoResult { d: number; status: "scheduled" | "skipped" | "failed"; at?: string; detail?: string }

/** 6건을 밀어 넣고 결과를 LiveEvent 에 기록한다. 실패해도 저장은 성공으로 둔다. */
export async function scheduleLivePromos(liveId: string): Promise<PromoResult[]> {
  const live = await prisma.liveEvent.findUnique({ where: { id: liveId }, select: { id: true, title: true, startsAt: true, youtubeUrl: true, replayUrl: true, salesCloseAt: true, chatUrl: true, cohortId: true } });
  if (!live) return [];
  const base = (process.env.SNS_AUTOMATION_URL || "").replace(/\/$/, "");
  const secret = process.env.LIVE_PROMO_INGEST_SECRET;
  const results: PromoResult[] = [];

  if (!base || !secret) {
    await prisma.liveEvent.update({ where: { id: liveId }, data: { promoNote: "SNS_AUTOMATION_URL / LIVE_PROMO_INGEST_SECRET 미설정" } });
    return OFFSETS.map((d) => ({ d, status: "failed", detail: "env 미설정" }));
  }

  const when = formatLive(live.startsAt);
  for (const d of OFFSETS) {
    const at = promoAt(live.startsAt, d);
    if (at.getTime() < Date.now() + 15 * 60_000) {
      results.push({ d, status: "skipped", detail: "이미 지남" });
      continue;
    }
    try {
      const res = await fetch(`${base}/api/ingest/cardnews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify({
          source: "live-promo",
          jobId: `live-${live.id}-d${d}`,
          weekStart: mondayOf(at),
          postType: "photo",
          imageUrls: [`${SITE}/api/og/live/${live.id}?d=${d}`],
          caption: caption(d, live.title, when),
          firstComment: FIRST_COMMENT,
          scheduledAt: at.toISOString(),
        }),
        signal: AbortSignal.timeout(25_000),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; alreadyPublished?: boolean };
      if (res.ok && json.ok) results.push({ d, status: "scheduled", at: at.toISOString(), detail: json.alreadyPublished ? "이미 발행됨" : undefined });
      else results.push({ d, status: "failed", detail: json.error || `HTTP ${res.status}` });
    } catch (e) {
      results.push({ d, status: "failed", detail: e instanceof Error ? e.message : "network" });
    }
  }

  const ok = results.filter((r) => r.status === "scheduled").length;
  const skipped = results.filter((r) => r.status === "skipped").map((r) => `D-${r.d}`);
  const failed = results.filter((r) => r.status === "failed").map((r) => `D-${r.d}(${r.detail})`);
  const note =
    `예약 ${ok}/${OFFSETS.length}` +
    (skipped.length ? ` · 지나서 건너뜀 ${skipped.join(",")}` : "") +
    (failed.length ? ` · 실패 ${failed.join(", ")}` : "");
  await prisma.liveEvent.update({ where: { id: liveId }, data: { promoQueuedAt: new Date(), promoNote: note.slice(0, 300), promoVersion: liveContentVersion(live) } });
  return results;
}
