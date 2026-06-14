import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WorkflowEditor } from "../../WorkflowEditor";

export const dynamic = "force-dynamic";

export default async function EditWorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wf = await prisma.workflow.findUnique({ where: { id } });
  if (!wf) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-6">워크플로우 편집</h1>
      <WorkflowEditor
        initial={{
          id: wf.id,
          name: wf.name,
          trigger: wf.trigger,
          isActive: wf.isActive,
          conditions: (wf.conditions as Record<string, unknown>) ?? null,
          steps: (wf.steps as unknown[]) ?? [],
        }}
      />
    </div>
  );
}
