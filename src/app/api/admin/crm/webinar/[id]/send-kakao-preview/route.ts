import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KAKAO_BROADCAST_MESSAGES } from "@/lib/crm/kakao-broadcast-preset";
import { SETTING_KEYS, getSetting } from "@/lib/settings";
import { sendMessage } from "@/lib/messaging";
import { COMPANY } from "@/lib/company";

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

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

  const [zoomSetting, preQSetting, ebook1Setting, ebookSetting, salesSetting] = await Promise.all([
    getSetting(SETTING_KEYS.webinarZoomUrl),
    getSetting(SETTING_KEYS.webinarPreQuestionUrl),
    getSetting(SETTING_KEYS.ebook1Url),
    getSetting(SETTING_KEYS.ebookUrl),
    getSetting(SETTING_KEYS.externalCheckoutUrl),
  ]);

  const vars: Record<string, string> = {
    webinarDate: formatKstDate(campaign.webinarDate),
    zoomUrl: campaign.zoomUrl || zoomSetting || "[Zoom URL 미설정]",
    ebook1Url: ebook1Setting || ebookSetting || "[1차 전자책 URL 미설정]",
    preQuestionUrl:
      campaign.preQuestionUrl || preQSetting || `${SITE}/webinar/ask/${campaign.id}`,
    salesUrl: campaign.salesUrl || salesSetting || "[강의 신청 URL 미설정]",
  };

  const apply = (s: string) => {
    let out = s;
    for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{{${k}}}`, v);
    return out;
  };

  const cardHtml = KAKAO_BROADCAST_MESSAGES.map((m, i) => `
    <div style="border:1px solid #EEE;border-radius:14px;padding:18px 20px;margin:14px 0;background:#FFF;">
      <div style="display:inline-block;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;letter-spacing:1px;">${i + 1} · ${escapeHtml(m.label)}</div>
      <p style="font-size:12px;color:#777;margin:8px 0 12px;">${m.kind === "webinar" ? "라이브" : "마감"} 기준 ${m.offsetDays >= 0 ? "+" : ""}${m.offsetDays}일 · ${m.time} KST</p>
      <pre style="background:#F7F7F7;border:1px solid #EEE;border-radius:10px;padding:14px 16px;margin:0;white-space:pre-wrap;word-break:break-word;font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;font-size:14px;line-height:1.75;color:#222;">${escapeHtml(apply(m.body))}</pre>
    </div>
  `).join("");

  const html = `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:680px;margin:0 auto;padding:32px 24px;color:#222;line-height:1.75;background:#FAFAFA;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:24px;"></div>
  <h1 style="font-size:24px;font-weight:900;margin:0 0 8px;">[${escapeHtml(campaign.name)}] 카톡 메시지 12종 미리보기</h1>
  <p style="font-size:14px;color:#666;margin:0 0 20px;">캠페인 실제 URL·일시로 치환된 미리보기입니다. 각 카드 회색 박스를 그대로 복사해서 카톡방에 붙여넣으시면 됩니다.</p>
  <div style="background:#FFF8EB;border:1px solid #FCE6C2;border-radius:12px;padding:14px 16px;margin:0 0 20px;font-size:13px;color:#7c4a02;">
    <p style="margin:0 0 4px;"><strong>라이브 일시</strong>: ${escapeHtml(vars.webinarDate)}</p>
    <p style="margin:0 0 4px;"><strong>Zoom URL</strong>: ${escapeHtml(vars.zoomUrl)}</p>
    <p style="margin:0 0 4px;"><strong>사전 질문 URL</strong>: ${escapeHtml(vars.preQuestionUrl)}</p>
    <p style="margin:0;"><strong>강의 신청 URL</strong>: ${escapeHtml(vars.salesUrl)}</p>
  </div>
  ${cardHtml}
  <hr style="border:none;border-top:1px solid #EEE;margin:32px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">팁스타그램 운영 가이드 · 어드민에게만 발송됩니다.</p>
</div>`.trim();

  const operatorSetting = await prisma.setting.findUnique({ where: { key: "operator_email" } });
  const operatorEmail =
    operatorSetting?.value ||
    user.email ||
    process.env.ADMIN_EMAIL ||
    null;

  if (!operatorEmail) {
    return NextResponse.json({ error: "운영자 이메일이 설정되지 않았습니다." }, { status: 400 });
  }

  const result = await sendMessage({
    to: operatorEmail,
    subject: `[미리보기] ${campaign.name} · 카톡 메시지 12종`,
    body: html,
    templateKey: `webinar_kakao_preview_${campaign.id}`,
    transactional: true,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error || "발송 실패" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, sentTo: operatorEmail, count: KAKAO_BROADCAST_MESSAGES.length });
}
