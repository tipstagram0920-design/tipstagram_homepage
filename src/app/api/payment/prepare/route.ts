import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { productId, couponId } = await req.json();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });

  const existing = await prisma.purchase.findFirst({
    where: { userId: session.user.id, productId },
  });
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
  const orderId = generateOrderId();

  return NextResponse.json({
    orderId,
    amount: finalAmount,
    customerKey: session.user.id,
    productId,
    couponId: couponId || null,
  });
}
