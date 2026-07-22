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

// 강사가 입력한 평문 피드백을 안전한 HTML로 변환 (줄바꿈 보존)
export function feedbackTextToHtml(text: string): string {
  return escapeHtml(text.trim())
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
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
