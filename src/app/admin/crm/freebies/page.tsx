import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, BookOpen, Users, ExternalLink } from "lucide-react";
import { FreebieRowActions } from "./FreebieRowActions";

export const dynamic = "force-dynamic";

export default async function FreebiesListPage() {
  const freebies = await prisma.freebie.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">무료 자료</h1>
          <p className="text-sm text-neutral-500 mt-1">
            자료를 추가하면 신청 페이지가 자동 생성되고, 신청자에게 자료 다운로드 + 무료 라이브 안내 메일이 자동 발송됩니다.
          </p>
        </div>
        <Link
          href="/admin/crm/freebies/new"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> 새 자료
        </Link>
      </div>

      {freebies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <BookOpen className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 mb-1">아직 자료가 없습니다.</p>
          <p className="text-sm text-neutral-400 mb-5">제목과 파일만 올리면 신청 페이지가 자동 생성됩니다.</p>
          <Link href="/admin/crm/freebies/new" className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white">
            <Plus className="w-4 h-4" /> 첫 자료 만들기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {freebies.map((f) => {
            const url = `/freebie/${f.slug}`;
            return (
              <div key={f.id} className="bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {f.isActive ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">활성</span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">비활성</span>
                  )}
                  {f.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">{f.category}</span>
                  )}
                  {!f.fileUrl && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">파일 없음</span>
                  )}
                </div>
                <Link href={`/admin/crm/freebies/${f.id}/edit`} className="text-base font-bold text-neutral-900 hover:text-pink-500 mb-1">
                  {f.title}
                </Link>
                {f.subtitle && <p className="text-xs text-neutral-500 mb-2 line-clamp-1">{f.subtitle}</p>}
                <code className="block text-xs font-mono text-neutral-600 bg-neutral-50 border border-neutral-100 rounded-md px-2.5 py-1.5 mb-3 truncate">
                  {url}
                </code>
                <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                  <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {f._count.submissions}명 신청</span>
                </div>
                <div className="mt-auto flex gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-500"
                  >
                    <ExternalLink className="w-3 h-3" /> 페이지 열기
                  </a>
                  <FreebieRowActions slug={f.slug} />
                  <Link
                    href={`/admin/crm/freebies/${f.id}/edit`}
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-500"
                  >
                    편집
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
