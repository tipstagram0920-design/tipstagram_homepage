import { CohortForm } from "../_components/CohortForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NewCohortPage() {
  return (
    <div>
      <Link
        href="/admin/challenge"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> 목록으로
      </Link>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">새 기수 만들기</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Week 1 오픈 시각을 정하면 5주치 초안이 매주 같은 요일·시각으로 자동 생성됩니다. 이후 각 주차 세부 내용은 언제든 편집할 수 있어요.
      </p>
      <CohortForm />
    </div>
  );
}
