"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, CheckCircle2, Circle, Bell, Calendar, Loader2, RotateCcw } from "lucide-react";

interface Task {
  id: string;
  title: string;
  detail: string | null;
  scheduledAt: string;
  status: string;
  campaignId: string | null;
  notifiedAt: string | null;
  doneAt: string | null;
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  pending: { label: "대기", tone: "bg-neutral-100 text-neutral-600" },
  notified: { label: "알림 발송됨", tone: "bg-amber-50 text-amber-700" },
  done: { label: "완료", tone: "bg-emerald-50 text-emerald-600" },
  skipped: { label: "건너뜀", tone: "bg-neutral-100 text-neutral-400" },
};

type Filter = "all" | "active" | "done";

function toLocalDateTime(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
    "T" + pad(d.getHours()) + ":" + pad(d.getMinutes())
  );
}

export function TasksClient({ initial }: { initial: Task[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [scheduledAt, setScheduledAt] = useState(
    toLocalDateTime(new Date(Date.now() + 60 * 60 * 1000))
  );
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<Filter>("active");

  const filtered = useMemo(() => {
    return initial.filter((t) => {
      if (filter === "active") return t.status === "pending" || t.status === "notified";
      if (filter === "done") return t.status === "done";
      return true;
    });
  }, [initial, filter]);

  const create = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/admin/crm/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          detail: detail || undefined,
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      });
      setTitle("");
      setDetail("");
      setShowForm(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const patch = async (id: string, body: Record<string, unknown>) => {
    await fetch(`/api/admin/crm/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    await fetch(`/api/admin/crm/tasks/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex gap-2">
          {([
            ["active", "진행 중"],
            ["done", "완료"],
            ["all", "전체"],
          ] as [Filter, string][]).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={
                "px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors " +
                (filter === k ? "ig-gradient text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200")
              }
            >
              {l}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> {showForm ? "닫기" : "task 추가"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 라이브 자료 PDF 출력해두기"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">상세 (선택)</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 resize-y"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">알림 받을 시각</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700">취소</button>
            <button onClick={create} disabled={saving || !title.trim()} className="px-4 py-2 rounded-xl ig-gradient text-white text-xs font-bold disabled:opacity-50 inline-flex items-center gap-1.5">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              추가
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600">해당 조건의 task가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const meta = STATUS_LABEL[t.status] ?? STATUS_LABEL.pending;
            const isDone = t.status === "done";
            return (
              <div
                key={t.id}
                className={
                  "bg-white rounded-2xl border border-neutral-100 p-4 flex items-start gap-3 " +
                  (isDone ? "opacity-60" : "")
                }
              >
                <button
                  onClick={() => patch(t.id, isDone ? { markPending: true } : { markDone: true })}
                  className="shrink-0 mt-0.5"
                  aria-label="완료 토글"
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-neutral-300 hover:text-pink-500" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className={"text-sm font-semibold text-neutral-900 " + (isDone ? "line-through" : "")}>
                      {t.title}
                    </p>
                    <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + meta.tone}>
                      {meta.label}
                    </span>
                    {t.notifiedAt && <Bell className="w-3 h-3 text-amber-500" />}
                    {t.campaignId && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">캠페인</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    {new Date(t.scheduledAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  {t.detail && (
                    <p className="text-xs text-neutral-600 mt-1.5 whitespace-pre-wrap leading-relaxed">{t.detail}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {isDone && (
                    <button
                      onClick={() => patch(t.id, { markPending: true })}
                      className="px-2 py-1 rounded-lg text-[10px] text-neutral-500 hover:bg-neutral-100 inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> 되돌리기
                    </button>
                  )}
                  <button
                    onClick={() => remove(t.id)}
                    className="px-2 py-1 rounded-lg text-[10px] text-neutral-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
