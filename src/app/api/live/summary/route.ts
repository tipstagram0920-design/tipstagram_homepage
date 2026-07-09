import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { sendMessage } from "@/lib/messaging";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";
import { buildSummaryEmail } from "@/lib/summary-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUMMARY_TAG = "강의요약본_신청";
const SITE = "https://tipstagram-homepage.vercel.app";

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

  const [summaryUrl, faqUrl, hookUrl] = await Promise.all([
    getSetting(SETTING_KEYS.webinarSummaryUrl),
    getSetting(SETTING_KEYS.webinarFaqUrl),
    getSetting(SETTING_KEYS.webinarHookUrl),
  ]);

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
      body: buildSummaryEmail({ name, url: summaryUrl, faqUrl, hookUrl }),
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
