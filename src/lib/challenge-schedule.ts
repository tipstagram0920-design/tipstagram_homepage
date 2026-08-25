/**
 * 5주 챌린지 라이브 일정.
 *
 * 규칙(2026-08-24 확정):
 *  - 1·2·4·5주차 — 주차 오픈일 **저녁 8시** 온라인 라이브
 *  - 3주차 — 오픈일 **다음 날(토요일)** 오프라인 1:1 진단. 시간·장소는 추후 공지
 *
 * 날짜를 기수 시작일이 아니라 **주차 오픈일(ChallengeWeek.openAt)** 에서 뽑는 이유:
 * 어드민이 특정 주차만 미루면 라이브도 같이 따라가야 하기 때문이다.
 * 기수를 새로 만들면 생성 시점에 이 규칙으로 liveAt 이 채워지고, 주차 편집에서 덮어쓸 수 있다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 3주차는 오프라인 1:1 진단 (서울, 20분/인) — 상품 구성에 고정된 주차다 */
export const OFFLINE_WEEK_INDEX = 3;

/** 온라인 라이브 시각 (KST) */
export const LIVE_HOUR_KST = 20;

/** 숙제 마감 시각 (KST) — 오픈 후 6일 뒤 밤 9시 */
export const HOMEWORK_DUE_HOUR_KST = 21;
export const HOMEWORK_DUE_DAYS = 6;

/** 그 날짜(KST 기준)의 특정 시각을 UTC Date 로 */
function atKstHour(base: Date, hour: number, addDays = 0): Date {
  const k = new Date(base.getTime() + KST_OFFSET_MS);
  const utcMidnightKst = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate() + addDays, hour, 0, 0);
  return new Date(utcMidnightKst - KST_OFFSET_MS);
}

/** 기수 생성 시 채워 넣을 주차별 라이브 시각 */
export function defaultLiveAt(openAt: Date, weekIndex: number): Date {
  return weekIndex === OFFLINE_WEEK_INDEX
    ? atKstHour(openAt, LIVE_HOUR_KST, 1) // 다음 날(토). 시간은 미정이라 표시할 때 감춘다
    : atKstHour(openAt, LIVE_HOUR_KST);
}

/** 기수 생성 시 채워 넣을 주차별 숙제 마감 (오픈 +6일 밤 9시 KST) */
export function defaultHomeworkDueAt(openAt: Date): Date {
  return atKstHour(openAt, HOMEWORK_DUE_HOUR_KST, HOMEWORK_DUE_DAYS);
}

export interface LiveSession {
  weekIndex: number;
  at: Date;
  /** 오프라인 1:1 진단 여부 */
  offline: boolean;
  /** 시간·장소가 아직 안 정해졌는가 (오프라인 주차) */
  tbd: boolean;
}

/** 주차 목록 → 라이브 일정. liveAt 이 있으면 그 값을, 없으면 규칙으로 계산한다. */
export function liveSchedule(
  weeks: { weekIndex: number; openAt: Date; liveAt?: Date | null }[]
): LiveSession[] {
  return [...weeks]
    .sort((a, b) => a.weekIndex - b.weekIndex)
    .map((w) => ({
      weekIndex: w.weekIndex,
      at: w.liveAt ?? defaultLiveAt(w.openAt, w.weekIndex),
      offline: w.weekIndex === OFFLINE_WEEK_INDEX,
      tbd: w.weekIndex === OFFLINE_WEEK_INDEX,
    }));
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "9월 4일 (금) 저녁 8시" — tbd 면 시간을 뺀다 */
export function formatLive(at: Date, tbd = false): string {
  const k = new Date(at.getTime() + KST_OFFSET_MS);
  const base = `${k.getUTCMonth() + 1}월 ${k.getUTCDate()}일 (${DAYS[k.getUTCDay()]})`;
  if (tbd) return base;
  const h = k.getUTCHours();
  const label = h < 12 ? "오전" : h < 18 ? "오후" : "저녁";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${base} ${label} ${h12}시`;
}

/** 시작까지 남은 일수 (KST 날짜 기준). 지났으면 음수 */
export function daysUntil(at: Date, now = new Date()): number {
  const day = (d: Date) => {
    const k = new Date(d.getTime() + KST_OFFSET_MS);
    return Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate());
  };
  return Math.round((day(at) - day(now)) / 86400000);
}
