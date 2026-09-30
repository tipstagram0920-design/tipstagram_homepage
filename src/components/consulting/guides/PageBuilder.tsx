"use client";

import { useMemo, useState } from "react";
import {
  useGuideSave,
  useGuideAutosave,
  AutosaveStatus,
  FeedbackButton,
  FeedbackBox,
  CopyButton,
  StepHeader,
  FIELD,
  FIELD_TA,
  FLABEL,
} from "./common";
import { Loader2, Sparkles, Wand2, Link2, ArrowRight } from "lucide-react";
import { pageCopyToText, deliverableToText } from "@/lib/consulting-guide-data";
import type { GuideContext, PageBuilderData, PageCopy } from "@/lib/consulting-guide-data";
import type { PageKind } from "@/lib/consulting-page-ai";

export interface PageField {
  key: string;
  label: string;
  help?: string;
  placeholder?: string;
  rows?: number;
  optional?: boolean;
}

/**
 * 무료자료·후기·FAQ 페이지 숙제가 함께 쓰는 뼈대.
 * "질문 채우기 → 페이지 글 만들기 → 만든 페이지 주소 입력" 세 단계가 전부 같아서 여기로 모았다.
 * 주소(url)는 다음 숙제(인포크 링크)가 그대로 물어간다.
 */
