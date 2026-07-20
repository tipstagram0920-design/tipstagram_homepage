"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Plus,
  Trash2,
  Pencil,
  X,
  Loader2,
  CalendarDays,
} from "lucide-react";

export interface BoardTask {
  id: string;
  day: number;
  order: number;
  title: string;
  description: string;
  doneAt: string | null;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function dateForDay(startAtIso: string, day: number): string {
  const start = new Date(startAtIso);
  const d = new Date(start.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
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

  const todayIndex = useMemo(() => {
    const start = new Date(startAtIso);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  }, [startAtIso]);

  const maxDay = Math.max(durationDays, ...tasks.map((t) => t.day));
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const byDay = (day: number) =>
    tasks.filter((t) => t.day === day).sort((a, b) => a.order - b.order);

  const doneCount = tasks.filter((t) => t.doneAt).length;

  const toggleDone = async (task: BoardTask) => {
    setBusyId(task.id);
    const next = !task.doneAt;
    // 낙관적 업데이트
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, doneAt: next ? new Date().toISOString() : null } : t))
    );
    try {
      const res = await fetch(`/api/consulting/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: next }),
      });
      if (!res.ok) {
        // 롤백
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, doneAt: task.doneAt } : t))
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const saveEdit = async (taskId: string, title: string, description: string) => {
    if (!title.trim()) return;
    setBusyId(taskId);
    try {
      const res = await fetch(`/api/consulting/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, title, description } : t))
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

  return (
    <div className="space-y-4">
      {/* 진행률 */}
      <div className="rounded-2xl border border-neutral-200/70 bg-white px-5 py-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-neutral-900">전체 진행률</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {durationDays}일 프로그램 · {tasks.length}개 할 일 중 {doneCount}개 완료
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black ig-gradient-text">
            {tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {days.map((day) => {
        const dayTasks = byDay(day);
        const isToday = day === todayIndex;
        const isPast = day < todayIndex;
        return (
          <section
            key={day}
            className={
              "rounded-2xl border p-4 sm:p-5 " +
              (isToday
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
                <p className="text-xs text-neutral-400 px-1">할 일이 없어요.</p>
              )}
              {dayTasks.map((task) =>
                editingId === task.id ? (
                  <TaskEditRow
                    key={task.id}
                    initialTitle={task.title}
                    initialDescription={task.description}
                    busy={busyId === task.id}
                    onCancel={() => setEditingId(null)}
                    onSave={(title, desc) => saveEdit(task.id, title, desc)}
                    onDelete={() => removeTask(task.id)}
                  />
                ) : (
                  <div
                    key={task.id}
                    className="group flex items-start gap-3 rounded-xl border border-neutral-200/70 bg-white px-3 py-2.5"
                  >
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
                    <div className="flex-1 min-w-0">
                      <p
                        className={
                          "text-sm font-medium " +
                          (task.doneAt ? "text-neutral-400 line-through" : "text-neutral-900")
                        }
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className={"text-[12px] mt-0.5 whitespace-pre-wrap " + (task.doneAt ? "text-neutral-300" : "text-neutral-500")}>
                          {task.description}
                        </p>
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
                )
              )}

              {addDay === day ? (
                <TaskEditRow
                  initialTitle=""
                  initialDescription=""
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
  busy,
  addMode,
  onSave,
  onCancel,
  onDelete,
}: {
  initialTitle: string;
  initialDescription: string;
  busy: boolean;
  addMode?: boolean;
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSave(title, description)}
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
