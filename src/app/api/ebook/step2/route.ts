import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { sendMessage } from "@/lib/messaging";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";
import { buildEbookStep2Email } from "../_email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EBOOK2_TAG = "전자책_2단계";

export async function POST(req: NextRequest) {
  let body: { email?: string; screenshotUrl?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() || "";
  const screenshotUrl = body.screenshotUrl?.trim() || "";
  const name = body.name?.trim() || "";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }
  if (!screenshotUrl) {
    return NextResponse.json({ error: "스크린샷 이미지를 업로드해주세요." }, { status: 400 });
  }

  const ebook2Url = await getSetting(SETTING_KEYS.ebook2Url);

  // 기존 contact 가져오거나 새로 만듦
  const contact = await upsertContactByEmail({
    email,
    name: name || undefined,
    source: "ebook_step2",
  });

  const submission = await prisma.ebookSubmission.create({
    data: { level: 2, name: name || null, email, screenshotUrl, contactId: contact.id },
  });

  // Contact.tags에 자동 부여 (단일 소스). 회원이면 User.tags도 동기화.
  if (!contact.tags.includes(EBOOK2_TAG)) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: { tags: { set: Array.from(new Set([...contact.tags, EBOOK2_TAG])) } },
    });
  }
  const user = await prisma.user.findUnique({ where: { contactId: contact.id } });
  if (user && !user.tags.includes(EBOOK2_TAG)) {
    const newTags = Array.from(new Set([...user.tags, EBOOK2_TAG]));
    await prisma.user.update({ where: { id: user.id }, data: { tags: newTags } });
  }
  await logEvent(contact.id, "tag_added", { tags: [EBOOK2_TAG], via: "ebook_step2" });
  await logEvent(contact.id, "manual_note", {
    type: "ebook_step2",
    submissionId: submission.id,
    screenshotUrl,
  });

  // 메일 발송 (이름이 비어 있으면 기존 contact name 우선)
  const displayName = name || contact.name || "회원";

  try {
    const result = await sendMessage({
      to: email,
      contactId: contact.id,
      subject: `[${COMPANY.serviceName}] 2차 전자책 다운로드 안내`,
      body: buildEbookStep2Email({ name: displayName, ebook2Url }),
      templateKey: "ebook_step2_immediate",
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
    console.error("ebook step2 send error:", e);
    return NextResponse.json(
      { error: "메일 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