export function PageBuilder({
  taskId,
  kind,
  fields,
  data,
  onChange,
  context,
  next,
  intro,
  generateLabel,
  urlLabel,
  urlHelp,
  stepOffset = 1,
  children,
}: {
  taskId: string;
  kind: PageKind;
  fields: PageField[];
  data: PageBuilderData;
  onChange: (next: PageBuilderData) => void;
  context?: GuideContext | null;
  next?: { id: string; title: string; day: number } | null;
  /** 맨 위 한 줄 안내 */
  intro: string;
  generateLabel: string;
  urlLabel: string;
  urlHelp: string;
  /** 유형 선택처럼 앞에 단계가 하나 더 있는 숙제는 2를 넘긴다 */
  stepOffset?: number;
  /** 질문 칸 위에 끼워 넣을 것 (유형 선택 등) */
  children?: React.ReactNode;
}) {
  const { saving, saved, save } = useGuideSave(taskId);
  const auto = useGuideAutosave(taskId, data);

  const values = useMemo(() => data.fields ?? {}, [data.fields]);
  const copy = data.copy ?? null;
  const [generating, setGenerating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [show, setShow] = useState(Boolean(data.copy));

  const setField = (key: string, v: string) =>
    onChange({ ...data, fields: { ...values, [key]: v } });

  const filledCount = fields.filter((f) => (values[f.key] || "").trim()).length;
  const requiredCount = fields.filter((f) => !f.optional).length;

  // 확정 프로필 3줄 — 같은 목소리로 쓰라고 위에 띄워둔다
  const profileLines = (context?.customer?.finalLines ?? [])
    .map((l) => (l ?? "").trim())
    .filter(Boolean);

  // AI가 안 될 때 보여줄 폴백 (입력값을 라벨과 함께 이어붙인 것)
  const fallbackText = fields
    .map((f) => {
      const v = (values[f.key] || "").trim();
      return v ? `【 ${f.label} 】\n${v}` : "";
    })
    .filter(Boolean)
    .join("\n\n");

  const generate = async () => {
    save(data);
    setShow(true);
    setGenerating(true);
    setFailed(false);
    try {
      const answers = fields.map((f) => ({ label: f.label, value: values[f.key] ?? "" }));
      const res = await fetch("/api/consulting/page-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, kind, answers }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.copy) {
        const c = json.copy as PageCopy;
        const nextData: PageBuilderData = { ...data, copy: c };
        onChange(nextData);
        save(nextData);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setGenerating(false);
    }
  };

  const pageText = copy ? pageCopyToText(copy) : fallbackText;
  const dText = copy ? deliverableToText(copy) : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] text-neutral-500 leading-5 flex-1">{intro}</p>
        <AutosaveStatus saving={auto.saving} saved={auto.saved} />
      </div>

      {profileLines.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
          <p className="text-[12px] font-bold text-emerald-700 mb-1.5">앞 숙제에서 확정한 내 프로필</p>
          <div className="space-y-0.5 text-[13px] leading-6 text-emerald-900/85">
            {profileLines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
          <p className="mt-1.5 text-[11.5px] text-emerald-900/60">
            이 페이지도 같은 목소리로 씁니다.
          </p>
        </div>
      )}

      {children}

      <StepHeader
        n={stepOffset}
        title="질문에 답하기"
        desc={`없는 건 비워두세요. 지어내면 오히려 안 팔립니다. (${filledCount}/${fields.length})`}
        done={filledCount >= Math.max(2, Math.ceil(requiredCount * 0.6))}
      />

      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className={FLABEL}>
              {f.label}
              {f.optional && <span className="text-neutral-400 font-normal"> (선택)</span>}
            </label>
            {f.help && <p className="text-[12px] text-neutral-500 mb-1.5 leading-5">{f.help}</p>}
            <textarea
              value={values[f.key] ?? ""}
              onChange={(e) => setField(f.key, e.target.value)}
              rows={f.rows ?? 2}
              placeholder={f.placeholder}
              className={FIELD_TA}
            />
          </div>
        ))}
      </div>

      <StepHeader
        n={stepOffset + 1}
        title="페이지 글 만들기"
        desc="채운 내용만 가지고 페이지에 붙일 글을 씁니다."
        done={Boolean(copy)}
      />

      <FeedbackButton onClick={generate} saving={saving} saved={saved} label={generateLabel} />

      {show && (
        <FeedbackBox>
          {generating ? (
            <div className="flex items-center gap-2 py-6 justify-center text-[13px] font-semibold text-neutral-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              입력하신 내용으로 페이지 글을 쓰는 중이에요… (20~30초쯤 걸려요)
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700">
                  <Wand2 className="w-3.5 h-3.5" /> 완성된 페이지 글
                </p>
                {pageText && <CopyButton text={pageText} label="페이지 글 복사" />}
              </div>

              {copy && (
                <p className="mb-2 inline-flex items-center gap-1 text-[11px] font-bold text-pink-600">
                  <Sparkles className="w-3 h-3" /> 입력하신 내용을 실제로 읽고 쓴 글이에요
                </p>
              )}
              {failed && (
                <p className="text-[12px] text-amber-600 mb-2">
                  지금은 자동 작성이 안 돼서, 입력하신 내용을 순서대로 모아 보여드려요. 잠시 뒤 다시 눌러보세요.
                </p>
              )}

              {copy ? (
                <div className="space-y-2.5">
                  <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
                    <p className="text-[16px] font-black leading-7 text-neutral-900">{copy.headline}</p>
                    {copy.subheadline && (
                      <p className="mt-1 text-[13px] leading-6 text-neutral-500">{copy.subheadline}</p>
                    )}
                  </div>
                  {copy.sections.map((s, i) => (
                    <div key={i} className="rounded-lg border border-neutral-200 bg-white p-3.5">
                      <p className="text-[13px] font-bold text-neutral-900">{s.heading}</p>
                      <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-6 text-neutral-700">
                        {s.body}
                      </p>
                    </div>
                  ))}
                  {copy.ctaLine && (
                    <div className="rounded-lg ig-gradient p-3.5 text-center">
                      <p className="text-[14px] font-black text-white">{copy.ctaLine}</p>
                    </div>
                  )}

                  {/* 페이지 글과 별개로 나오는 결과물 (자료 목차·체험 순서·참여 방법) */}
                  {copy.deliverable && copy.deliverable.items.length > 0 && (
                    <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-3.5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-[13px] font-bold text-indigo-800">
                          {copy.deliverable.title || "함께 만들어야 할 것"}
                        </p>
                        {dText && <CopyButton text={dText} label="이것만 복사" />}
                      </div>
                      <div className="space-y-2">
                        {copy.deliverable.items.map((it, i) => (
                          <div key={i} className="rounded-lg border border-indigo-200 bg-white p-3">
                            <p className="text-[12.5px] font-bold text-neutral-900">{it.heading}</p>
                            <p className="mt-1 whitespace-pre-wrap text-[12.5px] leading-6 text-neutral-700">
                              {it.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {copy.tips.length > 0 && (
                    <div className="rounded-xl border border-pink-200 bg-pink-50 p-3">
                      <p className="text-[12px] font-bold text-pink-700 mb-1.5">더 좋아지려면</p>
                      <ul className="list-disc space-y-1 pl-4 text-[12px] leading-5 text-pink-700/90">
                        {copy.tips.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : fallbackText ? (
                <div className="rounded-lg border border-neutral-200 bg-white p-3 text-[13px] text-neutral-900 whitespace-pre-wrap leading-relaxed">
                  {fallbackText}
                </div>
              ) : (
                <p className="text-xs text-neutral-400">위 항목을 채우면 여기에 글이 만들어져요.</p>
              )}
            </>
          )}
        </FeedbackBox>
      )}

      {/* 만든 페이지 주소 — 다음 숙제(인포크)가 그대로 물어간다 */}
      <StepHeader
        n={stepOffset + 2}
        title="만든 페이지 주소 넣기"
        desc="이 주소가 인포크 링크 숙제에 자동으로 들어갑니다."
        done={Boolean((data.url ?? "").trim())}
      />

      <div className="rounded-xl border border-neutral-200 bg-white p-3.5">
        <label className={FLABEL}>
          <span className="inline-flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-neutral-400" /> {urlLabel}
          </span>
        </label>
        <p className="text-[12px] text-neutral-500 mb-1.5 leading-5">{urlHelp}</p>
        <input
          type="url"
          value={data.url ?? ""}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="https://..."
          className={FIELD}
        />
      </div>

      {next && (
        <a
          href={`/consulting/${next.id}`}
          className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-3 hover:border-neutral-400"
        >
          <span className="min-w-0">
            <span className="block text-[11px] font-bold text-neutral-400">다음 숙제 · Day {next.day}</span>
            <span className="block truncate text-[13.5px] font-bold text-neutral-900">{next.title}</span>
          </span>
          <ArrowRight className="w-4 h-4 shrink-0 text-neutral-400" />
        </a>
      )}
    </div>
  );
}
