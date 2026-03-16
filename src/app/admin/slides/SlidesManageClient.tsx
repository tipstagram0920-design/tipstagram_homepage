"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ToggleLeft, ToggleRight, GripVertical } from "lucide-react";

interface Slide {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  link: string | null;
  buttonText: string | null;
  bgColor: string | null;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  image: "",
  link: "",
  buttonText: "자세히 보기",
  bgColor: "from-purple-900 via-pink-900 to-orange-800",
};

export function SlidesManageClient({ slides: initialSlides }: { slides: Slide[] }) {
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: slides.length }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch {
      alert("생성 실패");
    } finally {
      setLoading(false);
    }
  };

  const toggleSlide = async (id: string) => {
    const slide = slides.find((s) => s.id === id);
    if (!slide) return;
    await fetch(`/api/admin/slides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !slide.isActive }),
    });
    router.refresh();
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("슬라이드를 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/slides/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="max-w-3xl">
      <button onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl ig-gradient text-white font-semibold text-sm mb-6">
        <Plus className="w-4 h-4" /> 슬라이드 추가
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6 space-y-4">
          <h3 className="font-bold text-neutral-900">새 슬라이드</h3>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">제목 *</label>
            <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">부제목</label>
            <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">이미지 URL</label>
              <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">배경 그라디언트</label>
              <input type="text" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                placeholder="from-purple-900 via-pink-900 to-orange-800"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">링크</label>
              <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="/courses"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">버튼 텍스트</label>
              <input type="text" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700">취소</button>
            <button type="submit" disabled={loading}
              className="px-4 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold disabled:opacity-50">
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center gap-4">
            <GripVertical className="w-4 h-4 text-neutral-300 shrink-0" />
            <div
              className={`w-16 h-10 rounded-lg bg-gradient-to-br ${slide.bgColor || "from-neutral-700 to-neutral-900"} overflow-hidden shrink-0`}
            >
              {slide.image && <img src={slide.image} alt="" className="w-full h-full object-cover opacity-60" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-neutral-900 text-sm truncate">{slide.title}</p>
              {slide.subtitle && <p className="text-xs text-neutral-400 truncate">{slide.subtitle}</p>}
            </div>
            <button onClick={() => toggleSlide(slide.id)}>
              {slide.isActive
                ? <ToggleRight className="w-6 h-6 text-green-500" />
                : <ToggleLeft className="w-6 h-6 text-neutral-300" />}
            </button>
            <button onClick={() => deleteSlide(slide.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-300 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100 text-neutral-400">
            슬라이드를 추가해보세요
          </div>
        )}
      </div>
    </div>
  );
}
