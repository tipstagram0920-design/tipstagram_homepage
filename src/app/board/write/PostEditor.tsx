"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, ImageIcon, LinkIcon,
  Heading1, Heading2, Heading3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  content: string;
}

interface PostEditorProps {
  post?: Post | null;
}

function ToolbarButton({ onClick, active, children, title }: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-lg transition-colors",
        active ? "bg-pink-100 text-pink-600" : "text-neutral-600 hover:bg-neutral-100"
      )}
    >
      {children}
    </button>
  );
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(post?.title || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url as string;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: post?.content || "",
    editorProps: {
      attributes: {
        class: "tiptap-content ProseMirror focus:outline-none min-h-[400px] px-1",
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
        if (imageFiles.length === 0) return false;
        event.preventDefault();
        imageFiles.forEach(async (file) => {
          setUploading(true);
          try {
            const url = await uploadImage(file);
            if (url) {
              const { state, dispatch } = view;
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? state.selection.anchor;
              const node = state.schema.nodes.image.create({ src: url });
              dispatch(state.tr.insert(pos, node));
            }
          } finally {
            setUploading(false);
          }
        });
        return true;
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const imageItem = Array.from(items).find((i) => i.type.startsWith("image/"));
        if (!imageItem) return false;
        const file = imageItem.getAsFile();
        if (!file) return false;
        event.preventDefault();
        (async () => {
          setUploading(true);
          try {
            const url = await uploadImage(file);
            if (url) {
              view.dispatch(view.state.tr.insert(
                view.state.selection.anchor,
                view.state.schema.nodes.image.create({ src: url })
              ));
            }
          } finally {
            setUploading(false);
          }
        })();
        return true;
      },
    },
  });

  const insertImageFromFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (url && editor) editor.chain().focus().setImage({ src: url }).run();
    } finally {
      setUploading(false);
    }
  }, [editor, uploadImage]);

  const addLink = useCallback(() => {
    const url = window.prompt("링크 URL을 입력하세요:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !editor) return;

    setLoading(true);
    try {
      const method = post ? "PUT" : "POST";
      const url = post ? `/api/posts/${post.id}` : "/api/posts";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: editor.getHTML() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/board/${data.id}`);
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!editor) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        required
        className="w-full px-5 py-4 text-xl font-bold border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 placeholder:text-neutral-300"
      />

      {/* Editor */}
      <div className="border border-neutral-200 rounded-2xl overflow-hidden focus-within:border-pink-400 transition-colors">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-neutral-100 bg-neutral-50">
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1">
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2">
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3">
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-neutral-200 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="굵게">
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="기울임">
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="밑줄">
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="취소선">
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-neutral-200 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="왼쪽 정렬">
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="가운데 정렬">
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="오른쪽 정렬">
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-neutral-200 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="글머리 기호">
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="번호 목록">
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="인용구">
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-neutral-200 mx-1" />
          {/* Image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) insertImageFromFile(f);
              e.target.value = "";
            }}
          />
          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            title="이미지 업로드 (드래그·붙여넣기도 가능)"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="링크 삽입">
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {uploading && (
            <span className="ml-2 text-xs text-pink-500 animate-pulse">이미지 업로드 중...</span>
          )}
        </div>

        {/* Content area */}
        <div className="relative p-5">
          <EditorContent editor={editor} />
          <p className="absolute bottom-2 right-3 text-xs text-neutral-300 pointer-events-none select-none">
            이미지를 여기로 드래그하거나 붙여넣기
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "저장 중..." : post ? "수정하기" : "게시하기"}
        </button>
      </div>
    </form>
  );
}
