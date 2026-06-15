import { COMPANY } from "@/lib/company";

const SITE_URL = "https://tipstagram-homepage.vercel.app";

export function buildEbookStep1Email({
  name,
  ebook1Url,
}: {
  name: string;
  ebook1Url: string | null;
}) {
  const downloadButton = ebook1Url
    ? `<a href="${ebook1Url}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:#111;color:#fff;font-weight:800;text-decoration:none;font-size:15px;">📥 1차 전자책 다운로드</a>`
    : `<span style="display:inline-block;padding:14px 28px;border-radius:12px;background:#999;color:#fff;font-weight:800;font-size:15px;">전자책 준비 중 (곧 발송 예정)</span>`;

  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">${name} 님, 전자책 신청 완료 🎉</h1>
  <p style="font-size:15px;color:#444;margin:0 0 24px;">
    1차 전자책을 받으시고, 2차 전자책까지 무료로 받아가세요.<br/>
    아래 두 버튼이 있습니다.
  </p>

  <h3 style="font-size:14px;font-weight:800;color:#FD1D1D;margin:24px 0 8px;letter-spacing:2px;">STEP 1</h3>
  <p style="font-size:14px;color:#444;margin:0 0 14px;">
    아래에서 <strong>1차 전자책을 바로 다운로드</strong>받을 수 있습니다.
  </p>
  <p style="text-align:center;margin:18px 0;">
    ${downloadButton}
  </p>

  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0;"/>

  <h3 style="font-size:14px;font-weight:800;color:#FD1D1D;margin:0 0 8px;letter-spacing:2px;">STEP 2</h3>
  <p style="font-size:14px;color:#444;margin:0 0 14px;">
    간단한 인증을 거치면 <strong>2차 전자책</strong>까지 무료로 받으실 수 있습니다.<br/>
    아래 버튼을 눌러 인증 방법을 확인하세요.
  </p>
  <p style="text-align:center;margin:18px 0 32px;">
    <a href="${SITE_URL}/ebook/step2" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:15px;">
      🎁 2차 전자책 신청하기
    </a>
  </p>

  <hr style="border:none;border-top:1px solid #EEE;margin:24px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    본 메일은 ${COMPANY.serviceName} 전자책 신청자에게 자동 발송됩니다.<br/>
    문의: ${COMPANY.email}
  </p>
</div>
  `.trim();
}

export function buildEbookStep2Email({
  name,
  ebook2Url,
}: {
  name: string;
  ebook2Url: string | null;
}) {
  const downloadButton = ebook2Url
    ? `<a href="${ebook2Url}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:15px;">📥 2차 전자책 다운로드</a>`
    : `<span style="display:inline-block;padding:14px 28px;border-radius:12px;background:#999;color:#fff;font-weight:800;font-size:15px;">전자책 준비 중 (곧 발송 예정)</span>`;

  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">${name} 님, 인증 완료 🎉</h1>
  <p style="font-size:15px;color:#444;margin:0 0 24px;">
    2차 전자책 신청을 확인했습니다.<br/>
    아래에서 바로 다운로드받을 수 있습니다.
  </p>

  <p style="text-align:center;margin:28px 0;">
    ${downloadButton}
  </p>

  <p style="font-size:14px;color:#666;margin:24px 0 0;line-height:1.7;">
    스토리에 올려주신 이미지가 많은 분들에게 도움이 됩니다.<br/>
    좋은 인사이트와 매출을 만드시길 응원합니다.
  </p>

  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    본 메일은 ${COMPANY.serviceName} 전자책 신청자에게 자동 발송됩니다.<br/>
    문의: ${COMPANY.email}
  </p>
</div>
  `.trim();
}
