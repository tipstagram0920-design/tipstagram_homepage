"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  tags: string[];
}

export function UserEditClient({ user }: { user: User }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email,
    role: user.role,
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          ...(form.newPassword ? { password: form.newPassword } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "수정 실패");
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/users"), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">이름</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">이메일</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">권한</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400">
            <option value="USER">일반 회원</option>
            <option value="ADMIN">관리자</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            새 비밀번호 <span className="text-xs text-neutral-400">(변경 시에만 입력)</span>
          </label>
          <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            placeholder="비워두면 변경 안 됨"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-xl">수정되었습니다!</p>}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
          취소
        </button>
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold disabled:opacity-50">
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
