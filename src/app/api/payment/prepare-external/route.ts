import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderId } from "@/lib/utils";
import { signPurchaseToken } from "@/lib/external-purchase";

/**
 * POST /api/payment/prepare-external
 *
 * ReelSpy 페이플 PG를 통한 결제 대행 준비.
 * 상품 조회 + 쿠폰 계산 + hasPurchased 체크 후 signed JWT 발급.
 *
 * body: { productId, couponId? }
 * resp: { redirectUrl }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { productId, couponId } = await req.json();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });

  const existing = await prisma.purchase.findFirst({ where: { userId: session.user.id, productId } });
  if (existing) return NextResponse.json({ error: "이미 구매한 강의입니다." }, { status: 400 });

  let discount = 0;
  if (couponId) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (coupon) {
      discount = coupon.type === "PERCENT"
        ? Math.floor((product.price * coupon.discount) / 100)
        : coupon.discount;
    }
  }

  const finalAmount = Math.max(0, product.price - discount);
  if (finalAmount === 0) {
    return NextResponse.json({ error: "쿠폰 100% 할인은 이 결제 방식으로 처리되지 않습니다." }, { status: 400 });
  }

  const orderId = generateOrderId();

  let token: string;
  try {
    token = signPurchaseToken({
      email: session.user.email,
      productId,
      productSlug: product.slug,
      productTitle: product.title,
      amount: finalAmount,
      orderId,
    });
  } catch (e: any) {
    return NextResponse.json({ error: `토큰 서명 실패: ${e.message}` }, { status: 500 });
  }

  const host = (process.env.EXTERNAL_CHECKOUT_HOST || "https://reelspy.vercel.app").replace(/\/$/, "");
  const redirectUrl = `${host}/pay/external?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ redirectUrl, orderId, amount: finalAmount });
}
