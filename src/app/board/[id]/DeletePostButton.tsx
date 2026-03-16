"use client";

import { useRouter } from "next/navigation";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) router.push("/board");
  };

  return (
    <button
      onClick={handleDelete}
      className="text-sm font-medium text-red-400 hover:text-red-600"
    >
      삭제
    </button>
  );
}
