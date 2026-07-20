"use client";

import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Plus,
  Trash2,
  Pencil,
  X,
  Loader2,
  CalendarDays,
  GripVertical,
  Wand2,
  ChevronDown,
} from "lucide-react";
import { TaskGuide, GUIDE_LABELS } from "./guides/TaskGuide";

export interface BoardTask {
  id: string;
  day: number;
  endDay?: number | null;
  order: number;
  title: string;
  description: string;
  doneAt: string | null;
  guideKey?: string | null;
  data?: unknown;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const DAY_MS = 24 * 60 * 60 * 1000;

function midnight(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function dateForDay(startAtIso: string, day: number): string {
  const d = addDays(new Date(startAtIso), day - 1);
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]})`;
}

export function TaskBoard({
  startAtIso,
  durationDays,
  tasks: initialTasks,
  manageEnrollmentId,
}: {
  startAtIso: string;
  durationDays: number;
  tasks: BoardTask[];
  /** 관리자가 다른 고객 일정을 편집할 때만 전달 (할 일 추가 대상 지정용) */
  manageEnrollmentId?: string;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<BoardTask[]>(initialTasks);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addDay, setAddDay] = useState<number | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [openGuideId, setOpenGuideId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const weekRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const effEnd = (t: BoardTask) => Math.max(t.day, t.endDay ?? t.day);

  const persistEndDay = (taskId: string, endDay: number | null) => {
    fetch(`/api/consulting/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endDay }),
    }).catch(() => {});
  };

  // 달력 막대 우측 핸들 드래그로 마감일(endDay) 늘리기/줄이기
  const startResize = (e: React.PointerEvent, task: BoardTask, weekIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingId(task.id);
    const gridStartDayIndex = 1 - startDateDow + weekIndex * 7; // 해당 주 첫 칸의 dayIndex
    const move = (ev: PointerEvent) => {
      const el = weekRefs.current[weekIndex];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const col = Math.floor(((ev.clientX - rect.left) / rect.width) * 7);
      const clamped = Math.max(0, Math.min(6, col));
      const targetDay = gridStartDayIndex + clamped;
      const newEnd = Math.max(task.day, targetDay);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, endDay: newEnd === t.day ? null : newEnd } : t))
      );
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setResizingId(null);
      setTasks((prev) => {
        const t = prev.find((x) => x.id === task.id);
        if (t) persistEndDay(task.id, t.endDay ?? null);
        return prev;
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startDate = useMemo(() => midnight(new Date(startAtIso)), [startAtIso]);
  const startDateDow = useMemo(() => midnight(new Date(startAtIso)).getDay(), [startAtIso]);
  const todayIndex = useMemo(() => {
    return Math.round((midnight(new Date()).getTime() - startDate.getTime()) / DAY_MS) + 1;
  }, [startDate]);

  const maxDay = Math.max(durationDays, ...tasks.map((t) => t.day));
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const byDay = (day: number) =>
    tasks.filter((t) => t.day === day).sort((a, b) => a.order - b.order);
  const doneCount = tasks.filter((t) => t.doneAt).length;

  // ── 달력 그리드 계산 ──────────────────────────────
  const calendar = useMemo(() => {
    const lastDate = addDays(startDate, maxDay - 1);
    const gridStart = addDays(startDate, -startDate.getDay());
    const gridEnd = addDays(lastDate, 6 - lastDate.getDay());
    const cellCount = Math.round((gridEnd.getTime() - gridStart.getTime()) / DAY_MS) + 1;
    const cells = Array.from({ length: cellCount }, (_, i) => {
      const date = addDays(gridStart, i);
      const dayIndex = Math.round((midnight(date).getTime() - startDate.getTime()) / DAY_MS) + 1;
      return { date, dayIndex };
    });
    const weeks: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [startDate, maxDay]);

  const todayMs = midnight(new Date()).getTime();

  // ── API ──────────────────────────────
  const toggleDone = async (task: BoardTask) => {
    setBusyId(task.id);
    const next = !task.doneAt;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, doneAt: next ? new Date().toISOString() : null } : t))
    );
    try {
      const res = await fetch(`/api/consulting/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: next }),
      });
      if (!res.ok)
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, doneAt: task.doneAt } : t)));
    } finally {
      setBusyId(null);
    }
  };

  const saveEdit = async (
    taskId: string,
    title: string,
    description: string,
    day: number,
    endDay: number | null
  ) => {
    if (!title.trim()) return;
    const normEnd = endDay && endDay > day ? endDay : null;
    setBusyId(taskId);
    try {
      const res = await fetch(`/api/consulting/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, day, endDay: normEnd }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, title, description, day, endDay: normEnd } : t))
        );
        setEditingId(null);
      }
    } finally {
      setBusyId(null);
    }
  };

  const removeTask = async (taskId: string) => {
    setBusyId(taskId);
    try {
      const res = await fetch(`/api/consulting/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } finally {
      setBusyId(null);
    }
  };

  const addTask = async (day: number, title: string, description: string) => {
    if (!title.trim()) return;
    setBusyId("add");
    try {
      const res = await fetch(`/api/consulting/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, title, description, enrollmentId: manageEnrollmentId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.task) {
        setTasks((prev) => [
          ...prev,
          {
            id: data.task.id,
            day: data.task.day,
            order: data.task.order,
            title: data.task.title,
            description: data.task.description ?? "",
            doneAt: null,
          },
        ]);
        setAddDay(null);
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const persistReorder = (moves: { id: string; day: number; order: number }[]) => {
    if (moves.length === 0) return;
    fetch(`/api/consulting/tasks/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moves }),
    }).catch(() => {});
  };

  // 드래그한 task를 targetDay의 beforeId 앞(또는 맨 끝)으로 이동
  const reorder = (draggedId: string, targetDay: number, beforeId: string | null) => {
    setTasks((prev) => {
      const dragged = prev.find((t) => t.id === draggedId);
      if (!dragged) return prev;
      const srcDay = dragged.day;
      const without = prev.filter((t) => t.id !== draggedId);
      const targetList = without.filter((t) => t.day === targetDay).sort((a, b) => a.order - b.order);
      let idx = beforeId ? targetList.findIndex((t) => t.id === beforeId) : targetList.length;
      if (idx < 0) idx = targetList.length;
      targetList.splice(idx, 0, { ...dragged, day: targetDay });
      const targetReindexed = targetList.map((t, i) => ({ ...t, order: i }));
      const srcReindexed =
        srcDay === targetDay
          ? []
          : without
              .filter((t) => t.day === srcDay)
              .sort((a, b) => a.order - b.order)
              .map((t, i) => ({ ...t, order: i }));
      const others = without.filter((t) => t.day !== targetDay && t.day !== srcDay);
      const merged = [...others, ...targetReindexed, ...srcReindexed];
      persistReorder(
        [...targetReindexed, ...srcReindexed].map((t) => ({ id: t.id, day: t.day, order: t.order }))
      );
      return merged;
    });
    setDragId(null);
    setDragOverDay(null);
  };

  const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 달력 */}
      <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 sm:p-5">
        <p className="text-sm font-bold text-neutral-900 mb-3 inline-flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-neutral-500" /> 일정 달력
        </p>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={
                "text-center text-[11px] font-bold py-1 " +
                (i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-neutral-400")
              }
            >
              {w}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {calendar.map((week, wi) => {
            const weekStart = week[0].dayIndex;
            const weekEnd = week[6].dayIndex;
            const inWeek = tasks
              .filter((t) => t.day <= weekEnd && effEnd(t) >= weekStart)
              .sort((a, b) => a.day - b.day || a.order - b.order);
            // 레인(줄) 배치 — 겹치지 않게 쌓기
            const laneEnd: number[] = [];
            const placed = inWeek.map((t) => {
              const s = Math.max(0, t.day - weekStart);
              const e = Math.min(6, effEnd(t) - weekStart);
              let lane = 0;
              while (lane < laneEnd.length && laneEnd[lane] >= s) lane++;
              laneEnd[lane] = e;
              return { t, s, e, lane };
            });
            const laneCount = laneEnd.length;
            return (
              <div key={wi} className="space-y-1">
                {/* 날짜 행 */}
                <div
                  ref={(el) => {
                    weekRefs.current[wi] = el;
                  }}
                  className="grid grid-cols-7 gap-1"
                >
                  {week.map(({ date, dayIndex }) => {
                    const inProgram = dayIndex >= 1 && dayIndex <= maxDay;
                    const isToday = midnight(date).getTime() === todayMs;
                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        disabled={!inProgram}
                        onClick={() =>
                          document.getElementById(`cday-${dayIndex}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
                        }
                        className={
                          "rounded-lg border py-1.5 flex flex-col items-center justify-center leading-none transition-colors " +
                          (!inProgram
                            ? "border-transparent text-neutral-300"
                            : isToday
                              ? "border-pink-300 bg-pink-50 text-neutral-900"
                              : "border-neutral-200/70 bg-white hover:border-neutral-400 text-neutral-700")
                        }
                      >
                        <span className="text-[11px] font-semibold">{date.getDate()}</span>
                        {inProgram && <span className="text-[8px] font-bold text-neutral-400 mt-0.5">D{dayIndex}</span>}
                      </button>
                    );
                  })}
                </div>
                {/* 일정 막대 */}
                {laneCount > 0 && (
                  <div
                    className="grid grid-cols-7 gap-1"
                    style={{ gridTemplateRows: `repeat(${laneCount}, 18px)` }}
                  >
                    {placed.map(({ t, s, e, lane }) => {
                      const startsHere = t.day >= weekStart;
                      const endsHere = effEnd(t) <= weekEnd;
                      const done = !!t.doneAt;
                      const inRangeToday = t.day <= todayIndex && effEnd(t) >= todayIndex;
                      return (
                        <div
                          key={t.id}
                          style={{ gridColumn: `${s + 1} / ${e + 2}`, gridRow: lane + 1 }}
                          className="relative min-w-0"
                        >
                          <div
                            onClick={() =>
                              document.getElementById(`cday-${t.day}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
                            }
                            className={
                              "h-[18px] px-1.5 flex items-center text-[10px] font-semibold truncate cursor-pointer " +
                              (startsHere ? "rounded-l-md " : "") +
                              (endsHere ? "rounded-r-md " : "") +
                              (done
                                ? "bg-emerald-500 text-white"
                                : inRangeToday
                                  ? "ig-gradient text-white"
                                  : "bg-neutral-700 text-white") +
                              (resizingId === t.id ? " ring-2 ring-pink-400" : "")
                            }
                          >
                            {startsHere ? t.title : "…"}
                          </div>
                          {endsHere && (
                            <span
                              onPointerDown={(ev) => startResize(ev, t, wi)}
                              className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize touch-none flex items-center justify-center"
                              title="드래그해서 마감일 늘리기"
                            >
                              <span className="w-0.5 h-2.5 rounded bg-white/70" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-neutral-400 mt-3">
          막대 오른쪽 끝을 잡고 드래그하면 여러 날에 걸치도록 마감일을 늘릴 수 있어요. · 초록=완료
        </p>
      </div>

      {/* 진행률 */}
      <div className="rounded-2xl border border-neutral-200/70 bg-white px-5 py-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-neutral-900">전체 진행률</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {durationDays}일 프로그램 · {tasks.length}개 할 일 중 {doneCount}개 완료
          </p>
        </div>
        <p className="text-2xl font-black ig-gradient-text">{pct}%</p>
      </div>

      <p className="text-[11px] text-neutral-400 px-1">
        <GripVertical className="w-3 h-3 inline -mt-0.5" /> 손잡이를 잡고 끌어서 다른 날로 옮기거나 순서를 바꿀 수 있어요.
      </p>

      {days.map((day) => {
        const dayTasks = byDay(day);
        const isToday = day === todayIndex;
        const isPast = day < todayIndex;
        return (
          <section
            key={day}
            id={`cday-${day}`}
            onDragOver={(e) => {
              if (dragId) {
                e.preventDefault();
                setDragOverDay(day);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) reorder(dragId, day, null);
            }}
            style={{ scrollMarginTop: "16px" }}
            className={
              "rounded-2xl border p-4 sm:p-5 transition-colors " +
              (dragOverDay === day
                ? "border-pink-400 bg-pink-50/60"
                : isToday
                  ? "border-pink-300 bg-pink-50/40 shadow-[0_4px_16px_-8px_rgba(219,39,119,0.4)]"
                  : "border-neutral-200/70 bg-white")
            }
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className={
                  "shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl text-xs font-black " +
                  (isToday
                    ? "ig-gradient text-white"
                    : isPast
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-500")
                }
              >
                D{day}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-neutral-900 inline-flex items-center gap-2">
                  Day {day}
                  {isToday && (
                    <span className="text-[10px] font-bold text-pink-600 bg-pink-100 rounded-full px-2 py-0.5">
                      오늘
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-neutral-400 inline-flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> {dateForDay(startAtIso, day)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {dayTasks.length === 0 && addDay !== day && (
                <p className="text-xs text-neutral-400 px-1">할 일이 없어요. 여기로 끌어다 놓거나 추가하세요.</p>
              )}
              {dayTasks.map((task) =>
                editingId === task.id ? (
                  <TaskEditRow
                    key={task.id}
                    initialTitle={task.title}
                    initialDescription={task.description}
                    initialDay={task.day}
                    initialEndDay={task.endDay ?? null}
                    maxDay={maxDay}
                    busy={busyId === task.id}
                    onCancel={() => setEditingId(null)}
                    onSave={(title, desc, d, ed) => saveEdit(task.id, title, desc, d, ed)}
                    onDelete={() => removeTask(task.id)}
                  />
                ) : (
                  <div key={task.id}>
                  <div
                    onDragOver={(e) => {
                      if (dragId && dragId !== task.id) e.preventDefault();
                    }}
                    onDrop={(e) => {
                      if (dragId && dragId !== task.id) {
                        e.preventDefault();
                        e.stopPropagation();
                        reorder(dragId, task.day, task.id);
                      }
                    }}
                    className={
                      "group flex items-start gap-2 rounded-xl border border-neutral-200/70 bg-white px-2.5 py-2.5 " +
                      (dragId === task.id ? "opacity-40" : "")
                    }
                  >
                    <span
                      draggable
                      onDragStart={(e) => {
                        setDragId(task.id);
                        // Firefox/Safari 등은 setData 없으면 드래그가 시작되지 않음
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", task.id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setDragOverDay(null);
                      }}
                      className="shrink-0 mt-0.5 cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500"
                      aria-label="드래그해서 이동"
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleDone(task)}
                      disabled={busyId === task.id}
                      className={
                        "shrink-0 mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors " +
                        (task.doneAt
                          ? "bg-neutral-900 border-neutral-900 text-white"
                          : "border-neutral-300 bg-white hover:border-neutral-500")
                      }
                      aria-label={task.doneAt ? "완료 취소" : "완료"}
                    >
                      {task.doneAt && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <div
                      className={"flex-1 min-w-0 " + (task.guideKey ? "cursor-pointer" : "")}
                      onClick={
                        task.guideKey
                          ? () => setOpenGuideId(openGuideId === task.id ? null : task.id)
                          : undefined
                      }
                    >
                      <p
                        className={
                          "text-sm font-medium inline-flex items-center gap-1.5 " +
                          (task.doneAt ? "text-neutral-400 line-through" : "text-neutral-900")
                        }
                      >
                        {task.title}
                        {task.endDay && task.endDay > task.day && (
                          <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 rounded px-1.5 py-0.5">
                            D{task.day}~D{task.endDay}
                          </span>
                        )}
                        {task.guideKey && (
                          <ChevronDown
                            className={"w-3.5 h-3.5 text-pink-500 transition-transform " + (openGuideId === task.id ? "rotate-180" : "")}
                          />
                        )}
                      </p>
                      {task.description && (
                        <p className={"text-[12px] mt-0.5 whitespace-pre-wrap " + (task.doneAt ? "text-neutral-300" : "text-neutral-500")}>
                          {task.description}
                        </p>
                      )}
                      {task.guideKey && openGuideId !== task.id && (
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-pink-600">
                          <Wand2 className="w-3 h-3" /> 탭하면 {GUIDE_LABELS[task.guideKey] ?? "도우미"} 열려요
                        </span>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1 opacity-60 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setEditingId(task.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
                        aria-label="수정"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTask(task.id)}
                        disabled={busyId === task.id}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {task.guideKey && openGuideId === task.id && (
                    <div className="mt-2 rounded-xl border border-pink-200 bg-white p-4">
                      <TaskGuide guideKey={task.guideKey} taskId={task.id} data={task.data} />
                    </div>
                  )}
                  </div>
                )
              )}

              {addDay === day ? (
                <TaskEditRow
                  initialTitle=""
                  initialDescription=""
                  initialDay={day}
                  initialEndDay={null}
                  maxDay={maxDay}
                  busy={busyId === "add"}
                  addMode
                  onCancel={() => setAddDay(null)}
                  onSave={(title, desc) => addTask(day, title, desc)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAddDay(day);
                    setEditingId(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-pink-600 px-1 py-1"
                >
                  <Plus className="w-3.5 h-3.5" /> 할 일 추가
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TaskEditRow({
  initialTitle,
  initialDescription,
  initialDay,
  initialEndDay,
  maxDay,
  busy,
  addMode,
  onSave,
  onCancel,
  onDelete,
}: {
  initialTitle: string;
  initialDescription: string;
  initialDay: number;
  initialEndDay: number | null;
  maxDay: number;
  busy: boolean;
  addMode?: boolean;
  onSave: (title: string, description: string, day: number, endDay: number | null) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [day, setDay] = useState(initialDay);
  const [endDay, setEndDay] = useState<number | "">(initialEndDay ?? "");

  return (
    <div className="rounded-xl border border-neutral-300 bg-white p-3 space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="할 일 제목"
        autoFocus
        className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="설명 (선택)"
        className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] focus:outline-none focus:border-pink-400 resize-none"
      />
      {!addMode && (
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-neutral-500">
            시작 Day
            <input
              type="number"
              min={1}
              max={maxDay}
              value={day}
              onChange={(e) => setDay(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 px-2 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-neutral-500">
            마감 Day <span className="text-neutral-400">(여러 날, 비우면 하루)</span>
            <input
              type="number"
              min={day}
              max={maxDay}
              value={endDay}
              onChange={(e) => setEndDay(e.target.value === "" ? "" : Math.max(1, Number(e.target.value) || 1))}
              placeholder="—"
              className="w-20 px-2 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </label>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSave(title, description, day, endDay === "" ? null : Number(endDay))}
          disabled={busy || !title.trim()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {addMode ? "추가" : "저장"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-100"
        >
          <X className="w-3.5 h-3.5" /> 취소
        </button>
        {!addMode && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> 삭제
          </button>
        )}
      </div>
    </div>
  );
}
