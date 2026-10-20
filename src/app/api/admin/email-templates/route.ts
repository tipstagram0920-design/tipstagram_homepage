import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderEmailFromText } from "@/lib/email-body";

export async function GET() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { createdAt: "asc" },
    include: { product: { select: { id: true, title: true } } },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type, productId, name, subject, html, design, bodyText, smsBody, isActive } =
    await req.json();

  // 글로 쓴 본문(bodyText)이 오면 발송 HTML 은 서버에서 만든다.
  // 그래야 어드민에 보이는 글과 실제로 나가는 메일이 어긋나지 않는다.
  const text = typeof bodyText === "string" && bodyText.trim() ? bodyText : null;
  const finalHtml = text ? renderEmailFromText(text) : html;

  if (!type || !name || !subject || !finalHtml) {
    return NextResponse.json({ error: "필수 항목을 입력하세요." }, { status: 400 });
  }

  const resolvedProductId = productId || null;
  const designStr = design ? JSON.stringify(design) : null;
  // 빈 문자열은 "문자 안 보냄"으로 저장한다
  const sms = typeof smsBody === "string" && smsBody.trim() ? smsBody : null;

  // productId 가 null 인 "공통" 문안은 복합 unique(type_productId) 로 조회할 수 없다.
  // (Prisma 는 unique where 에 null 을 받지 않는다) → findFirst 로 찾아 update/create 로 나눈다.
  const existing = await prisma.emailTemplate.findFirst({
    where: { type, productId: resolvedProductId },
    select: { id: true },
  });

  const data = {
    name,
    subject,
    html: finalHtml,
    // 글로 쓰는 모드로 저장하면 에디터 디자인은 지운다 (두 개가 서로 다른 내용을 갖지 않게)
    design: text ? null : designStr,
    bodyText: text,
    smsBody: sms,
    isActive: isActive ?? true,
  };

  const template = existing
    ? await prisma.emailTemplate.update({
        where: { id: existing.id },
        data,
        include: { product: { select: { id: true, title: true } } },
      })
    : await prisma.emailTemplate.create({
        data: { type, productId: resolvedProductId, ...data },
        include: { product: { select: { id: true, title: true } } },
      });
  return NextResponse.json(template);
}
