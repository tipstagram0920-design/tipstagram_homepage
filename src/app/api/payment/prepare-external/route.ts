import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderId } from "@/lib/utils";
import { signPurchaseToken } from "@/lib/external-purchase";

/**
 * POST /api/payment/prepare-external
 *
 * ReelSpy 페이플 PG를 통한 결제 대행 준비.
 * 로그인 유저면 세션 email 사용, 아니면 guestEmail로 게스트 결제.
 *
 * body: { productId?, productSlug?, couponId?, guestEmail? }
 * resp: { redirectUrl, orderId, amount }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const { productId, productSlug, couponId, guestEmail } = await req.json();

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = session?.user?.email
    || (typeof guestEmail === "string" && EMAIL_RE.test(guestEmail.trim().toLowerCase())
        ? guestEmail.trim().toLowerCase()
        : null);
  if (!email) {
    return NextResponse.json({ error: "이메일이 필요합니다." }, { status: 400 });
  }

  const product = productId
    ? await prisma.product.findUnique({ where: { id: productId } })
    : productSlug
    ? await prisma.product.findUnique({ where: { slug: productSlug } })
    : null;
  if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });

  if (session?.user?.id) {
    const existing = await prisma.purchase.findFirst({ where: { userId: session.user.id, productId: product.id, refundedAt: null } });
    if (existing) return NextResponse.json({ error: "이미 구매한 강의입니다." }, { status: 400 });
  }

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
      email,
      productId: product.id,
      productSlug: product.slug,
      productTitle: product.title,
      amount: finalAmount,
      orderId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: `토큰 서명 실패: ${msg}` }, { status: 500 });
  }

  const host = (process.env.EXTERNAL_CHECKOUT_HOST || "https://reelspy.vercel.app").replace(/\/$/, "");
  const redirectUrl = `${host}/pay/external?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ redirectUrl, orderId, amount: finalAmount });
}
