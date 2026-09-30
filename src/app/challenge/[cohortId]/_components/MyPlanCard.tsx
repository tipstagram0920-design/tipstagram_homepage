"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Compass, Pencil } from "lucide-react";
import type { OnboardingPlan } from "@/lib/challenge-onboarding";

/**
 * 시작 전에 고른 방향을 대시보드에서 다시 보여준다.
 * 5주를 지나는 동안 "내가 뭘 하기로 했는지"를 잊는 게 가장 흔한 이탈 이유다.
 * 기본은 접힌 상태 — 매번 펼쳐 보일 만큼 중요하진 않지만, 언제든 확인은 되어야 한다.
 */
export function MyPlanCard({
  plan,
  productNote,
  redoHref,
}: {
  plan: OnboardingPlan;
  productNote?: string;
  redoHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 rounded-3xl border border-neutral-200/70 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-neutral-50/80 transition-colors"
      >
        <span className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
          <Compass className="w-4.5 h-4.5" strokeWidth={2.25} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[11px] font-bold tracking-[1.5px] uppercase text-neutral-400">
            내가 고른 방향
          </span>
          <span className="block truncate text-[15px] font-bold text-neutral-900">
            {plan.trackLabel}
            {productNote ? ` · ${productNote}` : ""}
          </span>
        </span>
        <ChevronDown
          className={
            "w-4 h-4 shrink-0 text-neutral-400 transition-transform " + (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <div className="border-t border-neutral-200/70 px-5 py-5">
          <div className="rounded-2xl bg-neutral-950 px-5 py-5 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-white/40">지금 위치</p>
            <p className="mt-2 text-[16px] font-bold leading-[1.55] [word-break:keep-all]">
              {plan.persona}
            </p>
            <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
              <p className="text-[13px] leading-[1.7] text-white/65 [word-break:keep-all]">
                {plan.stageNote}
              </p>
              <p className="text-[13px] leading-[1.7] text-white/65 [word-break:keep-all]">
                {plan.goalNote}
              </p>
            </div>
          </div>

          <ol className="mt-5 space-y-3">
            {plan.weeks.map((w) => (
              <li key={w.index} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full ig-gradient text-white text-[11px] font-black flex items-center justify-center">
                  {w.index}
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[13.5px] font-bold text-neutral-900">{w.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-[1.7] text-neutral-500 [word-break:keep-all]">
                    {w.line}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <Link
            href={redoHref}
            className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-neutral-500 hover:text-neutral-900"
          >
            <Pencil className="w-3.5 h-3.5" /> 다시 고르기
          </Link>
        </div>
      )}
    </div>
  );
}
