import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CourseBuilder } from "./CourseBuilder";

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          sections: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  }).catch(() => null);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">커리큘럼 편집</h1>
      <p className="text-neutral-500 mb-8">{product.title}</p>
      <CourseBuilder product={product as Parameters<typeof CourseBuilder>[0]["product"]} />
    </div>
  );
}
