"use client";

import { useState } from "react";
import { useGuideSave, FeedbackButton, FeedbackBox, FIELD, FLABEL } from "./common";
import { AlertCircle, Film } from "lucide-react";

interface RefItem {
  url?: string;
  account?: string;
  note?: string;
}
interface Data {
  refs?: RefItem[];
}

const EMPTY: RefItem = { url: "", account: "", note: "" };

export function ReelsReferenceGuide({ taskId, initialData }: { taskId: string; initialData: Data | null }) {
  const init =
    initialData?.refs && initialData.refs.length > 0
      ? initialData.refs.slice(0, 5)
      : Array.from({ length: 5 }, () => ({ ...EMPTY }));
  const [refs, setRefs] = useState<RefItem[]>(init);
  const { saving, saved, save } = useGuideSave(taskId);

  const update = (i: number, patch: Partial<RefItem>) =>
    setRefs((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const filled = refs.filter((r) => (r.url || "").trim() || (r.account || "").trim()).length;
  const withAccount = refs.filter((r) => (r.account || "").trim()).length;
  const [show, setShow] = useState(Boolean(initialData?.refs && initialData.refs.length > 0));
  const getFeedback = () => {
    save({ refs });
    setShow(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500 leading-relaxed">
        1~4번 숙제에서 정한 <strong>내 주제·소비자 문제·상품</strong>을 기준으로, 이번 주 릴스 기획에 쓸{" "}
        <strong>레퍼런스 릴스 5개</strong>를 찾아 저장하세요. (기획은 <strong>Reelspy</strong>에서 진행)
      </p>

      {/* 핵심 강조 */}
      <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-3">
        <p className="text-[13px] font-bold text-pink-700 inline-flex items-center gap-1.5 mb-1">
          <AlertCircle className="w-4 h-4" /> 꼭 이렇게 하세요
        </p>
        <p className="text-[12px] text-neutral-600 leading-relaxed">
          릴스 하나만 저장하고 끝내지 마세요. <strong>그 릴스를 올린 계정에 꼭 들어가서</strong>, 그 계정의 다른 잘 된 릴스도
          함께 살펴보고 <strong>레퍼런스를 더 모으세요.</strong> 좋은 계정 하나가 수십 개의 아이디어를 줍니다.
        </p>
      </div>

      {/* 찾는 방법 */}
      <div>
        <p className="text-[13px] font-bold text-neutral-800 mb-1.5">🔎 이렇게 찾으세요</p>
        <ul className="text-[12px] text-neutral-600 leading-relaxed space-y-1 list-disc pl-4">
          <li>인스타·릴스 검색창에 <strong>내 주제 키워드 + 문제 키워드</strong>로 검색</li>
          <li>내 소비자가 팔로우할 만한 <strong>경쟁·롤모델 계정</strong>에서 조회수 높은 릴스</li>
          <li>포맷(정보전달·공감·전후비교 등)이 내 상품과 맞는 릴스 위주로</li>
        </ul>
      </div>

      {/* 5개 슬롯 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-bold text-neutral-800 inline-flex items-center gap-1.5">
            <Film className="w-4 h-4 text-neutral-500" /> 레퍼런스 5개
          </p>
          <span className="text-[11px] text-neutral-400">{filled}/5 저장</span>
        </div>
        <div className="space-y-3">
          {refs.map((r, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-2">
              <p className="text-xs font-bold text-neutral-500">레퍼런스 {i + 1}</p>
              <div>
                <label className={FLABEL}>릴스 URL</label>
                <input value={r.url ?? ""} onChange={(e) => update(i, { url: e.target.value })} className={FIELD} placeholder="https://instagram.com/reel/..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={r.account ?? ""} onChange={(e) => update(i, { account: e.target.value })} className={FIELD} placeholder="계정 @아이디 (꼭 들어가 더 모으기!)" />
                <input value={r.note ?? ""} onChange={(e) => update(i, { note: e.target.value })} className={FIELD} placeholder="배울 점·변형 아이디어" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <FeedbackButton onClick={getFeedback} saving={saving} saved={saved} />

      {show && (
        <FeedbackBox>
          <p className="text-[13px] text-neutral-800 mb-1">
            레퍼런스 <strong>{filled}/5</strong> 저장 · 계정 <strong>{withAccount}</strong>개 기재
          </p>
          <ul className="text-[12px] text-neutral-600 space-y-1 list-none">
            {filled < 5 && <li>⚠️ 5개를 다 채우면 이번 주 릴스 기획이 훨씬 쉬워져요.</li>}
            {withAccount < filled && <li>⚠️ 계정을 안 적은 레퍼런스가 있어요. 계정을 적고 꼭 방문하세요.</li>}
            <li>👉 저장한 계정들에 <strong>직접 들어가 다른 잘 된 릴스도 더 모으세요.</strong> 그게 진짜 레퍼런스 창고가 돼요.</li>
            {filled === 5 && withAccount === 5 && <li>👍 완벽해요! 이제 Reelspy에서 이 레퍼런스로 기획을 시작하세요.</li>}
          </ul>
        </FeedbackBox>
      )}
    </div>
  );
}
