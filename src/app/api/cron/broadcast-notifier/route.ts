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
<div style="font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;">
  <p style="font-size:13px;font-weight:700;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">📢 BROADCAST DUE</p>
  <h2 style="font-size:20px;font-weight:800;margin:0 0 8px;">"${escapeHtml(d.title)}" 발송 시간입니다</h2>
  <p style="font-size:14px;color:#555;margin:0 0 16px;">
    채널: <strong>${CHANNEL_LABEL[d.channel] ?? d.channel}</strong> · 예약: ${d.scheduledAt.toISOString()}
  </p>
  <div style="background:#F7F7F7;border:1px solid #EEE;border-radius:12px;padding:16px;white-space:pre-wrap;font-size:14px;color:#333;margin-bottom:18px;">${escapeHtml(d.body)}</div>
  <p style="text-align:center;margin:18px 0;">
    <a href="${adminUrl}" style="display:inline-block;padding:12px 24px;border-radius:10px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);color:#fff;font-weight:800;text-decoration:none;font-size:14px;">
      어드민에서 복사·발송 처리
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
