"use client";

import { useState } from "react";
import { Send, Users } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function AdminMailPage() {
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; total: number } | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>안녕하세요 {{name}}님,</p><p></p><p>팁스타그램입니다.</p>",
    editorProps: {
      attributes: { class: "tiptap-content ProseMirror focus:outline-none min-h-[300px] px-1" },
    },
  });

  const handleSend = async () => {
    if (!subject || !editor?.getHTML()) return;
    if (!confirm(`메일을 발송하시겠습니까?\n태그: ${tags || "전체 회원"}`)) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          html: editor.getHTML(),
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "발송 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-8">메일 발송</h1>

      <div className="max-w-3xl space-y-5">
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5">
          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              <Users className="inline w-4 h-4 mr-1.5" />수신 대상
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="태그로 필터 (예: VIP, 수강생) - 비워두면 전체 발송"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
            <p className="text-xs text-neutral-400 mt-1.5">쉼표로 구분하여 여러 태그 입력 가능. 비워두면 전체 회원에게 발송됩니다.</p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">메일 제목 *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="메일 제목을 입력하세요"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              메일 내용 <span className="text-xs text-neutral-400 ml-1">{"{{name}}"} 으로 이름 치환 가능</span>
            </label>
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="p-4">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
            <p className="text-sm font-semibold text-green-700">
              발송 완료: {result.success}명 성공, {result.failed}명 실패 (총 {result.total}명)
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={loading || !subject}
            className="flex items-center gap-2 px-6 py-3 rounded-xl ig-gradient text-white font-bold text-sm hover:opacity-90 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? "발송 중..." : "메일 발송"}
          </button>
        </div>
      </div>
    </div>
  );
}
