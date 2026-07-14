/**
 * 브라우저 timezone 무관, KST(+09:00) 기준 datetime-local 문자열 변환 유틸.
 * datetime-local input의 값(<input type="datetime-local">)은 timezone 없는 "YYYY-MM-DDTHH:mm" 문자열이므로
 * 사용자가 어느 나라에서 접속하든 KST로 강제 해석해서 UTC ISO와 왕복시켜야 한다.
 */

const pad = (n: number) => n.toString().padStart(2, "0");

/** UTC ISO(예: "2026-07-17T00:00:00.000Z") → KST datetime-local ("2026-07-17T09:00"). */
export function toKstLocalDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return (
    kst.getUTCFullYear() + "-" + pad(kst.getUTCMonth() + 1) + "-" + pad(kst.getUTCDate()) +
    "T" + pad(kst.getUTCHours()) + ":" + pad(kst.getUTCMinutes())
  );
}

/** KST datetime-local("2026-07-17T09:00") → UTC ISO 문자열. */
export function kstLocalToUtcISO(local: string): string {
  return new Date(local + "+09:00").toISOString();
}

/** UTC Date를 "7월 17일(금) 오전 9시" 형식 KST 문자열로. */
export function formatKstHuman(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  const kst = new Date(dt.getTime() + 9 * 60 * 60 * 1000);
  const dow = ["일", "월", "화", "수", "목", "금", "토"][kst.getUTCDay()];
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const hour = kst.getUTCHours();
  const minute = kst.getUTCMinutes();
  const ampm = hour < 12 ? "오전" : "오후";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const timeStr = minute === 0 ? `${ampm} ${h12}시` : `${ampm} ${h12}시 ${minute}분`;
  return `${month}월 ${day}일(${dow}) ${timeStr}`;
}
