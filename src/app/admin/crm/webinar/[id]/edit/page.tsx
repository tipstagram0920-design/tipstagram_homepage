import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WebinarEditor } from "../../WebinarEditor";
import { PRESET_STEPS } from "@/lib/crm/webinar-preset";

export const dynamic = "force-dynamic";

export default async function EditWebinarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await prisma.webinarCampaign.findUnique({ where: { id } });
  if (!c) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-6">웨비나 캠페인 편집</h1>
      <WebinarEditor
        preset={PRESET_STEPS}
        initial={{
          id: c.id,
          name: c.name,
          webinarDate: c.webinarDate.toISOString(),
          endDate: c.endDate?.toISOString() ?? null,
          audience: (c.audience as Record<string, unknown>) ?? {},
          steps: (c.steps as unknown[]) ?? [],
          isActive: c.isActive,
          skipPast: c.skipPast,
        }}
      />
    </div>
  );
}
