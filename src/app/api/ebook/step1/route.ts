import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { sendMessage } from "@/lib/messaging";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";
import { triggerWorkflow } from "@/lib/crm/workflow-engine";
import { buildEbookStep1Email } from "../_email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = body.name?.trim() || "";
  const email = body.email?.trim().toLowerCase() || "";

  if (!name) return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }

  const ebook1Url = await getSetting(SETTING_KEYS.ebook1Url);

  const contact = await upsertContactByEmail({ email, name, source: "ebook_step1" });

  const submission = await prisma.ebookSubmission.create({
    data: { level: 1, name, email, contactId: contact.id },
  });

  await logEvent(contact.id, "manual_note", {
    type: "ebook_step1",
    submissionId: submission.id,
  });

  // 1차 신청자 후속 자동화 (예: 1분 뒤 무료 라이브 초대 메일)
  await triggerWorkflow("ebook_step1", contact.id, {
    submissionId: submission.id,
  });

  try {
    const result = await sendMessage({
      to: email,
      contactId: contact.id,
      subject: `[${COMPANY.serviceName}] 전자책 신청 완료 — 1차 전자책 안내`,
      body: buildEbookStep1Email({ name, ebook1Url }),
      templateKey: "ebook_step1_immediate",
      transactional: true,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: `메일 발송 실패: ${result.error}` },
        { status: 500 }
      );
    }
    await prisma.ebookSubmission.update({
      where: { id: submission.id },
      data: { sentAt: new Date() },
    });
  } catch (e) {
    console.error("ebook step1 send error:", e);
    return NextResponse.json(
      { error: "메일 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
