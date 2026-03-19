"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { cn } from "@/lib/utils";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, ImageIcon, LinkIcon,
  Heading1, Heading2, Heading3,
} from "lucide-react";
import { DESCRIPTION_TEMPLATES } from "./descriptionTemplates";

interface ProductFormProps {
  product?: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    description: string;
    price: number;
    thumbnail?: string | null;
    highlights: string[];
    isActive: boolean;
    order: number;
  };
}

function ToolbarBtn({ onClick, active, title, children }: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={cn("p-2 rounded-lg transition-colors",
        active ? "bg-pink-100 text-pink-600" : "text-neutral-600 hover:bg-neutral-100"
      )}>
      {children}
    </button>
  );
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    slug: product?.slug || "",
    title: product?.title || "",
    subtitle: product?.subtitle || "",
    price: product?.price || 0,
    thumbnail: product?.thumbnail || "",
    isActive: product?.isActive ?? true,
    order: product?.order || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(product?.description || "");
  const [previewMode, setPreviewMode] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(DESCRIPTION_TEMPLATES[0].id);
  const previewDivRef = useRef<HTMLDivElement | null>(null);
  const isComposingRef = useRef(false);
  const previewImgInputRef = useRef<HTMLInputElement>(null);

  const exec = (cmd: string, value?: string) => {
    previewDivRef.current?.focus();
    document.execCommand(cmd, false, value);
    setRawHtml(previewDivRef.current?.innerHTML || "");
  };

  const insertHtml = (html: string) => {
    previewDivRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    setRawHtml(previewDivRef.current?.innerHTML || "");
  };

  const uploadPreviewImage = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) return;
      const { url } = await res.json();
      insertHtml(`<img src="${url}" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;display:block;" />`);
    } finally {
      setUploading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // previewMode가 켜질 때만 div innerHTML 초기화 (사용자 타이핑 중엔 건드리지 않음)
  useEffect(() => {
    if (previewMode && previewDivRef.current) {
      previewDivRef.current.innerHTML = rawHtml;
    }
  }, [previewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url as string;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ inline: false, allowBase64: false }),
      TiptapLink.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: product?.description || "",
    editorProps: {
      attributes: {
        class: "tiptap-content ProseMirror focus:outline-none min-h-[320px] px-1",
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
    const url = window.prompt("링크 URL:");
    if (url && editor) editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("상품 제목을 입력하세요."); return; }
    if (!form.slug.trim()) { setError("슬러그를 입력하세요."); return; }
    setLoading(true);
    setError("");
    const description = htmlMode ? rawHtml : (editor?.getHTML() || "");
    try {
      const method = product ? "PUT" : "POST";
      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, description, highlights: [] }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "저장 실패");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">상품 제목 *</label>
            <input type="text" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">슬러그 *</label>
            <input type="text" required value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, "-") })}
              placeholder="my-course"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">부제목</label>
          <input type="text" value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
        </div>

        {/* 상세 설명 리치 에디터 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-neutral-700">
              상세 설명 *
              {uploading && <span className="ml-2 text-xs text-pink-500 animate-pulse">이미지 업로드 중...</span>}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTemplatePicker(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
              >
                템플릿
              </button>
              {htmlMode && (
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    previewMode ? "bg-blue-100 text-blue-600" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {previewMode ? "HTML 코드 보기" : "미리보기 · 직접 편집"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!htmlMode) {
                    setRawHtml(editor?.getHTML() || "");
                    setPreviewMode(false);
                  } else {
                    editor?.commands.setContent(rawHtml);
                  }
                  setHtmlMode(!htmlMode);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  htmlMode ? "bg-pink-100 text-pink-600" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                <span className="font-mono">&lt;/&gt;</span>
                {htmlMode ? "에디터로 전환" : "HTML 소스 편집"}
              </button>
            </div>
          </div>
          <div className="border border-neutral-200 rounded-2xl overflow-hidden focus-within:border-pink-400 transition-colors">
            {!htmlMode && (
              <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-neutral-100 bg-neutral-50">
                <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive("heading", { level: 1 })} title="H1"><Heading1 className="w-4 h-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} title="H2"><Heading2 className="w-4 h-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })} title="H3"><Heading3 className="w-4 h-4" /></ToolbarBtn>
                <div className="w-px h-5 bg-neutral-200 mx-1" />
                <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="굵게"><Bold className="w-4 h-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="기울임"><Italic className="w-4 h-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive("underline")} title="밑줄"><UnderlineIcon className="w-4 h-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")} title="취소선"><Strikethrough className="w-4 h-4" /></ToolbarBtn>
                <div className="w-px h-5 bg-neutral-200 mx-1" />
                <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign("left").run()} active={editor?.isActive({ textAlign: "left" })} title="왼쪽"><AlignLeft className="w-4 h-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign("center").run()} active={editor?.isActive({ textAlign: "center" })} title="가운데"><AlignCenter className="w-4 h-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign("right").run()} active={editor?.isActive({ textAlign: "right" })} title="오른쪽"><AlignRight className="w-4 h-4" /></ToolbarBtn>
                <div className="w-px h-5 bg-neutral-200 mx-1" />
                <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="글머리 기호"><List className="w-4 h-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="번호 목록"><ListOrdered className="w-4 h-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="인용구"><Quote className="w-4 h-4" /></ToolbarBtn>
                <div className="w-px h-5 bg-neutral-200 mx-1" />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) insertImageFromFile(f); e.target.value = ""; }} />
                <ToolbarBtn onClick={() => fileInputRef.current?.click()} title="이미지 업로드 (드래그·붙여넣기도 가능)">
                  <ImageIcon className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={addLink} active={editor?.isActive("link")} title="링크"><LinkIcon className="w-4 h-4" /></ToolbarBtn>
              </div>
            )}
            {htmlMode ? (
              previewMode ? (
                <>
                  {/* 미리보기 편집 툴바 */}
                  <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-neutral-100 bg-neutral-50">
                    {/* 헤딩 */}
                    {(["H1","H2","H3"] as const).map(h => (
                      <button key={h} type="button" title={h}
                        onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", h); }}
                        className="px-2 py-1.5 rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-100">{h}</button>
                    ))}
                    <div className="w-px h-5 bg-neutral-200 mx-1" />
                    {/* 기본 서식 */}
                    <button type="button" title="굵게" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }}
                      className="p-1.5 rounded-lg hover:bg-neutral-100"><Bold className="w-4 h-4" /></button>
                    <button type="button" title="기울임" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }}
                      className="p-1.5 rounded-lg hover:bg-neutral-100"><Italic className="w-4 h-4" /></button>
                    <button type="button" title="밑줄" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }}
                      className="p-1.5 rounded-lg hover:bg-neutral-100"><UnderlineIcon className="w-4 h-4" /></button>
                    <button type="button" title="취소선" onMouseDown={(e) => { e.preventDefault(); exec("strikeThrough"); }}
                      className="p-1.5 rounded-lg hover:bg-neutral-100"><Strikethrough className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-neutral-200 mx-1" />
                    {/* 글자 크기 */}
                    <select title="글자 크기"
                      onMouseDown={(e) => e.stopPropagation()}
                      onChange={(e) => { exec("fontSize", e.target.value); e.target.value = ""; }}
                      className="text-xs border border-neutral-200 rounded-lg px-1 py-1 bg-white text-neutral-600 focus:outline-none">
                      <option value="">크기</option>
                      <option value="1">매우 작게</option>
                      <option value="2">작게</option>
                      <option value="3">보통</option>
                      <option value="4">크게</option>
                      <option value="5">매우 크게</option>
                      <option value="6">제목급</option>
                    </select>
                    {/* 글자 색상 */}
                    <label title="글자 색" className="p-1.5 rounded-lg hover:bg-neutral-100 cursor-pointer relative">
                      <span className="text-xs font-bold text-neutral-600">A</span>
                      <input type="color" defaultValue="#f97316" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        onChange={(e) => exec("foreColor", e.target.value)} />
                    </label>
                    {/* 배경 색상 */}
                    <label title="배경 색" className="p-1.5 rounded-lg hover:bg-neutral-100 cursor-pointer relative">
                      <span className="text-xs font-bold" style={{ background: "#fef3c7", padding: "1px 3px", borderRadius: 3 }}>A</span>
                      <input type="color" defaultValue="#fef3c7" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        onChange={(e) => exec("hiliteColor", e.target.value)} />
                    </label>
                    <div className="w-px h-5 bg-neutral-200 mx-1" />
                    {/* 정렬 */}
                    <button type="button" title="왼쪽" onMouseDown={(e) => { e.preventDefault(); exec("justifyLeft"); }}
                      className="p-1.5 rounded-lg hover:bg-neutral-100"><AlignLeft className="w-4 h-4" /></button>
                    <button type="button" title="가운데" onMouseDown={(e) => { e.preventDefault(); exec("justifyCenter"); }}
                      className="p-1.5 rounded-lg hover:bg-neutral-100"><AlignCenter className="w-4 h-4" /></button>
                    <button type="button" title="오른쪽" onMouseDown={(e) => { e.preventDefault(); exec("justifyRight"); }}
                      className="p-1.5 rounded-lg hover:bg-neutral-100"><AlignRight className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-neutral-200 mx-1" />
                    {/* 이미지 */}
                    <input ref={previewImgInputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPreviewImage(f); e.target.value = ""; }} />
                    <button type="button" title="이미지 업로드"
                      onMouseDown={(e) => { e.preventDefault(); previewImgInputRef.current?.click(); }}
                      className="p-1.5 rounded-lg hover:bg-neutral-100"><ImageIcon className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-neutral-200 mx-1" />
                    {/* 박스 삽입 */}
                    <select title="박스 삽입"
                      onMouseDown={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const v = e.target.value; e.target.value = "";
                        if (!v) return;
                        const boxes: Record<string, string> = {
                          default: `<div style="padding:16px 20px;background:#f9f9f9;border-radius:12px;border:1px solid #eee;margin:12px 0;"><p style="margin:0;">텍스트를 입력하세요</p></div>`,
                          highlight: `<div style="padding:16px 20px;background:#fff7ed;border-left:4px solid #f97316;border-radius:0 12px 12px 0;margin:12px 0;"><p style="margin:0;font-weight:700;color:#f97316;">강조 텍스트</p></div>`,
                          dark: `<div style="padding:20px 24px;background:#1a1a1a;border-radius:12px;margin:12px 0;"><p style="margin:0;color:white;font-weight:700;">다크 박스 텍스트</p></div>`,
                          gradient: `<div style="padding:32px 24px;background:linear-gradient(135deg,#f97316,#ec4899);border-radius:16px;margin:12px 0;text-align:center;"><p style="margin:0;color:white;font-size:20px;font-weight:800;">그라데이션 박스</p></div>`,
                          quote: `<blockquote style="padding:16px 20px;border-left:4px solid #e5e7eb;margin:12px 0;color:#6b7280;font-style:italic;">"인용구 텍스트를 입력하세요"</blockquote>`,
                        };
                        insertHtml(boxes[v] || "");
                      }}
                      className="text-xs border border-neutral-200 rounded-lg px-1 py-1 bg-white text-neutral-600 focus:outline-none">
                      <option value="">박스 삽입</option>
                      <option value="default">기본 박스</option>
                      <option value="highlight">강조 박스 (주황)</option>
                      <option value="dark">다크 박스</option>
                      <option value="gradient">그라데이션 박스</option>
                      <option value="quote">인용구</option>
                    </select>
                  </div>
                  {/* 편집 영역 */}
                  <div className="p-6 min-h-[400px] bg-white">
                    <div
                      ref={previewDivRef}
                      className="tiptap-content text-neutral-600 leading-relaxed outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onCompositionStart={() => { isComposingRef.current = true; }}
                      onCompositionEnd={(e) => {
                        isComposingRef.current = false;
                        setRawHtml((e.currentTarget as HTMLDivElement).innerHTML);
                      }}
                      onInput={(e) => {
                        if (!isComposingRef.current) {
                          setRawHtml((e.currentTarget as HTMLDivElement).innerHTML);
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="p-3">
                  <textarea
                    value={rawHtml}
                    onChange={(e) => setRawHtml(e.target.value)}
                    className="w-full font-mono text-xs text-neutral-800 bg-neutral-50 rounded-xl p-4 min-h-[400px] focus:outline-none focus:ring-2 focus:ring-pink-200 resize-y"
                    placeholder="HTML 코드를 입력하세요..."
                    spellCheck={false}
                  />
                </div>
              )
            ) : (
              <div className="relative p-5">
                <EditorContent editor={editor} />
                <p className="absolute bottom-2 right-3 text-xs text-neutral-300 pointer-events-none select-none">
                  이미지를 여기로 드래그하거나 붙여넣기
                </p>
              </div>
            )}
          </div>
        </div>

        {showTemplatePicker && (() => {
          const tpl = DESCRIPTION_TEMPLATES.find(t => t.id === selectedTemplateId)!;
          return (
            <div className="border border-pink-200 rounded-2xl bg-white shadow-sm">
              {/* 헤더 */}
              <div className="flex items-center justify-between px-5 py-3 bg-pink-50 border-b border-pink-100 rounded-t-2xl">
                <span className="text-sm font-bold text-neutral-900">템플릿 선택</span>
                <button type="button" onClick={() => setShowTemplatePicker(false)}
                  className="text-neutral-400 hover:text-neutral-700 text-xl leading-none px-1">×</button>
              </div>

              {/* 바디 */}
              <div className="flex" style={{ height: 560 }}>
                {/* 왼쪽: 목록 */}
                <div className="w-44 flex-shrink-0 border-r border-neutral-100 p-3 flex flex-col gap-2 overflow-y-auto">
                  {DESCRIPTION_TEMPLATES.map(t => (
                    <button type="button" key={t.id}
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={cn("w-full text-left px-3 py-3 rounded-xl border transition-colors",
                        selectedTemplateId === t.id
                          ? "bg-pink-50 border-pink-300"
                          : "border-transparent hover:bg-neutral-50"
                      )}>
                      <p className={cn("text-sm font-bold", selectedTemplateId === t.id ? "text-pink-600" : "text-neutral-800")}>{t.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{t.description}</p>
                    </button>
                  ))}
                </div>

                {/* 오른쪽: 미리보기 */}
                <div className="flex-1 overflow-y-auto bg-neutral-50 p-6">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">실제 표시 모습</p>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="tiptap-content text-neutral-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: tpl.html }} />
                  </div>
                </div>
              </div>

              {/* 푸터 */}
              <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-neutral-100 rounded-b-2xl bg-neutral-50">
                <button type="button" onClick={() => setShowTemplatePicker(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
                  취소
                </button>
                <button type="button"
                  onClick={() => {
                    setRawHtml(tpl.html);
                    setHtmlMode(true);
                    setPreviewMode(false);
                    setShowTemplatePicker(false);
                  }}
                  className="px-4 py-2 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90">
                  이 템플릿 사용하기
                </button>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">가격 (원) *</label>
            <input type="number" required value={form.price}
              onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">순서</label>
            <input type="number" value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
          </div>
          <div className="flex flex-col justify-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded accent-pink-500" />
              <span className="text-sm font-medium text-neutral-700">판매 활성화</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">썸네일 URL</label>
          <input type="url" value={form.thumbnail}
            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400" />
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
          취소
        </button>
        <button type="button" onClick={handleSubmit} disabled={loading || uploading}
          className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50">
          {loading ? "저장 중..." : product ? "수정 완료" : "상품 등록"}
        </button>
      </div>

    </div>
  );
}
