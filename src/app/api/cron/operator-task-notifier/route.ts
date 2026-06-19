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

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const operatorEmail =
    (await getSetting("operator_email")) ||
    process.env.OPERATOR_EMAIL ||
    process.env.ADMIN_EMAIL;
  if (!operatorEmail) {
    return NextResponse.json({ ok: false, error: "operator_email 미설정" }, { status: 503 });
  }

  const now = new Date();
  // 5분 이내 도래분(앞서가는 알림) ~ 1시간 전까지 못 보낸 것까지 캐치업
  const tasks = await prisma.operatorTask.findMany({
    where: {
      status: "pending",
      scheduledAt: { lte: new Date(now.getTime() + 5 * 60 * 1000) },
    },
    orderBy: { scheduledAt: "asc" },
    take: 50,
  });

  const adminBase = process.env.NEXTAUTH_URL || "https://tipstagram-homepage.vercel.app";
  let notified = 0;

  for (const t of tasks) {
    const html = `
<div style="font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:24px;"></div>
  <p style="font-size:13px;font-weight:800;color:#FD1D1D;letter-spacing:3px;margin:0 0 6px;">📋 OPERATOR TASK</p>
  <h2 style="font-size:20px;font-weight:800;margin:0 0 8px;">${escapeHtml(t.title)}</h2>
  <p style="font-size:13px;color:#666;margin:0 0 16px;">예정 시각: ${t.scheduledAt.toLocaleString("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" })}</p>
  ${t.detail ? `<div style="background:#F7F7F7;border:1px solid #EEE;border-radius:12px;padding:14px 16px;font-size:14px;color:#444;white-space:pre-wrap;margin-bottom:18px;">${escapeHtml(t.detail)}</div>` : ""}
  <p style="text-align:center;margin:24px 0 0;">
    <a href="${adminBase}/admin/crm/tasks" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#111;color:#fff;font-weight:800;text-decoration:none;font-size:14px;">완료 처리하러 가기</a>
  </p>
</div>`.trim();

    await sendMessage({
      to: operatorEmail,
      subject: `📋 [할 일] ${t.title}`,
      body: html,
      templateKey: "operator_task",
      transactional: true,
    });

    await prisma.operatorTask.update({
      where: { id: t.id },
      data: { status: "notified", notifiedAt: new Date() },
    });
    notified++;
  }

  return NextResponse.json({ ok: true, notified, totalDue: tasks.length });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
