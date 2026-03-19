import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CourseDetailClient } from "./CourseDetailClient";
import { BoosterSalesPage } from "@/components/product/BoosterSalesPage";

// 이 슬러그를 가진 상품은 커스텀 세일즈 페이지로 렌더링
const BOOSTER_SLUG = "marketing-booster";

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

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);

  if (!product) notFound();

  const session = await auth();
  let hasPurchased = false;

  if (session?.user?.id) {
    const purchase = await prisma.purchase.findFirst({
      where: { userId: session.user.id, productId: product.id },
    }).catch(() => null);
    hasPurchased = !!purchase;
  }

  // 인스타그램 마케팅 부스터 상품은 커스텀 세일즈 페이지
  if (slug === BOOSTER_SLUG) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <BoosterSalesPage
          product={{ id: product.id, slug: product.slug, title: product.title, price: product.price }}
          hasPurchased={hasPurchased}
          isLoggedIn={!!session}
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
      />
      <Footer />
    </div>
  );
}
