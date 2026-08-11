import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderId } from "@/lib/utils";

/**
 * 관리자 수동 수강권 부여 / 취소.
 *
 * 접근 권한은 서비스 전역에서 `Purchase.refundedAt = null` 로 판단하므로
 * 취소는 행을 지우지 않고 refundedAt 을 채운다(기록 보존 + 즉시 차단 + 재부여 가능).
 */

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const adminId = (session?.user as { id?: string })?.id ?? null;
  return { ok: role === "ADMIN", adminId };
}

// ── 부여 ──────────────────────────────────────────────
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: userId } = await params;
  const { productId } = await req.json().catch(() => ({}));
  if (!productId) return NextResponse.json({ error: "productId 가 필요합니다." }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });

  const existing = await prisma.purchase.findFirst({ where: { userId, productId } });

  // 이미 유효한 수강권이 있으면 중복 부여 금지
  if (existing && !existing.refundedAt) {
    return NextResponse.json({ error: "이미 보유한 강의입니다." }, { status: 400 });
  }

  // 취소했던 수강권이면 되살린다 (새 행을 만들면 이력이 중복으로 쌓인다)
  if (existing) {
    const restored = await prisma.purchase.update({
      where: { id: existing.id },
      data: { refundedAt: null, refundReason: null, refundedBy: null },
    });
    return NextResponse.json({ ...restored, restored: true });
  }

  const purchase = await prisma.purchase.create({
    data: { userId, productId, amount: 0, orderId: generateOrderId() },
  });
  return NextResponse.json(purchase);
}

// ── 취소 ──────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { ok, adminId } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: userId } = await params;
  const { productId } = await req.json().catch(() => ({}));
  if (!productId) return NextResponse.json({ error: "productId 가 필요합니다." }, { status: 400 });

  const existing = await prisma.purchase.findFirst({ where: { userId, productId } });
  if (!existing) {
    return NextResponse.json({ error: "부여된 수강권이 없습니다." }, { status: 404 });
  }
  if (existing.refundedAt) {
    return NextResponse.json({ error: "이미 취소된 수강권입니다." }, { status: 400 });
  }

  // 결제 금액이 있는 건은 실제 구매다 — 여기서 취소하면 환불 처리와 섞인다
  if (existing.amount > 0) {
    return NextResponse.json(
      {
        error:
          "결제 금액이 있는 구매 건입니다. 이 화면이 아니라 결제 관리에서 환불로 처리해 주세요.",
      },
      { status: 400 }
    );
  }

  const revoked = await prisma.purchase.update({
    where: { id: existing.id },
    data: {
      refundedAt: new Date(),
      refundReason: "관리자 수동 부여 취소",
      refundedBy: adminId,
    },
  });

  return NextResponse.json(revoked);
}
