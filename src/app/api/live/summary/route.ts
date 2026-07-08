import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { sendMessage } from "@/lib/messaging";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUMMARY_TAG = "강의요약본_신청";
const SITE = "https://tipstagram-homepage.vercel.app";

function buildSummaryEmail({ name, url }: { name: string; url: string | null }) {
  const btn = url
    ? `<a href="${url}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:12px;background:#111;color:#fff;font-weight:800;text-decoration:none;font-size:15px;">📥 강의 요약본 다운로드</a>`
    : `<span style="display:inline-block;padding:14px 28px;border-radius:12px;background:#999;color:#fff;font-weight:800;font-size:15px;">자료 준비 중 (곧 발송)</span>`;
  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">${name} 님, 요약본 보내드려요 📩</h1>
  <p style="font-size:15px;color:#444;margin:0 0 22px;">
    강의를 인증해 주셔서 감사합니다.<br/>
    아래 버튼으로 강의 요약본을 바로 받아 가세요.
  </p>
  <p style="text-align:center;margin:22px 0;">${btn}</p>
  <p style="font-size:14px;color:#666;margin:24px 0 0;">
    다운로드가 안 되면 답장 주세요. 다른 방법으로 안내해 드리겠습니다.
  </p>
  <hr style="border:none;border-top:1px solid #EEE;margin:28px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    본 메일은 ${COMPANY.serviceName} 강의 요약본 신청자에게 자동 발송됩니다.<br/>
    문의: ${COMPANY.email}
  </p>
</div>
  `.trim();
}

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; screenshotUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = body.name?.trim() || "";
  const email = body.email?.trim().toLowerCase() || "";
  const screenshotUrl = body.screenshotUrl?.trim() || "";

  if (!name) return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }
  if (!screenshotUrl) {
    return NextResponse.json({ error: "스토리 스크린샷을 업로드해주세요." }, { status: 400 });
  }

  const summaryUrl = await getSetting(SETTING_KEYS.webinarSummaryUrl);

  // Contact 통합 + level=3(요약본 신청)으로 EbookSubmission 기록 재사용
  const contact = await upsertContactByEmail({ email, name, source: "webinar_summary" });
  const submission = await prisma.ebookSubmission.create({
    data: {
      level: 3,
      name,
      email,
      screenshotUrl,
      contactId: contact.id,
    },
  });

  // Contact.tags 에 자동 태그 부여
  if (!contact.tags.includes(SUMMARY_TAG)) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: { tags: { set: Array.from(new Set([...contact.tags, SUMMARY_TAG])) } },
    });
  }
  const user = await prisma.user.findUnique({ where: { contactId: contact.id } });
  if (user && !user.tags.includes(SUMMARY_TAG)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { tags: Array.from(new Set([...user.tags, SUMMARY_TAG])) },
    });
  }

  await logEvent(contact.id, "manual_note", {
    type: "webinar_summary",
    submissionId: submission.id,
    screenshotUrl,
  });

  try {
    const result = await sendMessage({
      to: email,
      contactId: contact.id,
      subject: `[${COMPANY.serviceName}] 강의 요약본 다운로드 안내`,
      body: buildSummaryEmail({ name, url: summaryUrl }),
      templateKey: "webinar_summary_immediate",
      transactional: true,
    });
    if (result.ok) {
      await prisma.ebookSubmission.update({
        where: { id: submission.id },
        data: { sentAt: new Date() },
      });
    } else {
      console.error("summary send error:", result.error);
    }
  } catch (e) {
    console.error("summary send exception:", e);
  }

  return NextResponse.json({ ok: true, siteUrl: SITE });
}
