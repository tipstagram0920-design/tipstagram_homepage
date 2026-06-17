import { prisma } from "@/lib/prisma";
import { PagesManageClient } from "./PagesManageClient";
import { StaticPagesList } from "./StaticPagesList";
import { STATIC_PAGES } from "@/lib/static-pages";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-neutral-900">페이지 관리</h1>
        <p className="text-sm text-neutral-500 mt-1">
          홈페이지의 모든 페이지를 한 곳에서 확인합니다. 코드 페이지는 보기 전용, 동적 페이지(아래)는 직접 만들고 편집할 수 있어요.
        </p>
      </div>

      {/* 정적 페이지 (코드 기반) */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">코드 페이지 ({STATIC_PAGES.length})</h2>
          <p className="text-xs text-neutral-500">소스코드에 정의된 페이지 · 어드민 편집 불가 · 새 탭 미리보기 가능</p>
        </div>
        <StaticPagesList pages={STATIC_PAGES} />
      </section>

      {/* 동적 페이지 (DB 기반) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">동적 페이지 ({pages.length})</h2>
          <p className="text-xs text-neutral-500">DB에 저장되는 페이지 · 어드민에서 자유롭게 생성·편집</p>
        </div>
        <PagesManageClient pages={pages} />
      </section>
    </div>
  );
}
