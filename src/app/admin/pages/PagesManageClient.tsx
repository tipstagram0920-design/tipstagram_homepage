"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
}

interface Props {
  pages: Page[];
}

const emptyForm = { slug: "", title: "", content: "", isActive: true };

export function PagesManageClient({ pages: initial }: Props) {
  const router = useRouter();
  const [pages, setPages] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async (id?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages${id ? `/${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.refresh();
      setEditing(null);
      setShowNew(false);
      setForm(emptyForm);
      const updated = await fetch("/api/admin/pages").then((r) => r.json());
      setPages(updated);
    } catch {
      alert("저장 실패");
    } finally {
      setLoading(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const startEdit = (page: Page) => {
    setEditing(page.id);
    setForm({ slug: page.slug, title: page.title, content: page.content, isActive: page.isActive });
    setShowNew(false);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => { setShowNew(true); setEditing(null); setForm(emptyForm); }}
        className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold"
      >
        + 새 페이지
      </button>

      {(showNew || editing) && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-neutral-900">{editing ? "페이지 수정" : "새 페이지"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">슬러그 (URL)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="about, terms 등"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">제목</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">내용 (HTML 가능)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              id="pageActive"
              className="w-4 h-4 accent-pink-500"
            />
            <label htmlFor="pageActive" className="text-sm text-neutral-700">공개</label>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setEditing(null); setShowNew(false); }}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700">취소</button>
            <button onClick={() => save(editing || undefined)} disabled={loading}
              className="px-4 py-2 rounded-xl ig-gradient text-white text-sm font-bold disabled:opacity-50">
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500">슬러그</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500">제목</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500">상태</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-neutral-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-neutral-50/50">
                <td className="px-5 py-4 font-mono text-xs text-neutral-600">/{page.slug}</td>
                <td className="px-5 py-4 font-semibold text-neutral-900">{page.title}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${page.isActive ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-400"}`}>
                    {page.isActive ? "공개" : "비공개"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right space-x-2">
                  <button onClick={() => startEdit(page)} className="text-xs font-semibold text-blue-500 hover:underline">수정</button>
                  <button onClick={() => del(page.id)} className="text-xs font-semibold text-red-400 hover:underline">삭제</button>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-neutral-400">등록된 페이지가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
