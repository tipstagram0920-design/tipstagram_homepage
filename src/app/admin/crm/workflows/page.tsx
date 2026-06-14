import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Activity } from "lucide-react";
import { WorkflowToggle } from "./WorkflowToggle";

export const dynamic = "force-dynamic";

const TRIGGER_LABEL: Record<string, string> = {
  live_signup: "라이브 신청",
  register: "회원가입",
  purchase: "구매 완료",
  lesson_complete: "강의 완강",
};

export default async function WorkflowsPage() {
  const workflows = await prisma.workflow.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { runs: true } } },
  });

  const stepsCount = (raw: unknown) => (Array.isArray(raw) ? raw.length : 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">워크플로우</h1>
          <p className="text-sm text-neutral-500 mt-1">이벤트 발생 시 자동으로 메시지를 발송하는 자동화</p>
        </div>
        <Link
          href="/admin/crm/workflows/new"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> 새 워크플로우
        </Link>
      </div>

      {workflows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <Activity className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 mb-1">아직 워크플로우가 없습니다.</p>
          <p className="text-sm text-neutral-400 mb-5">프리셋을 사용하거나 새 워크플로우를 만들어보세요.</p>
          <Link
            href="/admin/crm/workflows/new"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white"
          >
            <Plus className="w-4 h-4" /> 만들기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf) => (
            <div key={wf.id} className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-neutral-900 truncate">{wf.name}</h3>
                  {wf.isActive ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">활성</span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">비활성</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span>트리거: <strong className="text-neutral-700">{TRIGGER_LABEL[wf.trigger] ?? wf.trigger}</strong></span>
                  <span>· 단계 {stepsCount(wf.steps)}개</span>
                  <span>· 실행 {wf._count.runs}회</span>
                </div>
              </div>
              <WorkflowToggle id={wf.id} initial={wf.isActive} />
              <Link
                href={`/admin/crm/workflows/${wf.id}/edit`}
                className="px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-500"
              >
                편집
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
