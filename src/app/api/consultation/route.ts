import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";
import { sendMessage } from "@/lib/messaging";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";
import { getSetting } from "@/lib/settings";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildEmail({
  name,
}: { name: string }) {
  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">${name} 님, 진단 세션 신청이 접수됐습니다 🎯</h1>
  <p style="font-size:15px;color:#444;margin:0 0 18px;">
    무료 라이브 <strong>1:1 진단 세션</strong>을 신청해 주셔서 감사합니다.<br/>
    작성해 주신 내용은 잘 받았습니다.
  </p>
  <div style="background:#FFF8EB;border:1px solid #FCE6C2;border-radius:14px;padding:18px 20px;margin:24px 0;">
    <p style="font-size:14px;color:#92400E;font-weight:700;margin:0 0 6px;">📅 안내</p>
    <p style="font-size:14px;color:#555;margin:0;line-height:1.7;">
      신청자 중 <strong>단 5분</strong>을 선정해 1:1 진단을 진행합니다.<br/>
      <strong>선정 결과는 무료 라이브(7월 8일 저녁 8시)에서 직접 안내</strong>드립니다.<br/>
      라이브에 꼭 참여해 주세요!
    </p>
  </div>
  <p style="font-size:14px;color:#555;margin:0 0 8px;">선정되면 라이브 직후 별도 일정 안내 메일을 보내드립니다.</p>
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    본 메일은 ${COMPANY.serviceName} 진단 세션 신청자에게 자동 발송됩니다.<br/>
    문의: ${COMPANY.email}
  </p>
</div>`.trim();
}

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    instagramHandle?: string;
    followerCount?: string;
    painPoint?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = body.name?.trim() || "";
  const email = body.email?.trim().toLowerCase() || "";
  const phone = body.phone?.trim() || null;
  const instagramHandle = body.instagramHandle?.trim() || null;
  const followerCount = body.followerCount?.trim() || null;
  const painPoint = body.painPoint?.trim() || "";

  if (!name) return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }
  if (!painPoint || painPoint.length < 10) {
    return NextResponse.json({ error: "현재 고민을 10자 이상 구체적으로 적어주세요." }, { status: 400 });
  }

  const contact = await upsertContactByEmail({
    email,
    name,
    phone: phone ?? undefined,
    source: "consultation",
  });

  const reqRow = await prisma.consultationRequest.create({
    data: {
      name,
      email,
      phone,
      instagramHandle,
      followerCount,
      painPoint,
      contactId: contact.id,
    },
  });

  await logEvent(contact.id, "manual_note", {
    type: "consultation_request",
    requestId: reqRow.id,
    instagramHandle,
    followerCount,
  });

  try {
    const result = await sendMessage({
      to: email,
      contactId: contact.id,
      subject: `[${COMPANY.serviceName}] 진단 세션 신청 접수 안내`,
      body: buildEmail({ name }),
      templateKey: "consultation_received",
      transactional: true,
    });
    if (result.ok) {
      await prisma.consultationRequest.update({
        where: { id: reqRow.id },
        data: { sentAt: new Date() },
      });
    }
    // 운영자 노티 (Setting operator_email)
    const operatorEmail = (await getSetting("operator_email")) || process.env.ADMIN_EMAIL;
    if (operatorEmail) {
      await sendMessage({
        to: operatorEmail,
        subject: `[운영 알림] 진단 세션 신청 — ${name}`,
        body: `<p>새 진단 세션 신청이 접수됐습니다.</p>
<ul>
  <li>이름: ${escapeHtml(name)}</li>
  <li>이메일: ${escapeHtml(email)}</li>
  <li>전화: ${escapeHtml(phone || "-")}</li>
  <li>인스타: ${escapeHtml(instagramHandle || "-")}</li>
  <li>팔로워: ${escapeHtml(followerCount || "-")}</li>
</ul>
<p><strong>고민:</strong></p>
<pre style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:8px;">${escapeHtml(painPoint)}</pre>`,
        templateKey: "consultation_operator_notify",
        transactional: true,
      }).catch(() => {});
    }
  } catch (e) {
    console.error("consultation send error:", e);
    // 메일 실패해도 신청 자체는 성공 처리
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
