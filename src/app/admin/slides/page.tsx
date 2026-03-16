import { prisma } from "@/lib/prisma";
import { SlidesManageClient } from "./SlidesManageClient";

async function getSlides() {
  return await prisma.slide.findMany({ orderBy: { order: "asc" } }).catch(() => []);
}

export default async function AdminSlidesPage() {
  const slides = await getSlides();
  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-8">슬라이드 관리</h1>
      <SlidesManageClient slides={slides} />
    </div>
  );
}
