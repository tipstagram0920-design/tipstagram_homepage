import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FreebieEditor } from "../../FreebieEditor";

export const dynamic = "force-dynamic";

export default async function EditFreebiePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const f = await prisma.freebie.findUnique({
    where: { id },
    include: { _count: { select: { submissions: true } } },
  });
  if (!f) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-6">자료 편집</h1>
      <FreebieEditor
        initial={{
          id: f.id,
          slug: f.slug,
          title: f.title,
          subtitle: f.subtitle ?? "",
          description: f.description ?? "",
          fileUrl: f.fileUrl ?? "",
          thumbnail: f.thumbnail ?? "",
          category: f.category ?? "",
          customEmailBody: f.customEmailBody ?? "",
          showLivePromo: f.showLivePromo,
          isActive: f.isActive,
          submissionCount: f._count.submissions,
        }}
      />
    </div>
  );
}
