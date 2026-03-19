"use client";

import { useState, useRef } from "react";
import { GripVertical, Plus, Trash2, Edit2, Check, X, Loader2, Eye, EyeOff, RefreshCw } from "lucide-react";

interface Block {
  id: string;
  section: string;
  order: number;
  isActive: boolean;
  data: Record<string, unknown>;
}

type FieldDef = { k: string; label: string; placeholder: string };

const SECTIONS: { key: string; label: string; fields: FieldDef[] }[] = [
  { key: "stats", label: "통계 숫자", fields: [{ k: "value", label: "값", placeholder: "1,200+" }, { k: "label", label: "라벨", placeholder: "누적 수강생" }] },
  { key: "pain_points", label: "고민 카드", fields: [{ k: "emoji", label: "이모지", placeholder: "😔" }, { k: "title", label: "제목", placeholder: "제목" }, { k: "desc", label: "설명", placeholder: "설명" }] },
  { key: "solutions", label: "솔루션 카드", fields: [{ k: "num", label: "번호", placeholder: "01" }, { k: "title", label: "제목", placeholder: "제목" }, { k: "desc", label: "설명", placeholder: "설명" }] },
  { key: "benefits", label: "수강 혜택", fields: [{ k: "icon", label: "아이콘", placeholder: "🎬" }, { k: "title", label: "제목", placeholder: "제목" }, { k: "desc", label: "설명", placeholder: "설명" }] },
  { key: "faq", label: "FAQ", fields: [{ k: "q", label: "질문", placeholder: "질문" }, { k: "a", label: "답변", placeholder: "답변" }] },
  { key: "videos", label: "영상 후기", fields: [{ k: "youtubeId", label: "YouTube ID", placeholder: "dQw4w9WgXcQ" }, { k: "name", label: "이름", placeholder: "김○○ 수강생" }, { k: "desc", label: "설명", placeholder: "후기 한 줄" }] },
  { key: "reviews", label: "텍스트 후기", fields: [{ k: "name", label: "이름", placeholder: "김○○" }, { k: "tag", label: "태그", placeholder: "@username" }, { k: "rating", label: "별점", placeholder: "5" }, { k: "text", label: "후기 내용", placeholder: "후기..." }, { k: "highlight", label: "하이라이트", placeholder: "3개월 만에 5,000명 달성" }] },
];

const TEXTAREA_KEYS = new Set(["a", "desc", "text"]);

