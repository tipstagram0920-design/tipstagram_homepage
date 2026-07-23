"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { formatKstHuman } from "@/lib/kst";
import { SubmissionView } from "@/app/challenge/[cohortId]/week/[weekIndex]/SubmissionView";
import { FeedbackEditor } from "../weeks/[weekId]/submissions/_components/FeedbackEditor";
import { ReelspyPanel } from "./ReelspyPanel";

// 제출물에서 릴스파이 검색용 키워드 추출 (상품명 → 소비자 문제 → 콘텐츠 순)
function deriveKeyword(detail: Detail): string {
  const fd = detail.formData as
    | { products?: { name?: string }[]; answers?: Record<string, string> }
    | null;
  const product = fd?.products?.find((p) => p?.name)?.name?.trim();
  if (product) return product.slice(0, 40);
  const problem = fd?.answers?.q3_customer_problem?.trim();
  if (problem) return problem.split(/[\s,.]/).filter(Boolean).slice(0, 2).join(" ");
  return (detail.content || "").trim().split(/[\s,.]/).filter(Boolean).slice(0, 2).join(" ");
}

interface Detail {
  id: string;
  userName: string | null;
  userEmail: string;
  content: string;
  formData: unknown;
  imageUrls: string[];
  instagramUrl: string | null;
  submittedAt: string;
  status: string;
  feedbackAt: string | null;
  feedbackText: string;
  isAuto: boolean;
  hasDraft: boolean;
}

export function SubmissionPreviewModal({
  submissionId,
  weekIndex,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  position,
}: {
  submissionId: string;
  weekIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  position: string; // "3 / 12"
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setDetail(null);
    fetch(`/api/admin/challenge/submissions/${submissionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && d && d.id) setDetail(d);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [submissionId]);

  // ESC 닫기 / 좌우 이동
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && hasPrev) onPrev();
      else if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40" onClick={onClose}>
      <div
        className="bg-neutral-50 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-neutral-200 bg-white shrink-0">
          <div className="min-w-0">
            <p className="font-bold text-neutral-900 truncate">
              {detail?.userName || "이름 없음"}
              <span className="ml-2 text-xs font-normal text-neutral-400">Week {weekIndex}</span>
            </p>
            <p className="text-xs text-neutral-500 truncate">{detail?.userEmail || ""}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-neutral-400 mr-1">{position}</span>
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:border-neutral-900 disabled:opacity-30"
              title="이전 (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:border-neutral-900 disabled:opacity-30"
              title="다음 (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500" title="닫기 (Esc)">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 본문: 좌(숙제) / 우(피드백) */}
        {loading || !detail ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
            {/* 왼쪽: 제출한 숙제 */}
            <div className="overflow-y-auto p-5 border-b md:border-b-0 md:border-r border-neutral-200">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">제출한 숙제</p>
              <SubmissionView
                content={detail.content}
                formData={detail.formData}
                imageUrls={detail.imageUrls}
                instagramUrl={detail.instagramUrl}
                submittedAt={detail.submittedAt}
              />
            </div>

            {/* 오른쪽: 피드백 */}
            <div className="overflow-y-auto p-5 bg-white">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">피드백</p>
              {detail.status === "draft" ? (
                <p className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  아직 정식 제출 전이에요 (임시저장). 학생이 제출을 완료하면 피드백을 보낼 수 있어요.
                </p>
              ) : (
                <FeedbackEditor
                  key={detail.id}
                  submissionId={detail.id}
                  initialText={detail.feedbackText}
                  hasFeedback={!!detail.feedbackAt}
                  hasDraft={detail.hasDraft}
                  isAuto={detail.isAuto}
                  feedbackAtHuman={detail.feedbackAt ? formatKstHuman(detail.feedbackAt) : null}
                />
              )}

              <ReelspyPanel seedKeyword={deriveKeyword(detail)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
