"use client";

import { useState } from "react";
import { useGuideSave, FeedbackButton, FeedbackBox, CopyButton, FIELD_TA, FLABEL } from "./common";

type Key =
  | "problem"
  | "loss"
  | "myStory"
  | "solution"
  | "product"
  | "reviews"
  | "faq"
  | "composition"
  | "bonusNow"
  | "addedValue"
  | "cta";
type Data = Partial<Record<Key, string>>;

const FIELDS: { key: Key; label: string; placeholder: string; heading: string }[] = [
  { key: "problem", label: "1) 소비자의 문제", placeholder: "고객이 겪는 구체적인 문제/불편", heading: "혹시 이런 고민 있으신가요?" },
  { key: "loss", label: "2) 그로 인한 손해", placeholder: "그 문제를 방치하면 잃게 되는 것(시간·돈·기회)", heading: "이대로 두면" },
  { key: "myStory", label: "3) 나도 겪었던 문제", placeholder: "나도 똑같이 겪었던 경험", heading: "저도 그랬습니다" },
  { key: "solution", label: "4) 내가 해결한 방법", placeholder: "어떻게 그 문제를 해결했는지", heading: "그래서 이렇게 해결했어요" },
  { key: "product", label: "5) 그래서 만든 상품", placeholder: "그 방법을 담은 상품/서비스 소개", heading: "그렇게 만든 것이 바로" },
  { key: "reviews", label: "6) 소비자 후기", placeholder: "실제 후기 1~3개", heading: "먼저 경험한 분들의 후기" },
  { key: "composition", label: "7) 상품의 구성", placeholder: "무엇이 포함되는지(모듈·회차·자료 등)", heading: "이렇게 구성돼 있어요" },
  { key: "faq", label: "8) 자주 묻는 질문", placeholder: "Q&A 2~4개", heading: "자주 묻는 질문" },
  { key: "bonusNow", label: "9) 지금만 얻는 혜택", placeholder: "지금 결정하면 주는 한정 혜택", heading: "지금 시작하면 이런 혜택이" },
  { key: "addedValue", label: "10) 더해지는 상품 가치", placeholder: "추가로 얹어지는 가치·보너스", heading: "여기에 더해지는 가치" },
  { key: "cta", label: "11) 구매 CTA", placeholder: "행동을 유도하는 마지막 문장", heading: "" },
];

function assemble(d: Data): string {
  const parts: string[] = [];
  for (const f of FIELDS) {
    const v = (d[f.key] || "").trim();
    if (!v) continue;
    if (f.key === "cta") {
      parts.push(`👉 ${v}`);
    } else {
      parts.push(`【 ${f.heading} 】\n${v}`);
    }
  }
  return parts.join("\n\n");
}

export function LandingPageGuide({ taskId, initialData }: { taskId: string; initialData: Data | null }) {
  const [data, setData] = useState<Data>(initialData ?? {});
  const { saving, saved, save } = useGuideSave(taskId);
  const hasPrior = Boolean(initialData && Object.values(initialData).some((v) => (v || "").trim()));
  const [show, setShow] = useState(hasPrior);
  const set = (k: Key, v: string) => setData((prev) => ({ ...prev, [k]: v }));
  const output = assemble(data);

  const getFeedback = () => {
    save(data);
    setShow(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500 leading-relaxed">
        아래 항목을 채우면 순서대로 조립된 <strong>복붙용 랜딩페이지 글</strong>이 아래에 완성돼요. 인포크·리틀리 등에 붙여넣고 다듬으세요.
      </p>

      <div className="space-y-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className={FLABEL}>{f.label}</label>
            <textarea
              value={data[f.key] ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
              rows={f.key === "reviews" || f.key === "faq" || f.key === "composition" ? 3 : 2}
              className={FIELD_TA}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>

      <FeedbackButton onClick={getFeedback} saving={saving} saved={saved} label="랜딩 글 만들기" />

      {show && (
        <FeedbackBox>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-neutral-700">📄 완성된 랜딩페이지 글</p>
            {output && <CopyButton text={output} label="전체 복사" />}
          </div>
          {output ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-3 text-[13px] text-neutral-900 whitespace-pre-wrap leading-relaxed">
              {output}
            </div>
          ) : (
            <p className="text-xs text-neutral-400">위 항목을 채우면 여기에 글이 만들어져요.</p>
          )}
        </FeedbackBox>
      )}
    </div>
  );
}
