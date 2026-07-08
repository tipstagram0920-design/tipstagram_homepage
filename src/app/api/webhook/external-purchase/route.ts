import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { sendMessage } from "@/lib/messaging";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";
import { triggerWorkflow } from "@/lib/crm/workflow-engine";
import { verifyWebhookBody } from "@/lib/external-purchase";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhook/external-purchase
 *
 * ReelSpy(페이플 PG 대행)가 결제 성공 시 호출하는 webhook.
 * HMAC 서명(x-signature 헤더)으로 인증한 뒤:
 *  - email로 User findOrCreate
 *  - Purchase 생성 (orderId @unique로 idempotency)
 *  - CRM + 구매확인 이메일 트리거
 *
 * body: { email, productSlug, productTitle, orderId, amount, paidAt, payType?, cardName? }
 * resp: { ok: true, purchaseId } | 409 duplicate | 401 signature
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-signature") || "";

  try {
    if (!verifyWebhookBody(raw, signature)) {
      return NextResponse.json({ error: "서명 검증 실패" }, { status: 401 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: `서명 처리 오류: ${e.message}` }, { status: 401 });
  }

  let payload: {
    email: string;
    productSlug: string;
    productTitle?: string;
    orderId: string;
    amount: number;
    paidAt?: string;
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "본문 파싱 실패" }, { status: 400 });
  }

  const { email, productSlug, orderId, amount } = payload;
  if (!email || !productSlug || !orderId || !amount) {
    return NextResponse.json({ error: "필수 필드 누락" }, { status: 400 });
  }

  // 이미 같은 orderId로 저장된 구매가 있으면 성공으로 간주 (idempotency)
  const dup = await prisma.purchase.findUnique({ where: { orderId } });
  if (dup) {
    return NextResponse.json({ ok: true, duplicate: true, purchaseId: dup.id }, { status: 409 });
  }

  // 상품 조회
  const product = await prisma.product.findUnique({ where: { slug: productSlug } });
  if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });

  // User findOrCreate — 이메일 unique 가정
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: email.split("@")[0],
    },
  });

  // 중복 구매 방지
  const alreadyOwn = await prisma.purchase.findFirst({ where: { userId: user.id, productId: product.id } });
  if (alreadyOwn) {
    return NextResponse.json({ ok: true, duplicate: true, purchaseId: alreadyOwn.id }, { status: 409 });
  }

  let purchase;
  try {
    purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        productId: product.id,
        amount,
        orderId,
      },
    });
  } catch (e: any) {
    // orderId unique 위반 (동시 요청) 재조회
    const race = await prisma.purchase.findUnique({ where: { orderId } });
    if (race) return NextResponse.json({ ok: true, duplicate: true, purchaseId: race.id }, { status: 409 });
    return NextResponse.json({ error: e.message || "purchase 저장 실패" }, { status: 500 });
  }

  // CRM contact 연결
  let contactId: string | null = null;
  try {
    const contact = await upsertContactByEmail({ email: user.email, name: user.name, source: "external_purchase" });
    contactId = contact.id;
    await prisma.user.update({ where: { id: user.id }, data: { contactId: contact.id } }).catch(() => { });
    await logEvent(contact.id, "purchase", {
      purchaseId: purchase.id,
      productId: product.id,
      productTitle: product.title,
      amount,
      orderId,
      source: "external_payple",
    });
    await triggerWorkflow("purchase", contact.id, {
      productId: product.id,
      productTitle: product.title,
      amount,
    });
  } catch (e: any) {
    console.error("[external-webhook] CRM 실패 (구매는 성공):", e.message);
  }

  // 구매 확인 이메일 (실패해도 성공 처리)
  try {
    const template = await prisma.emailTemplate.findFirst({
      where: {
        type: "purchase_confirmation",
        isActive: true,
        OR: [{ productId: product.id }, { productId: null }],
      },
      orderBy: { productId: "desc" },
    });
    if (template) {
      const variables: Record<string, string> = {
        "{{name}}": user.name || "회원",
        "{{product}}": product.title,
        "{{amount}}": formatPrice(amount),
        "{{orderId}}": orderId,
      };
      const html = Object.entries(variables).reduce((acc, [k, v]) => acc.replaceAll(k, v), template.html);
      const subject = Object.entries(variables).reduce((acc, [k, v]) => acc.replaceAll(k, v), template.subject);
      await sendMessage({
        to: user.email,
        contactId: contactId ?? undefined,
        subject,
        body: html,
        templateKey: "purchase_confirmation",
        transactional: true,
      });
    }
  } catch (e: any) {
    console.error("[external-webhook] 이메일 발송 실패:", e.message);
  }

  return NextResponse.json({ ok: true, purchaseId: purchase.id });
}
