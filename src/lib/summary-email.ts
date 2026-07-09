import { COMPANY } from "@/lib/company";

/**
 * 강의 인증·설문 응답자에게 자동 발송되는 3종 자료 이메일 본문 빌더.
 * - 요약본 (검정 버튼)
 * - 인스타그램 자주 묻는 질문 10 (그라디언트)
 * - 50만+ 인스타 후킹 패턴 50선 (검정 + 그라디언트 테두리)
 * URL이 null인 항목은 자동으로 버튼이 숨겨지고, 헤더 문구도 총 개수에 맞게 자동 조정.
 */
export function buildSummaryEmail({
  name,
  url,
  faqUrl,
  hookUrl,
  intro,
  heroLabel,
}: {
  name: string;
  url: string | null;
  faqUrl: string | null;
  hookUrl: string | null;
  intro?: string;
  heroLabel?: string;
}) {
  const summaryBtn = url
    ? `<a href="${url}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:#111;color:#fff;font-weight:800;text-decoration:none;font-size:15px;">📥 강의 요약본 다운로드</a>`
    : `<span style="display:inline-block;padding:14px 28px;border-radius:12px;background:#999;color:#fff;font-weight:800;font-size:15px;">자료 준비 중 (곧 발송)</span>`;
  const faqBtn = faqUrl
    ? `<a href="${faqUrl}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:15px;">🎁 인스타그램 자주 묻는 질문 10</a>`
    : "";
  const hookBtn = hookUrl
    ? `<a href="${hookUrl}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:#111;color:#fff;font-weight:800;text-decoration:none;font-size:15px;border:2px solid transparent;background-image:linear-gradient(#111,#111),linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);background-origin:border-box;background-clip:padding-box,border-box;">🔥 50만+ 인스타 후킹 패턴 50선</a>`
    : "";
  const bonusCount = [faqBtn, hookBtn].filter(Boolean).length;
  const totalCount = 1 + bonusCount;
  const heading =
    heroLabel ??
    (totalCount >= 3
      ? "자료 세 가지 보내드려요 📩"
      : totalCount === 2
        ? "자료 두 가지 보내드려요 📩"
        : "요약본 보내드려요 📩");
  const introText =
    intro ??
    `강의를 인증해 주셔서 감사합니다.<br/>아래 자료를 함께 받아 가세요. 오늘 바로 활용해 보시면 좋아요.`;
  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">${name} 님, ${heading}</h1>
  <p style="font-size:15px;color:#444;margin:0 0 22px;">${introText}</p>
  <p style="text-align:center;margin:22px 0;">${summaryBtn}</p>
  ${faqBtn ? `<p style="text-align:center;margin:14px 0;">${faqBtn}</p>` : ""}
  ${hookBtn ? `<p style="text-align:center;margin:14px 0 22px;">${hookBtn}</p>` : ""}
  <p style="font-size:14px;color:#666;margin:24px 0 0;">
    다운로드가 안 되면 답장 주세요. 다른 방법으로 안내해 드리겠습니다.
  </p>
  <hr style="border:none;border-top:1px solid #EEE;margin:28px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    본 메일은 ${COMPANY.serviceName} 강의 관련 신청·응답자에게 자동 발송됩니다.<br/>
    문의: ${COMPANY.email}
  </p>
</div>
  `.trim();
}
