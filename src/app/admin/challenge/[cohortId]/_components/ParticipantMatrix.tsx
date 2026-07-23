"use client";

import { useState } from "react";
import { SubmissionPreviewModal } from "./SubmissionPreviewModal";

type CellState = "feedback" | "submitted" | "draft" | null;
interface Cell {
  state: CellState;
  submissionId: string | null;
}
export interface WeekCol {
  id: string;
  weekIndex: number;
}
export interface RosterItem {
  id: string;
  name: string | null;
  email: string;
  via: "purchase" | "password";
}
export type CellMap = Record<string, Record<number, Cell>>;

function Badge({ state }: { state: CellState }) {
  if (state === "feedback")
    return (
      <span className="inline-flex w-6 h-6 rounded-md bg-emerald-500 text-white items-center justify-center text-xs font-bold" title="피드백 완료">
        ★
      </span>
    );
  if (state === "submitted")
    return (
      <span className="inline-flex w-6 h-6 rounded-md bg-neutral-900 text-white items-center justify-center text-xs font-bold" title="제출됨">
        ✓
      </span>
    );
  if (state === "draft")
    return (
      <span className="inline-flex w-6 h-6 rounded-md bg-amber-400 text-white items-center justify-center text-xs font-bold" title="작성 중(임시저장)">
        …
      </span>
    );
  return (
    <span className="inline-flex w-6 h-6 rounded-md border border-neutral-200 bg-white text-neutral-300 items-center justify-center text-xs" title="미제출">
      ·
    </span>
  );
}

export function ParticipantMatrix({
  roster,
  openedWeeks,
  cellMap,
}: {
  roster: RosterItem[];
  openedWeeks: WeekCol[];
  cellMap: CellMap;
}) {
  const [modal, setModal] = useState<{
    weekIndex: number;
    list: { userId: string; submissionId: string }[];
    index: number;
  } | null>(null);

  const openCell = (weekIndex: number, userId: string) => {
    // 이 주차에 제출물이 있는 참여자만 로스터 순서대로 모아 이전/다음 이동에 쓴다
    const list = roster
      .map((u) => ({ userId: u.id, submissionId: cellMap[u.id]?.[weekIndex]?.submissionId || null }))
      .filter((x): x is { userId: string; submissionId: string } => !!x.submissionId);
    const index = list.findIndex((x) => x.userId === userId);
    if (index < 0) return;
    setModal({ weekIndex, list, index });
  };

  const current = modal ? modal.list[modal.index] : null;

  return (
    <>
      <div className="rounded-2xl border border-neutral-100 bg-white overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left font-semibold text-neutral-500 text-xs px-4 py-3 sticky left-0 bg-white">참여자</th>
              {openedWeeks.map((w) => (
                <th key={w.id} className="font-semibold text-neutral-500 text-xs px-2 py-3 text-center whitespace-nowrap">
                  W{w.weekIndex}
                </th>
              ))}
              <th className="font-semibold text-neutral-500 text-xs px-3 py-3 text-center whitespace-nowrap">완료율</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((u) => {
              const done = openedWeeks.filter((w) => {
                const st = cellMap[u.id]?.[w.weekIndex]?.state;
                return st === "submitted" || st === "feedback";
              }).length;
              return (
                <tr key={u.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50">
                  <td className="px-4 py-2.5 sticky left-0 bg-white">
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900 truncate flex items-center gap-1.5">
                        {u.name || "이름 없음"}
                        {u.via === "password" && (
                          <span className="text-[9px] font-bold text-pink-600 bg-pink-50 rounded px-1 py-0.5 shrink-0">비번</span>
                        )}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">{u.email}</p>
                    </div>
                  </td>
                  {openedWeeks.map((w) => {
                    const cell = cellMap[u.id]?.[w.weekIndex];
                    const clickable = !!cell?.submissionId;
                    return (
                      <td key={w.id} className="px-2 py-2.5 text-center">
                        {clickable ? (
                          <button
                            type="button"
                            onClick={() => openCell(w.weekIndex, u.id)}
                            className="inline-flex rounded-md hover:ring-2 hover:ring-pink-300 hover:ring-offset-1 transition-shadow"
                            title="클릭해서 숙제·피드백 미리보기"
                          >
                            <Badge state={cell!.state} />
                          </button>
                        ) : (
                          <Badge state={cell?.state ?? null} />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={
                        "text-xs font-bold " +
                        (done === openedWeeks.length
                          ? "text-emerald-600"
                          : done === 0
                            ? "text-neutral-300"
                            : "text-neutral-700")
                      }
                    >
                      {done}/{openedWeeks.length}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && current && (
        <SubmissionPreviewModal
          submissionId={current.submissionId}
          weekIndex={modal.weekIndex}
          position={`${modal.index + 1} / ${modal.list.length}`}
          hasPrev={modal.index > 0}
          hasNext={modal.index < modal.list.length - 1}
          onPrev={() => setModal((m) => (m && m.index > 0 ? { ...m, index: m.index - 1 } : m))}
          onNext={() => setModal((m) => (m && m.index < m.list.length - 1 ? { ...m, index: m.index + 1 } : m))}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
