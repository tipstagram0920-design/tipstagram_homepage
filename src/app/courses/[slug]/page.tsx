import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { CourseDetailClient } from "./CourseDetailClient";
import { LandingProductDetail } from "./LandingProductDetail";

async function getProduct(slug: string) {
  return await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      course: {
        include: {
          sections: {
            orderBy: { order: "asc" },
            include: {
              lessons: { orderBy: { order: "asc" } },
            },
          },
        },
      },
    },
  });
}

const COURSES_HIDDEN = false;

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (COURSES_HIDDEN) notFound();

  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);

  if (!product) notFound();

  const session = await auth();
  let hasPurchased = false;

  if (session?.user?.id) {
    const purchase = await prisma.purchase.findFirst({
      where: { userId: session.user.id, productId: product.id, refundedAt: null },
    }).catch(() => null);
    hasPurchased = !!purchase;
  }

  const externalCheckoutUrl = (await getSetting(SETTING_KEYS.externalCheckoutUrl)) || null;

  // descriptionDesign(랜딩 HTML) 이 있으면 전체폭 랜딩 모드로 표시
  if (product.descriptionDesign) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <LandingProductDetail
          productId={product.id}
          productSlug={product.slug}
          title={product.title}
          price={product.price}
          descriptionDesign={product.descriptionDesign}
          externalCheckoutUrl={externalCheckoutUrl}
          hasPurchased={hasPurchased}
          userEmail={session?.user?.email ?? null}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <CourseDetailClient
        product={product as Parameters<typeof CourseDetailClient>[0]["product"]}
        hasPurchased={hasPurchased}
        isLoggedIn={!!session}
        externalCheckoutUrl={externalCheckoutUrl}
      />
      <Footer />
    </div>
  );
}
