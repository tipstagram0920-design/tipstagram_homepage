import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { sendMessage } from "@/lib/messaging";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";
import { buildSummaryEmail } from "@/lib/summary-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SURVEY_TAG = "라이브설문_응답";
const SITE = "https://tipstagram-homepage.vercel.app";

interface SurveyBody {
  name?: string;
  email?: string;
  channelSource?: string;
  goodPoints?: string;
  badPoints?: string;
  hasPaidSignup?: boolean;
  paidReason?: string;
}

const TRIM_MAX = 2000;

function clean(v: string | undefined): string {
  return (v || "").trim().slice(0, TRIM_MAX);
}

export async function POST(req: NextRequest) {
  let body: SurveyBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = clean(body.name);
  const email = body.email?.trim().toLowerCase() || "";
  const channelSource = clean(body.channelSource);
  const goodPoints = clean(body.goodPoints);
  const badPoints = clean(body.badPoints);
  const hasPaidSignup = body.hasPaidSignup === true;
  const paidReason = clean(body.paidReason);

  if (!name) return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }
  if (!channelSource) {
    return NextResponse.json({ error: "무료 강의 유입 채널을 선택해주세요." }, { status: 400 });
  }
  if (!goodPoints || !badPoints) {
    return NextResponse.json({ error: "좋았던 점·아쉬운 점을 모두 남겨주세요." }, { status: 400 });
  }
  if (typeof body.hasPaidSignup !== "boolean") {
    return NextResponse.json({ error: "유료 강의 신청 여부를 선택해주세요." }, { status: 400 });
  }
  if (!paidReason) {
    return NextResponse.json({ error: "유료 강의 관련 이유를 남겨주세요." }, { status: 400 });
  }

  const [summaryUrl, faqUrl, hookUrl] = await Promise.all([
    getSetting(SETTING_KEYS.webinarSummaryUrl),
    getSetting(SETTING_KEYS.webinarFaqUrl),
    getSetting(SETTING_KEYS.webinarHookUrl),
  ]);

  const contact = await upsertContactByEmail({ email, name, source: "webinar_survey" });

  // Contact.tags 에 자동 태그 부여 (라이브설문_응답 + 유입 채널)
  const newTags = new Set(contact.tags);
  newTags.add(SURVEY_TAG);
  newTags.add(hasPaidSignup ? "설문_유료신청함" : "설문_유료미신청");
  if (channelSource) newTags.add(`유입_${channelSource}`);
  if (newTags.size !== contact.tags.length) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: { tags: { set: Array.from(newTags) } },
    });
  }

  // 응답 자체는 CRM Event.payload 에 저장 → 어드민 컨택트 상세 타임라인에서 조회 가능
  await logEvent(contact.id, "manual_note", {
    type: "webinar_survey",
    channelSource,
    goodPoints,
    badPoints,
    hasPaidSignup,
    paidReason,
  });

  // 3종 자료 이메일 자동 발송
  try {
    const intro = hasPaidSignup
      ? "설문에 응답해 주셔서 감사합니다.<br/>유료 강의 결정에 도움이 될 자료 세 가지를 함께 보내드립니다."
      : "설문에 응답해 주셔서 감사합니다.<br/>다음 결정에 도움이 될 자료 세 가지를 먼저 보내드립니다.";
    const result = await sendMessage({
      to: email,
      contactId: contact.id,
      subject: `[${COMPANY.serviceName}] 라이브 설문 응답 감사드립니다 — 자료 3종 안내`,
      body: buildSummaryEmail({
        name,
        url: summaryUrl,
        faqUrl,
        hookUrl,
        intro,
      }),
      templateKey: "webinar_survey_immediate",
      transactional: true,
    });
    if (!result.ok) {
      console.error("survey send error:", result.error);
    }
  } catch (e) {
    console.error("survey send exception:", e);
  }

  return NextResponse.json({ ok: true, siteUrl: SITE });
}
