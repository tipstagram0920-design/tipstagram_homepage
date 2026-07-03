import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PRESET_STEPS } from "@/lib/crm/webinar-preset";
import { SETTING_KEYS, getSetting } from "@/lib/settings";
import { sendMessage } from "@/lib/messaging";
import { computeFireAt } from "@/lib/crm/webinar-engine";

const SITE = "https://tipstagram-homepage.vercel.app";

function formatKstDate(d: Date): string {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const m = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const dow = ["일", "월", "화", "수", "목", "금", "토"][kst.getUTCDay()];
  const h = kst.getUTCHours();
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${m}월 ${day}일(${dow}) ${ampm} ${h12}시`;
}

function diffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { role?: string; email?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const campaign = await prisma.webinarCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "캠페인 없음" }, { status: 404 });

  const [zoomSetting, preQSetting, consultationSetting, ebook1Setting, ebook2Setting, salesSetting, kakaoChatSetting] = await Promise.all([
    getSetting(SETTING_KEYS.webinarZoomUrl),
    getSetting(SETTING_KEYS.webinarPreQuestionUrl),
    getSetting(SETTING_KEYS.consultationUrl),
    getSetting(SETTING_KEYS.ebook1Url),
    getSetting(SETTING_KEYS.ebook2Url),
    getSetting(SETTING_KEYS.externalCheckoutUrl),
    getSetting(SETTING_KEYS.kakaoChatUrl),
  ]);

  const operatorSetting = await prisma.setting.findUnique({
    where: { key: "operator_email" },
  });
  const operatorEmail =
    operatorSetting?.value ||
    user.email ||
    process.env.ADMIN_EMAIL ||
    "hogny1@naver.com";

  const now = new Date();
  const vars: Record<string, string> = {
    "{{name}}": user.email?.split("@")[0] || "회원",
    "{{email}}": operatorEmail,
    "{{daysToWebinar}}": String(diffDays(now, campaign.webinarDate)),
    "{{daysToEnd}}": campaign.endDate ? String(diffDays(now, campaign.endDate)) : "-",
    "{{webinarDate}}": formatKstDate(campaign.webinarDate),
    "{{endDate}}": campaign.endDate ? formatKstDate(campaign.endDate) : "-",
    "{{zoomUrl}}": campaign.zoomUrl || zoomSetting || "[Zoom URL 미설정]",
    "{{preQuestionUrl}}":
      campaign.preQuestionUrl || preQSetting || `${SITE}/webinar/ask/${campaign.id}`,
    "{{salesUrl}}":
      campaign.salesUrl || salesSetting || `${SITE}/courses`,
    "{{consultationUrl}}": consultationSetting || `${SITE}/consultation`,
    "{{ebook1Url}}": ebook1Setting || "",
    "{{ebook2Url}}": ebook2Setting || "",
    "{{kakaoChatUrl}}": campaign.kakaoChatUrl || kakaoChatSetting || "",
  };

  const substitute = (s: string): string => {
    let out = s;
    for (const [k, v] of Object.entries(vars)) out = out.replaceAll(k, v);
    return out;
  };

  const results: { step: number; ok: boolean; error?: string; subject: string }[] = [];

  for (let i = 0; i < PRESET_STEPS.length; i++) {
    const step = PRESET_STEPS[i];
    const fireAt = computeFireAt(step, campaign.webinarDate, campaign.endDate);
    const timing = fireAt ? formatKstDate(fireAt) : "-";
    const label =
      step.kind === "webinar"
        ? step.offsetDays === 0
          ? "라이브 당일"
          : step.offsetDays < 0
          ? `라이브 D${step.offsetDays}`
          : `라이브 D+${step.offsetDays}`
        : step.offsetDays === 0
        ? "마감 당일"
        : step.offsetDays < 0
        ? `마감 D${step.offsetDays}`
        : `마감 D+${step.offsetDays}`;

    const subject = `[미리보기 ${i + 1}/${PRESET_STEPS.length} · ${label}] ${substitute(step.subject)}`;
    const previewBanner = `
<div style="max-width:540px;margin:0 auto;background:#FFF8EB;border:1px solid #FCE6C2;border-radius:10px;padding:12px 16px;font-size:12px;color:#7c4a02;font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;">
  📧 <strong>${label}</strong> · 예정 발송 시각 ${timing} · ${campaign.name}
</div>`;
    const body = previewBanner + substitute(step.body);

    try {
      const r = await sendMessage({
        to: operatorEmail,
        subject,
        body,
        templateKey: `webinar_email_preview_${campaign.id}_${i}`,
        transactional: true,
      });
      results.push({ step: i, ok: r.ok, error: r.error, subject });
    } catch (e) {
      results.push({
        step: i,
        ok: false,
        error: e instanceof Error ? e.message : "unknown",
        subject,
      });
    }
    // Resend rate limit 완화 위해 각 발송 사이 짧게 대기
    await new Promise((res) => setTimeout(res, 400));
  }

  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.length - okCount;

  return NextResponse.json({
    ok: true,
    sentTo: operatorEmail,
    total: results.length,
    okCount,
    failCount,
    results,
  });
}
