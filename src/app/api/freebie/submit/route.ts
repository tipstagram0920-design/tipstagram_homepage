import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";
import { sendMessage } from "@/lib/messaging";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";
import { triggerWorkflow } from "@/lib/crm/workflow-engine";
import { buildFreebieEmail } from "../_email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { freebieId?: string; slug?: string; name?: string; email?: string };
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

  // freebie 조회 (id 또는 slug)
  const freebie = body.freebieId
    ? await prisma.freebie.findUnique({ where: { id: body.freebieId } })
    : body.slug
    ? await prisma.freebie.findUnique({ where: { slug: body.slug } })
    : null;
  if (!freebie || !freebie.isActive) {
    return NextResponse.json({ error: "자료를 찾을 수 없습니다." }, { status: 404 });
  }

  const contact = await upsertContactByEmail({ email, name, source: `freebie:${freebie.slug}` });
  const submission = await prisma.freebieSubmission.create({
    data: { freebieId: freebie.id, name, email, contactId: contact.id },
  });

  await logEvent(contact.id, "manual_note", {
    type: "freebie_signup",
    freebieId: freebie.id,
    freebieSlug: freebie.slug,
    freebieTitle: freebie.title,
    submissionId: submission.id,
  });

  // 워크플로우 트리거 (freebie_signup)
  await triggerWorkflow(
    "freebie_signup" as Parameters<typeof triggerWorkflow>[0],
    contact.id,
    { freebieSlug: freebie.slug, freebieTitle: freebie.title }
  );

  try {
    const result = await sendMessage({
      to: email,
      contactId: contact.id,
      subject: `[${COMPANY.serviceName}] ${freebie.title} 다운로드 안내`,
      body: buildFreebieEmail({
        name,
        title: freebie.title,
        fileUrl: freebie.fileUrl,
        customBody: freebie.customEmailBody,
        showLivePromo: freebie.showLivePromo,
      }),
      templateKey: `freebie_${freebie.slug}`,
      transactional: true,
    });
    if (result.ok) {
      await prisma.freebieSubmission.update({
        where: { id: submission.id },
        data: { sentAt: new Date() },
      });
    }
  } catch (e) {
    console.error("freebie send error:", e);
  }

  return NextResponse.json({ ok: true });
}
