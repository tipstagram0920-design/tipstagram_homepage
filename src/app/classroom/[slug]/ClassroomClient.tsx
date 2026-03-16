"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  vimeoId?: string | null;
  duration?: number | null;
  order: number;
  isFree: boolean;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Product {
  id: string;
  title: string;
  thumbnail?: string | null;
  course?: {
    sections: Section[];
  } | null;
}

interface ClassroomClientProps {
  product: Product;
  progressMap: Record<string, boolean>;
  userId: string;
}

export function ClassroomClient({ product, progressMap: initialProgress, userId }: ClassroomClientProps) {
  const sections = product.course?.sections || [];
  const allLessons = sections.flatMap((s) => s.lessons);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(allLessons[0] || null);
  const [progressMap, setProgressMap] = useState(initialProgress);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(sections.map((s) => s.id)));

  const completedCount = Object.values(progressMap).filter(Boolean).length;
  const totalCount = allLessons.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markComplete = async (lessonId: string) => {
    const completed = !progressMap[lessonId];
    setProgressMap((prev) => ({ ...prev, [lessonId]: completed }));

    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed }),
    }).catch(console.error);

    // Auto-advance to next lesson
    if (completed) {
      const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
      if (currentIdx < allLessons.length - 1) {
        setCurrentLesson(allLessons[currentIdx + 1]);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 pt-16">
      {/* Video area */}
      <div className="flex-1 bg-neutral-950 flex flex-col">
        {/* Video */}
        <div className="relative aspect-video bg-black">
          {currentLesson?.vimeoId ? (
            <iframe
              key={currentLesson.id}
              src={`https://player.vimeo.com/video/${currentLesson.vimeoId}?autoplay=1&color=e1306c&title=0&byline=0&portrait=0`}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">강의를 선택하세요</p>
              </div>
            </div>
          )}
        </div>

        {/* Lesson info */}
        {currentLesson && (
          <div className="p-5 border-t border-neutral-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-white font-bold text-lg">{currentLesson.title}</h2>
                <p className="text-neutral-400 text-sm mt-1">{product.title}</p>
              </div>
              <button
                onClick={() => markComplete(currentLesson.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shrink-0 transition-colors",
                  progressMap[currentLesson.id]
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                {progressMap[currentLesson.id]
                  ? <><CheckCircle2 className="w-4 h-4" /> 완료됨</>
                  : <><Circle className="w-4 h-4" /> 완료 표시</>
                }
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                <span>전체 진행률</span>
                <span>{completedCount}/{totalCount} 강 · {progress}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full ig-gradient rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar: curriculum */}
      <div className="w-full lg:w-80 xl:w-96 bg-white border-l border-neutral-100 overflow-y-auto lg:h-[calc(100vh-64px)] lg:sticky lg:top-16">
        <div className="p-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-neutral-900">커리큘럼</h3>
          <p className="text-xs text-neutral-400 mt-0.5">{completedCount}/{totalCount} 강 완료</p>
        </div>

        <div className="divide-y divide-neutral-100">
          {sections.map((section) => {
            const sectionCompleted = section.lessons.filter((l) => progressMap[l.id]).length;
            return (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{section.title}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{sectionCompleted}/{section.lessons.length} 완료</p>
                  </div>
                  {openSections.has(section.id)
                    ? <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />}
                </button>

                {openSections.has(section.id) && (
                  <div className="bg-neutral-50">
                    {section.lessons.map((lesson) => {
                      const isActive = currentLesson?.id === lesson.id;
                      const isDone = progressMap[lesson.id];
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2",
                            isActive
                              ? "bg-pink-50 border-l-pink-500"
                              : "border-l-transparent hover:bg-neutral-100"
                          )}
                        >
                          <div className="shrink-0">
                            {isDone
                              ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                              : <Circle className={cn("w-4 h-4", isActive ? "text-pink-500" : "text-neutral-300")} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm line-clamp-2",
                              isActive ? "font-semibold text-pink-600" : "text-neutral-700"
                            )}>
                              {lesson.title}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
