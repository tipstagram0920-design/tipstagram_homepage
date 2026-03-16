import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { code, productId } = await req.json();

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "유효하지 않은 쿠폰입니다." }, { status: 400 });
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "만료된 쿠폰입니다." }, { status: 400 });
  }

  if (coupon.maxUses && coupon.uses >= coupon.maxUses) {
    return NextResponse.json({ error: "사용 횟수가 초과된 쿠폰입니다." }, { status: 400 });
  }

  if (coupon.productId && coupon.productId !== productId) {
    return NextResponse.json({ error: "이 강의에 사용할 수 없는 쿠폰입니다." }, { status: 400 });
  }

  return NextResponse.json({
    id: coupon.id,
    discount: coupon.discount,
    type: coupon.type,
  });
}
