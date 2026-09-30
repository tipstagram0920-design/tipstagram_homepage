"use client";

import { useEffect, useRef, useState } from "react";
import { PageBuilder, type PageField } from "./PageBuilder";
import { PrefillButton } from "./common";
import type { GuideContext, PageBuilderData } from "@/lib/consulting-guide-data";

/**
 * 인포크 두 번째 버튼 — 후기 또는 나의 변화 스토리 페이지.
 * 후기가 없는 사람이 대부분이라, 그 경우 앞 숙제에 쓴 내 이야기(그때 → 지금)로 페이지를 만든다.
 */
const STORY_FIELDS: PageField[] = [
  {
    key: "before",
    label: "예전의 나는 어땠나요?",
    help: "숫자와 상황이 구체적일수록 믿습니다. 앞 숙제에 쓴 내 이야기를 가져와도 됩니다.",
    placeholder: "예: 3년간 허리 통증으로 30분도 앉아 있지 못했고, 병원은 그때뿐이었습니다.",
    rows: 3,
  },
  {
    key: "turning",
    label: "무엇을 바꿨나요?",
    help: "판을 바꾼 하나만 쓰세요.",
    placeholder: "예: 운동 강도가 아니라 하루 중 앉아 있는 자세를 바꿨습니다.",
    rows: 3,
  },
  {
    key: "after",
    label: "지금은 어떤가요?",
    help: "눈에 보이게 쓰세요. 없는 숫자는 지어내지 마세요.",
    placeholder: "예: 지금은 하루 8시간 앉아 일해도 통증이 없습니다.",
    rows: 3,
  },
];

const REVIEW_FIELDS: PageField[] = [
  {
    key: "review1",
    label: "후기 1 — 누가, 어떤 상태였고, 어떻게 바뀌었나요",
    help: "받은 후기를 그대로 옮기고, 앞뒤 상황을 한 줄씩 붙이세요.",
    placeholder:
      "예: 김○○님(40대 직장인) · 오후만 되면 허리를 짚었는데, 4주 뒤에는 퇴근까지 통증 없이 버팁니다. \"자세를 바꾸라는 말이 이렇게 큰 줄 몰랐어요\"",
    rows: 3,
  },
  {
    key: "review2",
    label: "후기 2",
    placeholder: "받은 후기를 그대로 옮겨 적으세요.",
    rows: 3,
    optional: true,
  },
  {
    key: "review3",
    label: "후기 3",
    placeholder: "받은 후기를 그대로 옮겨 적으세요.",
    rows: 3,
    optional: true,
  },
  {
    key: "myStory",
    label: "나의 변화 스토리 (후기 앞에 붙일 이야기)",
    help: "후기만 나열하면 광고처럼 보입니다. 내 이야기가 앞에 있어야 읽힙니다.",
    placeholder: "예: 저도 3년간 같은 문제로 고생했고, 자세를 바꾸고 나서야 통증이 잡혔습니다.",
    rows: 3,
    optional: true,
  },
];

export function ProofPageGuide({
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
  const values = data.fields ?? {};
  // 후기가 아직 없다 → 내 변화 스토리로 만든다
  const noReview = (values.noReview ?? "") === "1";

  // 앞 숙제(소비자 선정·나의 스토리)에서 가져올 값
  const c = context?.customer ?? null;
  const s = context?.story ?? null;
  const prefill = {
    before: (c?.myProblem || s?.origin || "").trim(),
    turning: (c?.myTurning || s?.turningPoint || "").trim(),
    after: (s?.howSolved || "").trim(),
  };
  const hasPrefill = Object.values(prefill).some(Boolean);

  // 후기가 없는 모드로 처음 들어오면 내 이야기를 한 번 채워준다
  const didAutoFill = useRef(false);
  useEffect(() => {
    if (didAutoFill.current || !noReview || !hasPrefill || data.prefilled) return;
    const empty = STORY_FIELDS.every((f) => !(values[f.key] || "").trim());
    if (!empty) return;
    didAutoFill.current = true;
    setData((prev) => ({
      ...prev,
      prefilled: true,
      fields: { ...(prev.fields ?? {}), ...prefill },
    }));
    // prefill 은 context 에서 파생된 값이라 매 렌더 새로 만들어진다 → 의존성에서 뺀다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noReview, hasPrefill, data.prefilled]);

  const applyPrefill = () =>
    setData((prev) => {
      const f = { ...(prev.fields ?? {}) };
      for (const [k, v] of Object.entries(prefill)) if (!(f[k] || "").trim()) f[k] = v;
      return { ...prev, prefilled: true, fields: f };
    });

  const toggleNoReview = (on: boolean) =>
    setData((prev) => ({ ...prev, fields: { ...(prev.fields ?? {}), noReview: on ? "1" : "" } }));

  const modeBox = (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
      <p className="text-[13px] font-bold text-neutral-800">후기가 이미 있으신가요?</p>
      <p className="mt-1 text-[12px] leading-5 text-neutral-500">
        믿을 이유가 없으면 무료자료도 안 받습니다. <strong>후기가 없다면 내 변화가 곧 후기</strong>입니다.
      </p>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => toggleNoReview(false)}
          className={
            "rounded-xl border px-3 py-2.5 text-left text-[13px] font-bold transition-colors " +
            (!noReview
              ? "border-pink-400 bg-white text-pink-600 ring-2 ring-pink-100"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400")
          }
        >
          후기가 있어요
          <span className="mt-0.5 block text-[11.5px] font-normal text-neutral-500">
            받은 후기를 정리해 페이지로
          </span>
        </button>
        <button
          type="button"
          onClick={() => toggleNoReview(true)}
          className={
            "rounded-xl border px-3 py-2.5 text-left text-[13px] font-bold transition-colors " +
            (noReview
              ? "border-pink-400 bg-white text-pink-600 ring-2 ring-pink-100"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400")
          }
        >
          아직 없어요
          <span className="mt-0.5 block text-[11.5px] font-normal text-neutral-500">
            내 변화 스토리로 만들기
          </span>
        </button>
      </div>

      {noReview && hasPrefill && (
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 py-2">
          <p className="text-[12px] leading-5 text-indigo-900/80">
            앞 숙제에 쓴 내 이야기를 그대로 가져올 수 있어요.
          </p>
          <PrefillButton label="가져오기" onClick={applyPrefill} />
        </div>
      )}
    </div>
  );

  return (
    <PageBuilder
      taskId={taskId}
      kind="proof"
      fields={noReview ? STORY_FIELDS : REVIEW_FIELDS}
      data={data}
      onChange={setData}
      context={context}
      next={next}
      stepOffset={1}
      intro="인포크 링크 두 번째 버튼에 들어갈 페이지입니다. 여기서 '이 사람 믿어도 되겠다'가 만들어져요."
      generateLabel={noReview ? "변화 스토리 페이지 만들기" : "후기 페이지 만들기"}
      urlLabel={noReview ? "변화 스토리 페이지 주소" : "후기 페이지 주소"}
      urlHelp="만든 페이지 주소를 넣으세요. 인포크 숙제 2번 버튼에 자동으로 들어갑니다."
    >
      {modeBox}
    </PageBuilder>
  );
}
