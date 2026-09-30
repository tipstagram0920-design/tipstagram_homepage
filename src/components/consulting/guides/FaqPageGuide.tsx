"use client";

import { useState } from "react";
import { PageBuilder, type PageField } from "./PageBuilder";
import { HelpCircle } from "lucide-react";
import type { GuideContext, PageBuilderData } from "@/lib/consulting-guide-data";

/**
 * 인포크 세 번째 버튼 — 자주 묻는 질문 페이지.
 * 문의로 오는 질문의 대부분은 정해져 있어서, 자주 걸리는 4가지를 기본 질문으로 깔아둔다.
 * 여기서 미리 답해두면 상담이 "살까 말까"에서 시작한다.
 */
const FIELDS: PageField[] = [
  {
    key: "price",
    label: "가격은 얼마인가요?",
    help: "숨기면 문의가 아니라 이탈이 됩니다. 범위라도 적으세요.",
    placeholder: "예: 4주 프로그램 30만원 / 1회 체험 3만원",
    rows: 2,
  },
  {
    key: "period",
    label: "기간은 얼마나 걸리나요? 어떻게 진행되나요?",
    placeholder: "예: 4주 · 주 2회 온라인 · 매주 과제 피드백",
    rows: 2,
  },
  {
    key: "beginner",
    label: "초보도 할 수 있나요?",
    help: "가장 많이 걸리는 질문입니다. '누가 오면 안 되는지'까지 쓰면 신뢰가 올라갑니다.",
    placeholder: "예: 운동 경험이 전혀 없어도 됩니다. 다만 급성 통증이 있는 분은 병원 먼저 권합니다.",
    rows: 2,
  },
  {
    key: "refund",
    label: "환불·취소는 어떻게 되나요?",
    placeholder: "예: 첫 수업 전까지 100% 환불 / 이후 회차 차감 후 환불",
    rows: 2,
  },
  {
    key: "extra1",
    label: "실제로 DM·댓글로 받았던 질문",
    help: "받은 질문을 그대로 적으세요. 그 표현이 그대로 검색되고 읽힙니다.",
    placeholder: "질문과 그에 대한 내 답을 함께 적어주세요.",
    rows: 3,
    optional: true,
  },
  {
    key: "extra2",
    label: "또 다른 질문",
    placeholder: "질문과 그에 대한 내 답을 함께 적어주세요.",
    rows: 3,
    optional: true,
  },
];

export function FaqPageGuide({
  taskId,
  initialData,
  context,
  next,
}: {
  taskId: string;
  initialData: PageBuilderData | null;
  context?: GuideContext | null;
  next?: { id: string; title: string; day: number } | null;
}) {
  const [data, setData] = useState<PageBuilderData>(initialData ?? {});

  // 앞 숙제에서 뽑은 소비자 문제 = 사람들이 실제로 물어볼 것들
  const problems = (context?.customer?.problems ?? [])
    .map((p) => (p ?? "").trim())
    .filter(Boolean);

  const hintBox = problems.length > 0 && (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5">
      <p className="inline-flex items-center gap-1.5 text-[12px] font-bold text-indigo-700">
        <HelpCircle className="w-3.5 h-3.5" /> 앞 숙제에서 찾은 소비자 문제 — 질문 후보입니다
      </p>
      <ol className="mt-1.5 list-decimal space-y-0.5 pl-4 text-[12.5px] leading-5 text-indigo-900/80">
        {problems.slice(0, 5).map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ol>
      <p className="mt-1.5 text-[11.5px] text-indigo-900/60">
        이 중 상담 전에 꼭 걷어내야 할 걸 아래 &ldquo;받았던 질문&rdquo; 칸에 넣으세요.
      </p>
    </div>
  );

  return (
    <PageBuilder
      taskId={taskId}
      kind="faq"
      fields={FIELDS}
      data={data}
      onChange={setData}
      context={context}
      next={next}
      stepOffset={1}
      intro="인포크 링크 세 번째 버튼에 들어갈 페이지입니다. 여기서 의심을 미리 걷어내야 상담이 짧아져요."
      generateLabel="FAQ 페이지 만들기"
      urlLabel="자주 묻는 질문 페이지 주소"
      urlHelp="만든 페이지 주소를 넣으세요. 인포크 숙제 3번 버튼에 자동으로 들어갑니다."
    >
      {hintBox}
    </PageBuilder>
  );
}
