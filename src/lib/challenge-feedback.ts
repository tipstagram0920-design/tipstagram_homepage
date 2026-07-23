import { sendMessage } from "@/lib/messaging";
import { COMPANY } from "@/lib/company";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tipstagram-homepage.vercel.app";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 강사(또는 AI)가 작성한 평문 피드백을 섹션별로 보기 좋은 HTML로 변환.
// 인식: "Q1./Q2. …" 항목, "총평:", "[…]" 섹션, "1. 2. …" 번호 목록. (이메일·웹 공용 인라인 스타일)
export function feedbackTextToHtml(text: string): string {
  const blocks = text
    .trim()
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  // 이스케이프 후 URL을 클릭 가능한 링크로 변환
  const esc = (s: string) =>
    escapeHtml(s).replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" style="color:#be185d;text-decoration:underline;word-break:break-all">$1</a>'
    );

  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const first = lines[0].trim();

      // [섹션] 예: [릴스 후킹 제목 10개], [관련 참고 릴스]
      if (/^\[.+\]$/.test(first)) {
        const title = escapeHtml(first.replace(/^\[|\]$/g, ""));
        const rest = lines.slice(1);
        const bodyHtml = rest
          .map((l) => {
            const t = l.trim();
            if (!t) return "";
            const m = t.match(/^\d+[.)]\s+(.*)$/);
            if (m) {
              const num = t.match(/^(\d+)/)?.[1] ?? "";
              return `<div style="margin:4px 0;line-height:1.6"><span style="font-weight:700;color:#6d28d9">${num}.</span> ${esc(m[1])}</div>`;
            }
            return `<div style="margin:4px 0;line-height:1.6;color:#4b5563">${esc(t)}</div>`;
          })
          .join("");
        return `<div style="margin:14px 0;padding:12px 14px;background:#f5f3ff;border:1px solid #ede9fe;border-radius:12px"><div style="font-weight:700;color:#6d28d9;font-size:14px;margin-bottom:4px">✦ ${title}</div>${bodyHtml}</div>`;
      }

      // 총평
      if (/^총평\s*[:：]/.test(first)) {
        const body = esc(block.replace(/^총평\s*[:：]\s*/, "")).replace(/\n/g, "<br/>");
        return `<div style="margin:14px 0;padding:12px 14px;background:#fdf2f8;border:1px solid #fce7f3;border-radius:12px"><div style="font-weight:700;color:#be185d;font-size:14px;margin-bottom:4px">총평</div><div style="line-height:1.7;color:#111">${body}</div></div>`;
      }

      // Q 항목
      if (/^Q\d+\.\s*/.test(first)) {
        const body = esc(lines.slice(1).join("\n")).replace(/\n/g, "<br/>");
        return `<div style="margin:10px 0"><div style="font-weight:700;color:#111;font-size:14px">${escapeHtml(first)}</div>${
          body ? `<div style="margin-top:2px;line-height:1.7;color:#374151">${body}</div>` : ""
        }</div>`;
      }

      // 일반 문단
      return `<p style="margin:10px 0;line-height:1.7;color:#111">${esc(block).replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");
}

// 피드백 도착 이메일 발송 (1회). 피드백 내용을 디자인된 이메일에 담아 보낸다. 성공 여부 반환.
export async function sendFeedbackEmail(opts: {
  email: string | null;
  name: string | null;
  contactId: string | null;
  weekIndex: number;
  cohortId: string;
  feedbackHtml?: string; // 본문에 임베드할 피드백(feedbackTextToHtml 결과)
}): Promise<boolean> {
  if (!opts.email) return false;
  const weekLabel = `Week ${opts.weekIndex}`;
  const link = `${SITE}/challenge/${opts.cohortId}/week/${opts.weekIndex}`;
  const feedbackBlock = opts.feedbackHtml
    ? `<div style="margin:20px 0;padding:18px 20px;border:1px solid #eee;border-radius:16px;background:#fff">${opts.feedbackHtml}</div>`
    : "";

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#111;padding:8px">
      <div style="height:6px;border-radius:99px;background:linear-gradient(90deg,#833AB4,#FD1D1D,#FCAF45);margin-bottom:22px"></div>
      <p style="font-size:16px;line-height:1.7;margin:0 0 4px">안녕하세요, <strong>${escapeHtml(opts.name || "회원")}</strong>님!</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 4px"><strong>${weekLabel} 숙제 피드백</strong>이 도착했어요. 아래에서 바로 확인해 보세요.</p>
      ${feedbackBlock}
      <div style="margin:24px 0 8px">
        <a href="${link}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:700;font-size:14px">사이트에서 보기 / 다음 주 이어가기</a>
      </div>
      <div style="height:1px;background:#eee;margin:24px 0"></div>
      <p style="font-size:12px;color:#888;line-height:1.6;margin:0">${COMPANY.serviceName} 5주 챌린지</p>
    </div>`;
  const res = await sendMessage({
    to: opts.email,
    subject: `[${COMPANY.serviceName}] ${weekLabel} 숙제 피드백이 도착했어요`,
    body: html,
    templateKey: "challenge_feedback",
    contactId: opts.contactId ?? undefined,
    transactional: true,
  });
  return res.ok;
}
