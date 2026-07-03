import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/messaging";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return auth === `Bearer ${secret}`;
}

const CHANNEL_LABEL: Record<string, string> = {
  openchat: "카카오 오픈채팅",
  channel_kakao: "카카오 채널",
  instagram_dm: "인스타그램 DM",
};

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 15 * 60 * 1000); // 15분 이내 도래분

  const drafts = await prisma.broadcastDraft.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: horizon },
    },
    take: 20,
  });

  const operatorEmail = (await getSetting("operator_email")) || process.env.OPERATOR_EMAIL || process.env.ADMIN_EMAIL;
  if (!operatorEmail) {
    return NextResponse.json({ ok: false, error: "operator_email 미설정" }, { status: 503 });
  }

  const adminBase = process.env.NEXTAUTH_URL || "https://tipstagram-homepage.vercel.app";

  let notified = 0;
  for (const d of drafts) {
    const adminUrl = `${adminBase}/admin/crm/broadcast`;
    const html = `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;line-height:1.7;">
  <p style="font-size:12px;font-weight:800;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">📢 BROADCAST DUE</p>
  <h2 style="font-size:20px;font-weight:800;margin:0 0 6px;">${escapeHtml(d.title)}</h2>
  <p style="font-size:13px;color:#666;margin:0 0 14px;">
    ${CHANNEL_LABEL[d.channel] ?? d.channel} · 예약 ${d.scheduledAt.toISOString()}
  </p>

  <div style="background:#FFF8EB;border:1px solid #FCE6C2;border-radius:10px;padding:10px 14px;margin:0 0 12px;font-size:12px;color:#7c4a02;">
    💡 <strong>아래 회색 박스</strong>를 길게 눌러 전체 선택 → 복사 → 카톡방에 붙여넣기 (전체가 한 번에 선택돼요).
  </div>

  <pre style="background:#F7F7F7;border:1px solid #EEE;border-radius:12px;padding:16px 18px;margin:0 0 18px;white-space:pre-wrap;word-break:break-word;font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;font-size:14px;line-height:1.75;color:#222;-webkit-user-select:all;-moz-user-select:all;-ms-user-select:all;user-select:all;cursor:copy;">${escapeHtml(d.body)}</pre>

  <p style="text-align:center;margin:18px 0 0;">
    <a href="${adminUrl}" style="display:inline-block;padding:11px 22px;border-radius:10px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:13px;">
      어드민 예약 보드에서 완료 처리
    </a>
  </p>
</div>`.trim();

    await sendMessage({
      to: operatorEmail,
      subject: `[운영 알림] "${d.title}" 발송 시간입니다`,
      body: html,
      templateKey: "broadcast_notify",
      transactional: true,
    });

    await prisma.broadcastDraft.update({
      where: { id: d.id },
      data: { status: "notified", notifiedAt: new Date() },
    });
    notified++;
  }

  return NextResponse.json({ ok: true, notified, totalDue: drafts.length });
}

export async function POST(req: NextRequest) {
  return GET(req);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
