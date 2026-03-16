import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CourseDetailClient } from "./CourseDetailClient";

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