export default function HomepageEditor({ initial }: { initial: Block[] }) {
  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [activeTab, setActiveTab] = useState(SECTIONS[0].key);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const dragFrom = useRef<number | null>(null);

  const section = SECTIONS.find(s => s.key === activeTab)!;
  const sectionBlocks = blocks.filter(b => b.section === activeTab).sort((a, b) => a.order - b.order);

  function onDragStart(idx: number) { dragFrom.current = idx; }

  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    const from = dragFrom.current;
    if (from === null || from === idx) return;
    const updated = [...sectionBlocks];
    const [moved] = updated.splice(from, 1);
    updated.splice(idx, 0, moved);
    dragFrom.current = idx;
    const newBlocks = blocks
      .filter(b => b.section !== activeTab)
      .concat(updated.map((b, i) => ({ ...b, order: i })));
    setBlocks(newBlocks);
    fetch("/api/admin/homepage/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: updated.map(b => b.id) }),
    });
  }

  function startEdit(block: Block) {
    setEditingId(block.id);
    const strData: Record<string, string> = {};
    for (const [k, v] of Object.entries(block.data)) strData[k] = String(v ?? "");
    setEditData(strData);
  }

  function cancelEdit() { setEditingId(null); setEditData({}); }

  async function saveEdit(block: Block) {
    setSaving(block.id);
    const res = await fetch(`/api/admin/homepage/${block.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: editData, isActive: block.isActive }),
    });
    if (res.ok) {
      setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, data: editData } : b));
      setEditingId(null);
    }
    setSaving(null);
  }

  async function toggleActive(block: Block) {
    setSaving(block.id);
    await fetch(`/api/admin/homepage/${block.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: block.data, isActive: !block.isActive }),
    });
    setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, isActive: !b.isActive } : b));
    setSaving(null);
  }

  async function addBlock() {
    const emptyData = Object.fromEntries(section.fields.map(f => [f.k, ""]));
    const res = await fetch("/api/admin/homepage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: activeTab, data: emptyData }),
    });
    if (res.ok) {
      const nb = await res.json();
      const newBlock: Block = { ...nb, data: emptyData };
      setBlocks(prev => [...prev, newBlock]);
      startEdit(newBlock);
    }
  }

  async function deleteBlock(id: string) {
    if (!confirm("이 항목을 삭제할까요?")) return;
    await fetch(`/api/admin/homepage/${id}`, { method: "DELETE" });
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (editingId === id) cancelEdit();
  }

  async function seed() {
    if (!confirm("기본 데이터를 불러올까요? (기존 데이터가 있으면 건너뜁니다)")) return;
    setSeeding(true);
    const res = await fetch("/api/admin/homepage/seed", { method: "POST" });
    const json = await res.json();
    if (json.ok) {
      const freshRes = await fetch("/api/admin/homepage");
      const fresh = await freshRes.json();
      setBlocks(fresh.map((b: { id: string; section: string; order: number; isActive: boolean; data: string }) => ({
        ...b,
        data: JSON.parse(b.data),
      })));
    }
    setSeeding(false);
  }

  function getPreview(data: Record<string, unknown>) {
    const vals = Object.values(data).filter(v => typeof v === "string" && (v as string).length < 30);
    return (vals as string[]).slice(0, 2).join(" · ") || "항목";
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">홈페이지 편집</h1>
          <p className="text-sm text-neutral-500 mt-1">드래그로 순서 변경, 클릭으로 내용 수정</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={seed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`} />
            기본값 불러오기
          </button>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            홈페이지 미리보기
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-100 p-1 rounded-xl flex-wrap">
        {SECTIONS.map(s => {
          const count = blocks.filter(b => b.section === s.key).length;
          return (
            <button
              key={s.key}
              onClick={() => setActiveTab(s.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === s.key ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}
            >
              {s.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === s.key ? "bg-neutral-100 text-neutral-600" : "bg-neutral-200 text-neutral-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Block list */}
      <div className="space-y-2 mb-4">
        {sectionBlocks.length === 0 && (
          <div className="text-center py-12 text-neutral-400 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
            <p className="text-sm">항목이 없습니다. 아래 버튼으로 추가하거나 기본값을 불러오세요.</p>
          </div>
        )}

        {sectionBlocks.map((block, idx) => (
          <div
            key={block.id}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={e => onDragOver(e, idx)}
            onDragEnd={() => { dragFrom.current = null; }}
            className={`bg-white rounded-xl border transition-all ${!block.isActive ? "opacity-50 border-neutral-100" : "border-neutral-200 hover:border-neutral-300"}`}
          >
            {editingId === block.id ? (
              <div className="p-4">
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {section.fields.map(f => (
                    <div key={f.k}>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1">{f.label}</label>
                      {TEXTAREA_KEYS.has(f.k) ? (
                        <textarea
                          value={editData[f.k] ?? ""}
                          onChange={e => setEditData(prev => ({ ...prev, [f.k]: e.target.value }))}
                          placeholder={f.placeholder}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editData[f.k] ?? ""}
                          onChange={e => {
                            let val = e.target.value;
                            if (f.k === "youtubeId") {
                              const match = val.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/);
                              if (match && match[2].length === 11) val = match[2];
                            }
                            setEditData(prev => ({ ...prev, [f.k]: val }));
                          }}
                          placeholder={f.placeholder}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => saveEdit(block)}
                    disabled={saving === block.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {saving === block.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    저장
                  </button>
                  <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition-colors">
                    <X className="w-3.5 h-3.5" />취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-400 shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{getPreview(block.data)}</p>
                  {activeTab === "faq" && (
                    <p className="text-xs text-neutral-400 truncate mt-0.5">{String(block.data.a ?? "").slice(0, 60)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(block)} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors" title={block.isActive ? "비활성화" : "활성화"}>
                    {saving === block.id ? <Loader2 className="w-4 h-4 animate-spin text-neutral-400" /> : block.isActive ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-neutral-400" />}
                  </button>
                  <button onClick={() => startEdit(block)} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="수정">
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button onClick={() => deleteBlock(block.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="삭제">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addBlock}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-purple-300 hover:text-purple-500 text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />항목 추가
      </button>
    </div>
  );
}
