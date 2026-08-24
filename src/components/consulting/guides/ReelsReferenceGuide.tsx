"use client";

import { useState } from "react";
import { useGuideSave, useGuideAutosave, AutosaveStatus, FeedbackButton, FeedbackBox, FIELD, FLABEL } from "./common";
import { AlertCircle, Film, ExternalLink, Ticket, UserRound } from "lucide-react";

const REELSPY_URL = "https://reelspy.vercel.app";

interface RefItem {
  url?: string;
  account?: string;
  note?: string;
}
/** 1회차에만 받는 퍼스널 스토리 영상 기획 */
interface StoryReel {
  before?: string; // 예전의 나 — 어떤 상황이었나
  problem?: string; // 그때 가장 큰 문제
  turning?: string; // 무엇을 바꿔서 넘었나
  after?: string; // 지금은 어떻게 달라졌나
  hook?: string; // 첫 3초에 뭐라고 말할 것인가
}

interface Data {
  refs?: RefItem[];
  storyReel?: StoryReel;
}

const EMPTY: RefItem = { url: "", account: "", note: "" };

export function ReelsReferenceGuide({
  taskId,
  initialData,
  requireStory = false,
}: {
  taskId: string;
  initialData: Data | null;
  /** 1회차 — 내 과거 스토리 영상 1개를 반드시 포함 */
  requireStory?: boolean;
}) {
  // 1회차는 스토리 1개 + 레퍼런스 변형 4개, 그 외는 레퍼런스 5개
  const refCount = requireStory ? 4 : 5;
  const init =
    initialData?.refs && initialData.refs.length > 0
      ? initialData.refs.slice(0, refCount)
      : Array.from({ length: refCount }, () => ({ ...EMPTY }));
  const [refs, setRefs] = useState<RefItem[]>(init);
  const [story, setStory] = useState<StoryReel>(initialData?.storyReel ?? {});
  const { saving, saved, save } = useGuideSave(taskId);
  const auto = useGuideAutosave(taskId, { refs, storyReel: story }); // 작성 중 자동 임시저장
  const setStoryField = (k: keyof StoryReel, v: string) =>
    setStory((prev) => ({ ...prev, [k]: v }));
  const storyFilled = (["before", "problem", "turning", "after"] as const).filter(
    (k) => (story[k] || "").trim()
  ).length;

  const update = (i: number, patch: Partial<RefItem>) =>
    setRefs((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const filled = refs.filter((r) => (r.url || "").trim() || (r.account || "").trim()).length;
  const withAccount = refs.filter((r) => (r.account || "").trim()).length;
  const [show, setShow] = useState(Boolean(initialData?.refs && initialData.refs.length > 0));
  const getFeedback = () => {
    save({ refs, storyReel: story });
    setShow(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-neutral-500 leading-relaxed flex-1">
          1~4번 숙제에서 정한 <strong>내 주제·소비자 문제·상품</strong>을 기준으로, 이번 주 릴스 기획에 쓸{" "}
          <strong>레퍼런스 릴스 {refCount}개</strong>를 찾아 저장하세요. (기획은 <strong>릴스파이</strong>에서 진행)
        </p>
        <AutosaveStatus saving={auto.saving} saved={auto.saved} />
      </div>

      {/* 1회차 전용 — 퍼스널 스토리 영상 */}
      {requireStory && (
        <div className="rounded-xl border-2 border-pink-300 bg-pink-50/60 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="shrink-0 w-8 h-8 rounded-lg ig-gradient text-white flex items-center justify-center">
              <UserRound className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-bold text-neutral-900">
                1번 영상은 반드시 &lsquo;내 이야기&rsquo;로
              </p>
              <p className="mt-1 text-[12px] leading-5 text-neutral-600">
                첫 주에는 <strong>내 과거 스토리 영상 1개</strong>를 꼭 올립니다. 사람들은 정보보다 사람을 먼저
                팔로우합니다. <strong>&ldquo;예전엔 이랬는데 → 이렇게 바꿨다&rdquo;</strong> 구조로 짜세요.
                1번 숙제(나의 스토리)에 쓴 답을 그대로 가져오면 됩니다.
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-neutral-500">{storyFilled}/4</span>
          </div>

          <div className="space-y-2">
            <div>
              <label className={FLABEL}>① 예전의 나는 어떤 상황이었나요</label>
              <input
                value={story.before ?? ""}
                onChange={(e) => setStoryField("before", e.target.value)}
                className={FIELD}
                placeholder="예: 3년간 허리가 아파서 오래 앉아 있지도 못했어요"
              />
            </div>
            <div>
              <label className={FLABEL}>② 그때 가장 큰 문제는 무엇이었나요</label>
              <input
                value={story.problem ?? ""}
                onChange={(e) => setStoryField("problem", e.target.value)}
                className={FIELD}
                placeholder="예: 병원을 다녀도 그때뿐이라 일을 못 할 뻔했어요"
              />
            </div>
            <div>
              <label className={FLABEL}>③ 무엇을 바꿔서 넘었나요</label>
              <input
                value={story.turning ?? ""}
                onChange={(e) => setStoryField("turning", e.target.value)}
                className={FIELD}
                placeholder="예: 운동 강도가 아니라 앉는 자세를 바꿨습니다"
              />
            </div>
            <div>
              <label className={FLABEL}>④ 지금은 어떻게 달라졌나요</label>
              <input
                value={story.after ?? ""}
                onChange={(e) => setStoryField("after", e.target.value)}
                className={FIELD}
                placeholder="예: 지금은 하루 8시간 앉아 일해도 통증이 없어요"
              />
            </div>
            <div>
              <label className={FLABEL}>
                첫 3초에 뭐라고 말할까요 <span className="text-neutral-400 font-normal">(선택)</span>
              </label>
              <input
                value={story.hook ?? ""}
                onChange={(e) => setStoryField("hook", e.target.value)}
                className={FIELD}
                placeholder="예: 3년 동안 앉지도 못했던 제가 지금은요"
              />
            </div>
          </div>
        </div>
      )}

      {/* 릴스파이로 기획 + 쿠폰 */}
      <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[13px] font-bold text-violet-700 inline-flex items-center gap-1.5">
            <Film className="w-4 h-4" /> 릴스 기획은 릴스파이에서
          </p>
          <a
            href={REELSPY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700"
          >
            릴스파이 열기 <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="text-[12px] text-neutral-700 inline-flex items-start gap-1.5">
          <Ticket className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
          <span>
            릴스파이에서 쿠폰 <strong className="text-violet-700">PROMONTH</strong> 입력하면 <strong>30회 무료</strong>로 분석할 수 있어요.
            레퍼런스 릴스를 분석해 후킹·구성을 내 콘텐츠로 변형해 보세요.
          </span>
        </p>
      </div>

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
            <Film className="w-4 h-4 text-neutral-500" /> 레퍼런스 {refCount}개
          </p>
          <span className="text-[11px] text-neutral-400">{filled}/{refCount} 저장</span>
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
            레퍼런스 <strong>{filled}/{refCount}</strong> 저장 · 계정 <strong>{withAccount}</strong>개 기재
          </p>
          <ul className="text-[12px] text-neutral-600 space-y-1 list-none">
            {requireStory && storyFilled < 4 && (
              <li>⚠️ 퍼스널 스토리 영상 항목 {4 - storyFilled}개가 비었어요. 1번 영상은 내 이야기여야 합니다.</li>
            )}
            {filled < refCount && <li>⚠️ {refCount}개를 다 채우면 이번 주 릴스 기획이 훨씬 쉬워져요.</li>}
            {withAccount < filled && <li>⚠️ 계정을 안 적은 레퍼런스가 있어요. 계정을 적고 꼭 방문하세요.</li>}
            <li>👉 저장한 계정들에 <strong>직접 들어가 다른 잘 된 릴스도 더 모으세요.</strong> 그게 진짜 레퍼런스 창고가 돼요.</li>
            {filled === refCount && withAccount === refCount && (!requireStory || storyFilled === 4) && (
              <li>👍 완벽해요! 이제 Reelspy에서 이 레퍼런스로 기획을 시작하세요.</li>
            )}
          </ul>
        </FeedbackBox>
      )}
    </div>
  );
}
