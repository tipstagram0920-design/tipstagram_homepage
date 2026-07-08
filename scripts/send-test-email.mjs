import "dotenv/config";
import { Resend } from "resend";

const TO = "hogny1@naver.com";
const FROM_ADDR = process.env.MAIL_FROM || "noreply@tipstagram.co.kr";

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY 미설정");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

const html = `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.75;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">📋 SYSTEM TEST</p>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">CRM·자동화 시스템 발송 테스트</h1>
  <p style="font-size:15px;color:#444;margin:0 0 16px;">
    이 메일이 도착했다면 Resend 발송, 발신자 도메인(tipstagram.co.kr) 인증,
    그리고 운영자 알림 인프라가 모두 정상 동작 중인 거예요.
  </p>
  <div style="background:#F7F7F7;border:1px solid #EEE;border-radius:12px;padding:16px;font-size:14px;color:#444;margin:18px 0;">
    <p style="margin:0 0 8px;"><strong>현재 구축된 자동화</strong></p>
    <ul style="margin:0;padding-left:18px;line-height:1.8;">
      <li>라이브 신청 → 입장 안내 + 카톡방 URL 메일</li>
      <li>1차 전자책 신청 → 다운로드 + 2차 안내 메일</li>
      <li>2차 전자책 인증 → 다운로드 메일</li>
      <li>진단 세션 신청 → 접수 + 운영자 알림</li>
      <li>웨비나 캠페인 → D-10 ~ 마감 자동 11단계 시퀀스</li>
      <li>운영 to-do → 시각 도래 시 운영자(이 메일)에게 알림</li>
    </ul>
  </div>
  <p style="font-size:14px;color:#666;margin:0;">발송 시각: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "long", timeStyle: "long" })}</p>
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    팁스타그램 어드민 시스템 자동 발송 · 본 메일은 운영자(${TO})에게 발송됩니다.
  </p>
</div>
`.trim();

console.log(`발송 시도: ${FROM_ADDR} → ${TO}`);

const result = await resend.emails.send({
  from: `팁스타그램 <${FROM_ADDR}>`,
  to: TO,
  subject: "[테스트] 팁스타그램 CRM·자동화 시스템 정상 동작 확인",
  html,
});

if (result.error) {
  console.error("❌ 발송 실패:", result.error);
  process.exit(1);
}

console.log("✅ 발송 성공");
console.log("Resend ID:", result.data?.id);
