import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";
import { isValidAccountCategory, normalizeInstagramUrl } from "@/lib/webinar-question";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDUSTRY_MAX = 100;

export async function POST(req: NextRequest) {
  let body: {
    campaignId?: string;
    name?: string;
    email?: string;
    instagram?: string;
    accountCategory?: string;
    industry?: string;
    question?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const campaignId = body.campaignId?.trim() || "";
  const name = body.name?.trim() || "";
  const email = body.email?.trim().toLowerCase() || "";
  const question = body.question?.trim() || "";
  const instagramUrl = normalizeInstagramUrl(body.instagram || "");
  const accountCategory = body.accountCategory?.trim() || "";
  const industry = body.industry?.trim().slice(0, INDUSTRY_MAX) || "";

  if (!campaignId) return NextResponse.json({ error: "campaignId 누락" }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }
  if (!instagramUrl) {
    return NextResponse.json(
      { error: "인스타그램 계정을 확인해주세요. (예: @myaccount)" },
      { status: 400 }
    );
  }
  if (!isValidAccountCategory(accountCategory)) {
    return NextResponse.json({ error: "계정 카테고리를 선택해주세요." }, { status: 400 });
  }
  if (!industry) return NextResponse.json({ error: "업종을 입력해주세요." }, { status: 400 });
  if (!question) return NextResponse.json({ error: "질문을 입력해주세요." }, { status: 400 });

  const campaign = await prisma.webinarCampaign.findUnique({
    where: { id: campaignId },
    select: { id: true },
  });
  if (!campaign) return NextResponse.json({ error: "캠페인을 찾을 수 없습니다." }, { status: 404 });

  const contact = await upsertContactByEmail({
    email,
    name: name || undefined,
    source: `webinar_question:${campaignId}`,
  });

  const q = await prisma.webinarQuestion.create({
    data: {
      campaignId,
      name: name || null,
      email,
      question,
      instagramUrl,
      accountCategory,
      industry,
      contactId: contact.id,
    },
  });

  await logEvent(contact.id, "manual_note", {
    type: "webinar_question",
    campaignId,
    questionId: q.id,
  });

  return NextResponse.json({ ok: true });
}
