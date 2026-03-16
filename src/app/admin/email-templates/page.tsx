import { prisma } from "@/lib/prisma";
import { EmailTemplatesClient } from "./EmailTemplatesClient";

async function getData() {
  const [templates, products] = await Promise.all([
    prisma.emailTemplate.findMany({
      orderBy: { createdAt: "asc" },
      include: { product: { select: { id: true, title: true } } },
    }).catch(() => []),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, title: true },
      orderBy: { order: "asc" },
    }).catch(() => []),
  ]);
  return { templates, products };
}

export default async function EmailTemplatesPage() {
  const { templates, products } = await getData();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-neutral-900">이메일 템플릿 관리</h1>
        <p className="text-neutral-500 text-sm mt-1">
          구매 완료, 환영 메일 등 자동 발송 이메일 템플릿을 설정합니다.
        </p>
      </div>
      <EmailTemplatesClient templates={templates} products={products} />
    </div>
  );
}
