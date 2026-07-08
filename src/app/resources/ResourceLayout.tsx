"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { COMPANY } from "@/lib/company";

export function ResourceLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-[11px] font-semibold text-neutral-500">RESOURCE</span>
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-pink-300 hover:text-pink-600 print:hidden"
            suppressHydrationWarning
          >
            인쇄 · PDF 저장
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 h-1.5 rounded-full ig-gradient" />
        <p className="text-xs font-bold tracking-[2px] text-pink-600 uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-[15px] text-neutral-600">{subtitle}</p>

        <div className="mt-10 space-y-8">{children}</div>

        <div className="mt-16 border-t border-neutral-200 pt-8 text-center">
          <p className="text-xs text-neutral-500">
            본 자료는 {COMPANY.serviceName} 강의 인증 신청자에게 자동 발송된 자료입니다.
          </p>
          <p className="mt-1 text-xs text-neutral-400">문의 · {COMPANY.email}</p>
        </div>
      </main>
    </div>
  );
}

export function ResourceCard({
  index,
  title,
  children,
}: {
  index?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
      <div className="mb-3 flex items-baseline gap-3">
        {index && (
          <span className="ig-gradient-text text-2xl font-black tabular-nums">{index}</span>
        )}
        <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
      </div>
      <div className="space-y-3 text-[15px] leading-relaxed text-neutral-700">{children}</div>
    </section>
  );
}
