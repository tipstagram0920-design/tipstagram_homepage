"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Copy, CheckCircle2, Trash2, Calendar, Bell, Loader2 } from "lucide-react";

interface Draft {
  id: string;
  channel: string;
  title: string;
  body: string;
  scheduledAt: string;
  status: string;
  notifiedAt: string | null;
  doneAt: string | null;
  notes: string | null;
}

const CHANNEL_LABEL: Record<string, string> = {
  openchat: "카카오 오픈채팅",
  channel_kakao: "카카오 채널",
  instagram_dm: "인스타그램 DM",
};

const STATUS_TONE: Record<string, string> = {
  scheduled: "bg-neutral-100 text-neutral-600",
  notified: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-red-50 text-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: "예약",
  notified: "알림 발송됨",
  done: "발송 완료",
  cancelled: "취소",
};

function toLocalDateTimeInput(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
    "T" + pad(d.getHours()) + ":" + pad(d.getMinutes())
  );
}

export function BroadcastClient({ initial }: { initial: Draft[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [channel, setChannel] = useState("openchat");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState(toLocalDateTimeInput(new Date(Date.now() + 60 * 60 * 1000)));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const create = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/admin/crm/broadcast-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          title,
          body,
          scheduledAt: new Date(scheduledAt).toISOString(),
          notes,
        }),
      });
      setShowForm(false);
      setTitle("");
      setBody("");
      setNotes("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const markDone = async (id: string) => {
    await fetch(`/api/admin/crm/broadcast-drafts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markDone: true }),
    });
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    await fetch(`/api/admin/crm/broadcast-drafts/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const copyBody = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-neutral-500">총 {initial.length}건</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> {showForm ? "닫기" : "예약 추가"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">채널</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 bg-white"
              >
                {Object.entries(CHANNEL_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">예약 시각</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">제목 (내부 식별용)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 라이브 시작 30분 전 안내"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">본문 (실제 발송할 메시지)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="📢 안녕하세요! 잠시 후 라이브가 시작됩니다..."
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 resize-y whitespace-pre-wrap"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">메모 (선택, 내부용)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700"
            >
              취소
            </button>
            <button
              onClick={create}
              disabled={saving || !title.trim() || !body.trim()}
              className="px-4 py-2 rounded-xl ig-gradient text-white text-xs font-bold disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              예약 등록
            </button>
          </div>
        </div>
      )}

      {initial.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600">아직 예약된 메시지가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {initial.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                  {CHANNEL_LABEL[d.channel] ?? d.channel}
                </span>
                <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + (STATUS_TONE[d.status] ?? "bg-neutral-100 text-neutral-500")}>
                  {STATUS_LABEL[d.status] ?? d.status}
                </span>
                {d.notifiedAt && <Bell className="w-3 h-3 text-amber-500" />}
              </div>
              <h3 className="font-bold text-neutral-900 mb-1">{d.title}</h3>
              <p className="text-xs text-neutral-500 mb-3">
                <Calendar className="inline w-3 h-3 mr-1" />
                {new Date(d.scheduledAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })}
              </p>
              <pre className="text-xs text-neutral-700 bg-neutral-50 border border-neutral-100 rounded-lg p-3 whitespace-pre-wrap break-words mb-3 max-h-32 overflow-y-auto">
                {d.body}
              </pre>
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => copyBody(d.id, d.body)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-500"
                >
                  {copied === d.id ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 복사됨</> : <><Copy className="w-3.5 h-3.5" /> 본문 복사</>}
                </button>
                {d.status !== "done" ? (
                  <button
                    onClick={() => markDone(d.id)}
                    className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600"
                  >
                    ✓ 완료
                  </button>
                ) : (
                  <span className="inline-flex items-center px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold">완료됨</span>
                )}
                <button
                  onClick={() => remove(d.id)}
                  className="px-3 py-2 rounded-xl text-neutral-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
