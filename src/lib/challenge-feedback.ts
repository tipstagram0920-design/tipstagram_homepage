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

  const esc = (s: string) => escapeHtml(s);

  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const first = lines[0].trim();

      // [섹션] 예: [릴스 후킹 제목 10개]
      if (/^\[.+\]$/.test(first)) {
        const title = esc(first.replace(/^\[|\]$/g, ""));
        const rest = lines.slice(1);
        const numbered = rest.filter((l) => /^\d+[.)]\s+/.test(l.trim()));
        const bodyHtml =
          numbered.length > 0
            ? `<ol style="margin:6px 0 0;padding-left:18px">${rest
                .map((l) => {
                  const m = l.trim().match(/^\d+[.)]\s+(.*)$/);
                  return m ? `<li style="margin:3px 0;line-height:1.6">${esc(m[1])}</li>` : "";
                })
                .join("")}</ol>`
            : `<div style="margin-top:4px;line-height:1.7">${esc(rest.join("\n")).replace(/\n/g, "<br/>")}</div>`;
        return `<div style="margin:14px 0;padding:12px 14px;background:#f5f3ff;border:1px solid #ede9fe;border-radius:12px"><div style="font-weight:700;color:#6d28d9;font-size:14px">✦ ${title}</div>${bodyHtml}</div>`;
      }

      // 총평
      if (/^총평\s*[:：]/.test(first)) {
        const body = esc(block.replace(/^총평\s*[:：]\s*/, "")).replace(/\n/g, "<br/>");
        return `<div style="margin:14px 0;padding:12px 14px;background:#fdf2f8;border:1px solid #fce7f3;border-radius:12px"><div style="font-weight:700;color:#be185d;font-size:14px;margin-bottom:4px">총평</div><div style="line-height:1.7;color:#111">${body}</div></div>`;
      }

      // Q 항목
      if (/^Q\d+\.\s*/.test(first)) {
        const body = esc(lines.slice(1).join("\n")).replace(/\n/g, "<br/>");
        return `<div style="margin:10px 0"><div style="font-weight:700;color:#111;font-size:14px">${esc(first)}</div>${
          body ? `<div style="margin-top:2px;line-height:1.7;color:#374151">${body}</div>` : ""
        }</div>`;
      }

      // 일반 문단
      return `<p style="margin:10px 0;line-height:1.7;color:#111">${esc(block).replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");
}

// 피드백 도착 이메일 발송 (1회). 성공 여부 반환.
export async function sendFeedbackEmail(opts: {
  email: string | null;
  name: string | null;
  contactId: string | null;
  weekIndex: number;
  cohortId: string;
}): Promise<boolean> {
  if (!opts.email) return false;
  const weekLabel = `Week ${opts.weekIndex}`;
  const link = `${SITE}/challenge/${opts.cohortId}/week/${opts.weekIndex}`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;color:#111">
      <p style="font-size:15px;line-height:1.7">안녕하세요, ${escapeHtml(opts.name || "회원")}님!</p>
      <p style="font-size:15px;line-height:1.7"><strong>${weekLabel} 숙제에 강사 피드백이 도착했어요.</strong> 아래 버튼을 눌러 확인해 주세요.</p>
      <div style="margin:24px 0">
        <a href="${link}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:700;font-size:14px">피드백 확인하기</a>
      </div>
      <p style="font-size:12px;color:#888;line-height:1.6">${COMPANY.serviceName} 5주 챌린지</p>
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
