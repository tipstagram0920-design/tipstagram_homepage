"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function extractVimeoId(input: string): string {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : trimmed;
}

function VimeoPreview({ vimeoId }: { vimeoId: string }) {
  const id = extractVimeoId(vimeoId);
  if (!id || !/^\d+$/.test(id)) return null;
  return (
    <div className="mt-2 rounded-xl overflow-hidden bg-black aspect-video">
      <iframe
        src={`https://player.vimeo.com/video/${id}?badge=0&autopause=0`}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

interface LessonInput {
  id?: string;
  title: string;
  vimeoId: string;
  duration: string;
  isFree: boolean;
  order: number;
}

interface SectionInput {
  id?: string;
  title: string;
  order: number;
  lessons: LessonInput[];
  isOpen?: boolean;
}

interface CourseBuilderProps {
  product: {
    id: string;
    title: string;
    course?: {
      id: string;
      title: string;
      sections: {
        id: string;
        title: string;
        order: number;
        lessons: {
          id: string;
          title: string;
          vimeoId?: string | null;
          duration?: number | null;
          isFree: boolean;
          order: number;
        }[];
      }[];
    } | null;
  };
}

export function CourseBuilder({ product }: CourseBuilderProps) {
  const router = useRouter();
  const [courseTitle, setCourseTitle] = useState(product.course?.title || product.title);
  const [sections, setSections] = useState<SectionInput[]>(
    product.course?.sections.map((s) => ({
      id: s.id,
      title: s.title,
      order: s.order,
      isOpen: true,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        vimeoId: l.vimeoId || "",
        duration: l.duration?.toString() || "",
        isFree: l.isFree,
        order: l.order,
      })),
    })) || []
  );
  const [loading, setLoading] = useState(false);

  const addSection = () => {
    setSections([...sections, { title: "", order: sections.length, lessons: [], isOpen: true }]);
  };

  const removeSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const updateSection = (idx: number, title: string) => {
    setSections(sections.map((s, i) => (i === idx ? { ...s, title } : s)));
  };

  const toggleSection = (idx: number) => {
    setSections(sections.map((s, i) => (i === idx ? { ...s, isOpen: !s.isOpen } : s)));
  };

  const addLesson = (sIdx: number) => {
    setSections(sections.map((s, i) =>
      i === sIdx
        ? { ...s, lessons: [...s.lessons, { title: "", vimeoId: "", duration: "", isFree: false, order: s.lessons.length }] }
        : s
    ));
  };

  const removeLesson = (sIdx: number, lIdx: number) => {
    setSections(sections.map((s, i) =>
      i === sIdx ? { ...s, lessons: s.lessons.filter((_, j) => j !== lIdx) } : s
    ));
  };

  const updateLesson = (sIdx: number, lIdx: number, field: keyof LessonInput, value: string | boolean) => {
    setSections(sections.map((s, i) =>
      i === sIdx
        ? {
            ...s, lessons: s.lessons.map((l, j) => {
              if (j !== lIdx) return l;
              if (field === "vimeoId" && typeof value === "string") {
                return { ...l, vimeoId: extractVimeoId(value) };
              }
              return { ...l, [field]: value };
            })
          }
        : s
    ));
  };

  const [previewOpen, setPreviewOpen] = useState<Record<string, boolean>>({});

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        productId: product.id,
        title: courseTitle,
        sections: sections.map((s, si) => ({
          title: s.title,
          order: si,
          lessons: s.lessons.map((l, li) => ({
            title: l.title,
            vimeoId: l.vimeoId || null,
            duration: l.duration ? parseInt(l.duration) : null,
            isFree: l.isFree,
            order: li,
          })),
        })),
      };

      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("저장 실패");
      router.push("/admin/courses");
      router.refresh();
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      {/* Course title */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5">
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">강의 제목</label>
        <input
          type="text"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
        />
      </div>

      {/* Sections */}
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 bg-neutral-50">
            <GripVertical className="w-4 h-4 text-neutral-300 shrink-0" />
            <input
              type="text"
              value={section.title}
              onChange={(e) => updateSection(sIdx, e.target.value)}
              placeholder={`섹션 ${sIdx + 1} 제목`}
              className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-medium focus:outline-none focus:border-pink-400"
            />
            <button onClick={() => toggleSection(sIdx)} className="p-1.5 hover:bg-neutral-200 rounded-lg">
              {section.isOpen ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>
            <button onClick={() => removeSection(sIdx)} className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-300 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Lessons */}
          {section.isOpen && (
            <div className="p-4 space-y-3">
              {section.lessons.map((lesson, lIdx) => (
                <div key={lIdx} className="border border-neutral-100 rounded-xl p-4 space-y-3 bg-neutral-50">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-neutral-300 shrink-0" />
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => updateLesson(sIdx, lIdx, "title", e.target.value)}
                      placeholder="강의 제목"
                      className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
                    />
                    <button onClick={() => removeLesson(sIdx, lIdx)} className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-300 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pl-6 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs text-neutral-500 mb-1">Vimeo URL 또는 ID</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={lesson.vimeoId}
                            onChange={(e) => updateLesson(sIdx, lIdx, "vimeoId", e.target.value)}
                            placeholder="https://vimeo.com/123456789 또는 123456789"
                            className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:border-pink-400"
                          />
                          {lesson.vimeoId && /^\d+$/.test(lesson.vimeoId) && (
                            <button
                              type="button"
                              onClick={() => {
                                const key = `${sIdx}-${lIdx}`;
                                setPreviewOpen((prev) => ({ ...prev, [key]: !prev[key] }));
                              }}
                              className={cn(
                                "px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1",
                                previewOpen[`${sIdx}-${lIdx}`]
                                  ? "border-pink-300 bg-pink-50 text-pink-600"
                                  : "border-neutral-200 text-neutral-500 hover:border-pink-300 hover:text-pink-500"
                              )}
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              미리보기
                            </button>
                          )}
                        </div>
                        {previewOpen[`${sIdx}-${lIdx}`] && (
                          <VimeoPreview vimeoId={lesson.vimeoId} />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">재생 시간 (초)</label>
                        <input
                          type="number"
                          value={lesson.duration}
                          onChange={(e) => updateLesson(sIdx, lIdx, "duration", e.target.value)}
                          placeholder="300"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:border-pink-400"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lesson.isFree}
                        onChange={(e) => updateLesson(sIdx, lIdx, "isFree", e.target.checked)}
                        className="w-3.5 h-3.5 accent-pink-500"
                      />
                      <span className="text-xs text-neutral-600">무료 공개</span>
                    </label>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addLesson(sIdx)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-neutral-200 text-sm text-neutral-400 hover:border-pink-300 hover:text-pink-500 transition-colors"
              >
                <Plus className="w-4 h-4" /> 강의 추가
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add section */}
      <button
        onClick={addSection}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-neutral-200 text-sm text-neutral-400 hover:border-pink-300 hover:text-pink-500 transition-colors"
      >
        <Plus className="w-4 h-4" /> 섹션 추가
      </button>

      {/* Save */}
      <div className="flex justify-end gap-3">
        <button onClick={() => router.back()} className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "저장 중..." : "커리큘럼 저장"}
        </button>
      </div>
    </div>
  );
}
