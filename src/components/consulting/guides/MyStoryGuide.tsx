"use client";

import { useState } from "react";
import {
  useGuideSave,
  useGuideAutosave,
  AutosaveStatus,
  SaveButton,
  FIELD_TA,
  FLABEL,
} from "./common";
import { Compass, Sparkles } from "lucide-react";

/**
 * 모든 숙제의 출발점.
 * 소비자·프로필·릴스 전부 "내가 누구인가"에서 나오므로 이 답을 먼저 받는다.
 * 여기서 저장한 값은 프로필 추천(customer-select)에서 서버가 읽어 함께 활용한다.
 */
export interface MyStoryData {
  origin?: string; // 이 일을 어떻게 시작했나
  turningPoint?: string; // 문제를 해결할 때 가장 중요했던 것
  howSolved?: string; // 지금은 그 문제를 어떻게 해결했나
  expertise?: string; // 전문성·경력 (숫자 위주)
  numbers?: string; // 증명 가능한 숫자
}

const QUESTIONS: {
  key: keyof MyStoryData;
  label: string;
  help: string;
  placeholder: string;
  rows?: number;
}[] = [
  {
    key: "origin",
    label: "나는 이 일을 어떻게 시작하게 되었나요?",
    help: "계기가 된 사건이나 시기를 그때 상황 그대로 적어주세요. 잘 나가던 이야기보다 힘들었던 이야기가 더 좋습니다.",
    placeholder:
      "예: 3년간 허리디스크로 앉아 있는 것조차 힘들었어요. 병원을 다녀도 그때뿐이라, 결국 직접 운동을 배우기 시작한 게 시작이었습니다.",
    rows: 4,
  },
  {
    key: "turningPoint",
    label: "그 문제를 해결할 때 가장 중요했던 것은 무엇이었나요?",
    help: "여러 방법을 시도했을 텐데, 실제로 판을 바꾼 하나가 무엇이었는지 적어주세요. 이게 나중에 내 콘텐츠의 핵심 메시지가 됩니다.",
    placeholder:
      "예: 운동 강도가 아니라 '하루 중 앉아 있는 자세'를 바꾸는 것이었습니다. 그걸 알기 전까지는 아무리 운동해도 제자리였어요.",
    rows: 4,
  },
  {
    key: "howSolved",
    label: "지금은 그 문제를 어떻게 해결했나요?",
    help: "예전의 나와 지금의 나가 어떻게 다른지, 눈에 보이게 적어주세요.",
    placeholder:
      "예: 지금은 하루 8시간 앉아 일해도 통증이 없습니다. 같은 방법으로 300명 넘게 교정했고, 대부분 4주 안에 변화를 느꼈어요.",
    rows: 4,
  },
  {
    key: "expertise",
    label: "내 전문성은 무엇으로 증명되나요?",
    help: "경력·자격증·수료·이력 등 '이 사람 말은 믿을 만하다'를 만드는 근거입니다.",
    placeholder: "예: 필라테스 지도자 8년차 · 재활 전문 과정 수료 · 물리치료사 협업 3년",
    rows: 3,
  },
  {
    key: "numbers",
    label: "숫자로 말할 수 있는 게 있나요?",
    help: "프로필 첫 줄에 그대로 들어갑니다. 없으면 비워두셔도 됩니다. 다만 지어내지는 마세요.",
    placeholder: "예: 누적 수강생 300명 · 후기 210건 · 8년차 · 재방문율 70%",
    rows: 2,
  },
];

export function MyStoryGuide({
  taskId,
  initialData,
}: {
  taskId: string;
  initialData: MyStoryData | null;
}) {
  const [data, setData] = useState<MyStoryData>(initialData ?? {});
  const { saving, saved, save } = useGuideSave(taskId);
  const auto = useGuideAutosave(taskId, data);

  const set = (k: keyof MyStoryData, v: string) => setData((prev) => ({ ...prev, [k]: v }));
  const answered = QUESTIONS.filter((q) => (data[q.key] || "").trim()).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AutosaveStatus saving={auto.saving} saved={auto.saved} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="inline-flex items-center gap-1.5 text-[13px] font-bold text-neutral-800">
          <Compass className="w-3.5 h-3.5" /> 여기서부터 시작합니다
        </p>
        <p className="mt-1.5 text-[12.5px] leading-6 text-neutral-600">
          소비자 선정도, 프로필도, 릴스도 전부 <strong>&ldquo;내가 누구인가&rdquo;</strong>에서 나옵니다.
          내가 겪었던 문제가 곧 소비자의 문제이고, 내가 그걸 넘은 방법이 곧 내 콘텐츠입니다.
          <strong> 여기를 대충 쓰면 뒤가 전부 흔들립니다.</strong>
        </p>
      </div>

      {QUESTIONS.map((q, i) => (
        <div key={q.key}>
          <label className={FLABEL}>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-neutral-900 text-white text-[11px] font-black mr-1.5 align-middle">
              {i + 1}
            </span>
            {q.label}
          </label>
          <p className="text-[12px] text-neutral-500 mb-1.5 leading-5">{q.help}</p>
          <textarea
            value={data[q.key] ?? ""}
            onChange={(e) => set(q.key, e.target.value)}
            rows={q.rows ?? 3}
            placeholder={q.placeholder}
            className={FIELD_TA}
          />
        </div>
      ))}

      <div className="rounded-xl border border-pink-200 bg-pink-50 p-4">
        <p className="inline-flex items-center gap-1.5 text-[13px] font-bold text-pink-700">
          <Sparkles className="w-3.5 h-3.5" /> 다음 숙제에서 바로 쓰입니다
        </p>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[12.5px] leading-5 text-pink-700/85">
          <li>1~3번 답 → 소비자 문제와 릴스 스토리의 재료가 됩니다</li>
          <li>4~5번 답 → 프로필 첫 줄(전문가 소개)에 그대로 들어갑니다</li>
        </ul>
      </div>

      <div className="flex items-center gap-2">
        <SaveButton onClick={() => save(data)} saving={saving} saved={saved} />
        <span className="text-[12px] text-neutral-500">
          {answered}/{QUESTIONS.length}개 작성됨
        </span>
      </div>
    </div>
  );
}
