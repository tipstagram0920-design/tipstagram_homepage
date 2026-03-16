"use client";

import { useState } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  views: number;
  createdAt: Date;
  author: { name: string | null; email: string };
}

interface Props {
  posts: Post[];
}

export function BoardManageClient({ posts: initial }: Props) {
  const [posts, setPosts] = useState(initial);
  const [search, setSearch] = useState("");

  const del = async (id: string) => {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.author.name ?? p.author.email).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="제목 또는 작성자 검색..."
        className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
      />

      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500">제목</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500">작성자</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500">조회수</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500">작성일</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-neutral-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.map((post) => (
              <tr key={post.id} className="hover:bg-neutral-50/50">
                <td className="px-5 py-4">
                  <Link href={`/board/${post.id}`} target="_blank" className="font-semibold text-neutral-900 hover:text-pink-500 line-clamp-1">
                    {post.title}
                  </Link>
                </td>
                <td className="px-5 py-4 text-neutral-500 text-xs">{post.author.name || post.author.email}</td>
                <td className="px-5 py-4 text-neutral-500">{post.views.toLocaleString()}</td>
                <td className="px-5 py-4 text-neutral-400 text-xs">
                  {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => del(post.id)} className="text-xs font-semibold text-red-400 hover:underline">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-neutral-400">
                  게시글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
