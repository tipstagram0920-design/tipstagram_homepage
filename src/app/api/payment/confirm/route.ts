import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentKey, orderId, amount, productId, couponId } = await req.json();

  // Toss Payments 승인 API 호출
  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const tossData = await tossRes.json();

  if (!tossRes.ok) {
    return NextResponse.json(
      { error: tossData.message || "결제 승인에 실패했습니다." },
      { status: 400 }
    );
  }

  // Purchase 저장
  try {
    const [purchase, user, product] = await Promise.all([
      prisma.purchase.create({
        data: {
          userId: session.user.id,
          productId,
          amount,
          orderId,
          couponId: couponId || null,
        },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, name: true },
      }),
      prisma.product.findUnique({
        where: { id: productId },
        select: { title: true },
      }),
    ]);

    // 쿠폰 사용 횟수 증가
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { uses: { increment: 1 } },
      }).catch(() => {});
    }

    // 구매 완료 자동 이메일 발송
    if (user && product) {
      // 상품별 템플릿 우선, 없으면 공통 템플릿 사용
      const template = await prisma.emailTemplate.findFirst({
        where: {
          type: "purchase_confirmation",
          isActive: true,
          OR: [{ productId }, { productId: null }],
        },
        orderBy: { productId: "desc" }, // productId 있는 것(상품별) 우선
      }).catch(() => null);

      if (template) {
        const variables: Record<string, string> = {
          "{{name}}": user.name || "회원",
          "{{product}}": product.title,
          "{{amount}}": formatPrice(amount),
          "{{orderId}}": orderId,
        };
        const html = Object.entries(variables).reduce(
          (acc, [k, v]) => acc.replaceAll(k, v),
          template.html
        );
        const subject = Object.entries(variables).reduce(
          (acc, [k, v]) => acc.replaceAll(k, v),
          template.subject
        );

        await resend.emails.send({
          from: `팁스타그램 <${process.env.ADMIN_EMAIL || "noreply@tipstagram.com"}>`,
          to: user.email,
          subject,
          html,
        }).catch(() => {}); // 이메일 실패해도 결제는 성공 처리
      }
    }

    return NextResponse.json({ success: true, purchaseId: purchase.id });
  } catch (error) {
    return NextResponse.json({ error: "구매 정보 저장 실패" }, { status: 500 });
  }
}
