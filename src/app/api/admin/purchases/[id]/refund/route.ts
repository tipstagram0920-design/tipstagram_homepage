import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/messaging";
import { COMPANY } from "@/lib/company";
import { formatPrice } from "@/lib/utils";
import { logEvent } from "@/lib/crm/events";

function buildRefundEmail({
  name,
  productTitle,
  amount,
  orderId,
  reason,
}: {
  name: string;
  productTitle: string;
  amount: number;
  orderId: string;
  reason: string | null;
}) {
  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans CJK KR',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111;line-height:1.7;">
  <div style="background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45);height:6px;border-radius:6px;margin-bottom:28px;"></div>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;">${name} 님, 환불 처리 완료 안내</h1>
  <p style="font-size:15px;color:#444;margin:0 0 16px;">
    요청하신 결제 건에 대한 환불이 처리되었습니다.
  </p>

  <div style="background:#F7F7F7;border-radius:12px;padding:18px 20px;margin:14px 0;font-size:14px;color:#333;">
    <p style="margin:0 0 8px;"><strong>상품</strong> · ${productTitle}</p>
    <p style="margin:0 0 8px;"><strong>결제 금액</strong> · ${formatPrice(amount)}</p>
    <p style="margin:0 0 8px;"><strong>주문번호</strong> · ${orderId}</p>
    ${reason ? `<p style="margin:0;"><strong>사유</strong> · ${reason}</p>` : ""}
  </div>

  <p style="font-size:14px;color:#555;margin:16px 0 0;">
    카드 결제 취소는 카드사 처리 사이클에 따라 영업일 기준 3~5일 소요될 수 있습니다.<br/>
    해당 강의 접근은 즉시 중단됩니다. 문의는 답장으로 남겨주세요.
  </p>

  <hr style="border:none;border-top:1px solid #EEE;margin:28px 0 16px;"/>
  <p style="font-size:12px;color:#999;margin:0;">
    ${COMPANY.serviceName} · 환불 문의: ${COMPANY.email}
  </p>
</div>
  `.trim();
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string; email?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : null;
  const skipEmail = !!body.skipEmail;

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true, contactId: true } },
      product: { select: { id: true, title: true, slug: true } },
    },
  });
  if (!purchase) return NextResponse.json({ error: "구매를 찾을 수 없습니다." }, { status: 404 });
  if (purchase.refundedAt) {
    return NextResponse.json({ error: "이미 환불된 구매입니다." }, { status: 400 });
  }

  const updated = await prisma.purchase.update({
    where: { id },
    data: {
      refundedAt: new Date(),
      refundReason: reason,
      refundedBy: user.email || user.id || null,
    },
  });

  // CRM 이벤트
  if (purchase.user.contactId) {
    await logEvent(purchase.user.contactId, "manual_note", {
      type: "purchase_refunded",
      purchaseId: purchase.id,
      productId: purchase.product.id,
      productTitle: purchase.product.title,
      amount: purchase.amount,
      reason,
      refundedBy: user.email || user.id,
    }).catch(() => {});
  }

  // 환불 확인 이메일 (거래성, 수신거부와 무관)
  if (!skipEmail && purchase.user.email) {
    try {
      await sendMessage({
        to: purchase.user.email,
        contactId: purchase.user.contactId ?? undefined,
        subject: `[${COMPANY.serviceName}] "${purchase.product.title}" 환불 처리 완료`,
        body: buildRefundEmail({
          name: purchase.user.name || "회원",
          productTitle: purchase.product.title,
          amount: purchase.amount,
          orderId: purchase.orderId,
          reason,
        }),
        templateKey: "purchase_refunded",
        transactional: true,
      });
    } catch (e) {
      console.error("refund email fail:", e);
    }
  }

  return NextResponse.json({ ok: true, purchase: updated });
}
