import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { sendMessage } from "@/lib/messaging";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildEmailHtml({
  name,
  chatUrl,
  ebookUrl,
}: {
  name: string;
  chatUrl: string;
  ebookUrl: string | null;
}) {
  const ebookBlock = ebookUrl
    ? `
  <div style="background:#FFF8EB;border:1px solid #FCE6C2;border-radius:14px;padding:18px 20px;margin:28px 0;">
    <p style="font-size:13px;font-weight:800;color:#B45309;letter-spacing:2px;margin:0 0 6px;">🎁 LIVE 참여자 전용 선물</p>
    <h2 style="font-size:17px;font-weight:800;color:#111;margin:0 0 6px;">인스타그램 수익화 10가지 핵심 Q&amp;A</h2>
    <p style="font-size:13px;color:#555;margin:0 0 14px;line-height:1.65;">
      라이브에서 다루는 내용을 미리 정리한 e-Book입니다. 비매품.
    </p>
    <p style="margin:0;">
      <a href="${ebookUrl}" target="_blank" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#111;color:#fff;font-weight:800;text-decoration:none;font-size:14px;">
        📥 10가지 질문 다운로드
      </a>
    </p>
  </div>`
    : "";

  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">${name} 님, 신청 완료되었습니다 🎉</h1>
  <p style="font-size:15px;color:#444;margin:0 0 24px;">
    팁스타그램 <strong>무료 라이브</strong> 대기방 입장 안내드립니다.<br/>
    아래 버튼을 눌러 오픈 채팅방에 들어와 주세요.
  </p>
  <p style="text-align:center;margin:28px 0;">
    <a href="${chatUrl}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:15px;">
      ▶ 무료 라이브 대기방 입장하기
    </a>
  </p>
  <p style="font-size:13px;color:#666;margin:0 0 8px;">
    버튼이 안 열리면 아래 주소를 복사해서 브라우저에 붙여넣어 주세요.<br/>
    <a href="${chatUrl}" style="color:#FD1D1D;word-break:break-all;">${chatUrl}</a>
  </p>
  ${ebookBlock}
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    본 메일은 ${COMPANY.serviceName} 무료 라이브 신청자에게 자동 발송됩니다.<br/>
    문의: ${COMPANY.email}
  </p>
</div>
  `.trim();
}

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!name) return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }

  const chatUrl =
    (await getSetting(SETTING_KEYS.kakaoChatUrl)) || process.env.KAKAO_OPEN_CHAT_URL;
  if (!chatUrl) {
    console.error("kakao_open_chat_url 설정 없음");
    return NextResponse.json(
      { error: "대기방 주소가 아직 설정되지 않았습니다. 잠시 후 다시 시도해주세요." },
      { status: 503 }
    );
  }
  const ebookUrl = await getSetting(SETTING_KEYS.ebookUrl);

  // Contact 통합 (CRM)
  const contact = await upsertContactByEmail({ email, name, source: "live_signup" });

  // 중복이면 업데이트, 아니면 생성. contactId 연결.
  const signup = await prisma.liveSignup.upsert({
    where: { email },
    update: { name, contactId: contact.id },
    create: { name, email, contactId: contact.id },
  });

  await logEvent(contact.id, "live_signup", { liveSignupId: signup.id });

  // 메일 발송 (sendMessage 어댑터 경유)
  try {
    const sendResult = await sendMessage({
      to: email,
      contactId: contact.id,
      subject: `[${COMPANY.serviceName}] 무료 라이브 대기방 입장 안내`,
      body: buildEmailHtml({ name, chatUrl, ebookUrl }),
      templateKey: "live_signup_immediate",
      transactional: true,
    });
    if (!sendResult.ok) {
      console.error("Resend send error:", sendResult.error);
      return NextResponse.json(
        { error: `메일 발송 거부: ${sendResult.error}` },
        { status: 500 }
      );
    }
    await prisma.liveSignup.update({
      where: { id: signup.id },
      data: { sentAt: new Date() },
    });
  } catch (e) {
    console.error("Resend error:", e);
    return NextResponse.json(
      { error: "메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
