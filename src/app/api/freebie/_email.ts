import { COMPANY } from "@/lib/company";

const SITE_URL = "https://tipstagram-homepage.vercel.app";

export function buildFreebieEmail({
  name,
  title,
  fileUrl,
  customBody,
  showLivePromo,
}: {
  name: string;
  title: string;
  fileUrl: string | null;
  customBody: string | null;
  showLivePromo: boolean;
}) {
  const downloadButton = fileUrl
    ? `<a href="${fileUrl}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:#111;color:#fff;font-weight:800;text-decoration:none;font-size:15px;">📥 ${escapeHtml(title)} 다운로드</a>`
    : `<span style="display:inline-block;padding:14px 28px;border-radius:12px;background:#999;color:#fff;font-weight:800;font-size:15px;">자료 준비 중 (곧 발송 예정)</span>`;

  const livePromo = showLivePromo
    ? `
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0;"/>
  <div style="background:linear-gradient(135deg,#fff5f0,#fff8eb);border-radius:14px;padding:20px 22px;margin:0 0 12px;">
    <p style="display:inline-block;background:#FFF1F1;color:#FD1D1D;font-size:11px;font-weight:800;letter-spacing:1px;padding:5px 11px;border-radius:999px;margin:0 0 12px;">🔴 무료 LIVE</p>
    <h2 style="font-size:18px;font-weight:900;line-height:1.3;margin:0 0 10px;">${escapeHtml(name)} 님, 자료만으론 부족할 거예요.</h2>
    <p style="font-size:14px;color:#444;margin:0 0 14px;line-height:1.7;">
      <strong>1년 만에 12만 팔로워 · 누적 6억</strong>을 만든 전 과정을<br/>
      ${COMPANY.serviceName} <strong>무료 라이브</strong>에서 직접 보여드립니다.
    </p>
    <p style="margin:0;">
      <a href="${SITE_URL}/live" target="_blank" style="display:inline-block;padding:13px 24px;border-radius:11px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:14px;">
        🎟️ 무료 라이브 신청하기 →
      </a>
    </p>
    <p style="font-size:12px;color:#777;margin:14px 0 0;">참가비 0원 · 좌석 한정 · 신청 1분 완료</p>
  </div>`
    : "";

  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.75;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">${escapeHtml(name)} 님, 자료 신청 완료 🎉</h1>
  ${customBody
    ? `<div style="font-size:15px;color:#444;margin:0 0 18px;">${customBody}</div>`
    : `<p style="font-size:15px;color:#444;margin:0 0 18px;">신청해 주신 <strong>${escapeHtml(title)}</strong> 자료를 보내드립니다.</p>`}
  <p style="text-align:center;margin:24px 0;">${downloadButton}</p>
  ${livePromo}
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    본 메일은 ${COMPANY.serviceName} 자료 신청자에게 자동 발송됩니다.<br/>
    문의: ${COMPANY.email}
  </p>
</div>
  `.trim();
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
