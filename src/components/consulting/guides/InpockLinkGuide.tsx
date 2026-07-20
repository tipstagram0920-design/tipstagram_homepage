"use client";

import { useState } from "react";
import { useGuideSave, FeedbackButton, FeedbackBox, FIELD, FLABEL } from "./common";
import { Youtube, ExternalLink } from "lucide-react";

interface Data {
  freeUrl?: string;
  reviewUrl?: string;
  productUrl?: string;
  consultUrl?: string;
}

const STEPS = [
  { n: 1, label: "무료 자료 또는 이벤트", tip: "가장 위에! 부담 없이 클릭하게 만드는 미끼. 무료자료 신청 링크나 진행 중인 이벤트를 연결." },
  { n: 2, label: "고객 후기", tip: "신뢰를 쌓는 단계. 후기 모음(캡처·페이지)을 연결." },
  { n: 3, label: "상품 안내 또는 자주 묻는 질문(FAQ)", tip: "관심이 생긴 사람에게 상세 정보. 상품 소개 랜딩 또는 FAQ 페이지." },
  { n: 4, label: "상담하기", tip: "마지막은 전환. 상담·문의 링크(카톡·폼)로 연결." },
] as const;

export function InpockLinkGuide({ taskId, initialData }: { taskId: string; initialData: Data | null }) {
  const [freeUrl, setFreeUrl] = useState(initialData?.freeUrl ?? "");
  const [reviewUrl, setReviewUrl] = useState(initialData?.reviewUrl ?? "");
  const [productUrl, setProductUrl] = useState(initialData?.productUrl ?? "");
  const [consultUrl, setConsultUrl] = useState(initialData?.consultUrl ?? "");
  const { saving, saved, save } = useGuideSave(taskId);

  const setters = [setFreeUrl, setReviewUrl, setProductUrl, setConsultUrl];
  const values = [freeUrl, reviewUrl, productUrl, consultUrl];

  const [show, setShow] = useState(
    Boolean(initialData?.freeUrl || initialData?.reviewUrl || initialData?.productUrl || initialData?.consultUrl)
  );
  const getFeedback = () => {
    save({ freeUrl, reviewUrl, productUrl, consultUrl });
    setShow(true);
  };
  const filled = values.filter((v) => v.trim()).length;
  const notes: string[] = [];
  if (!freeUrl.trim()) notes.push("⚠️ 맨 위 '무료·이벤트' 링크가 비어 있어요. 첫 버튼이 가장 중요해요.");
  if (!consultUrl.trim()) notes.push("⚠️ 마지막 '상담하기' 링크를 꼭 넣으세요. 전환이 여기서 일어나요.");
  if (filled === 4) notes.push("👍 4개 버튼 링크를 모두 채웠어요. 순서만 위 순서대로 배치하면 완성!");

  return (
    <div className="space-y-4">
      <a
        href="https://youtu.be/qYQd7ea3_oU"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 hover:border-pink-400"
      >
        <span className="shrink-0 w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center">
          <Youtube className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900">인포크 링크 만드는 법 (영상)</p>
          <p className="text-xs text-neutral-500 truncate">먼저 이 영상을 보고 링크인바이오를 만드세요</p>
        </div>
        <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
      </a>

      <div>
        <p className="text-[13px] font-bold text-neutral-800 mb-2">✅ 반드시 이 순서로 버튼을 배치하세요</p>
        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 w-6 h-6 rounded-lg ig-gradient text-white text-xs font-black flex items-center justify-center">
                  {s.n}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900">{s.label}</p>
                  <p className="text-[12px] text-neutral-500 mt-0.5 leading-relaxed">{s.tip}</p>
                  <div className="mt-2">
                    <label className={FLABEL}>연결할 링크 (선택)</label>
                    <input
                      value={values[i]}
                      onChange={(e) => setters[i](e.target.value)}
                      className={FIELD}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FeedbackButton onClick={getFeedback} saving={saving} saved={saved} />

      {show && (
        <FeedbackBox>
          <p className="text-[13px] text-neutral-800 mb-1.5">
            버튼 링크 <strong>{filled}/4</strong> 채움. 순서는 <strong>무료·이벤트 → 후기 → 상품/FAQ → 상담</strong>이 맞아요.
          </p>
          <ul className="text-[12px] text-neutral-600 space-y-1 list-none">
            {notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </FeedbackBox>
      )}
    </div>
  );
}
