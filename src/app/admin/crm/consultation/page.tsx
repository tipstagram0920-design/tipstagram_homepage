import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Target, Mail, Instagram } from "lucide-react";
import { ConsultationStatusToggle } from "./ConsultationStatusToggle";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  pending: { label: "대기", tone: "bg-neutral-100 text-neutral-600" },
  selected: { label: "선정", tone: "bg-emerald-50 text-emerald-600" },
  done: { label: "진행완료", tone: "bg-blue-50 text-blue-600" },
  rejected: { label: "제외", tone: "bg-red-50 text-red-500" },
};

export default async function ConsultationListPage() {
  const [total, selected, done, requests] = await Promise.all([
    prisma.consultationRequest.count(),
    prisma.consultationRequest.count({ where: { status: "selected" } }),
    prisma.consultationRequest.count({ where: { status: "done" } }),
    prisma.consultationRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { contact: { select: { id: true } } },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-neutral-900">진단 세션 신청</h1>
        <p className="text-sm text-neutral-500 mt-1">무료 라이브 1:1 진단 세션 신청자 목록</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard label="전체 신청" value={total} icon={Target} tone="from-pink-500 to-orange-400" />
        <KpiCard label="선정" value={selected} icon={Mail} tone="from-emerald-500 to-cyan-500" />
        <KpiCard label="진행 완료" value={done} icon={Instagram} tone="from-blue-500 to-violet-500" />
      </div>

      {/* 리스트 */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        {requests.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-neutral-400">아직 신청이 없습니다.</div>
        ) : (
          requests.map((r) => {
            const status = STATUS_LABEL[r.status] ?? STATUS_LABEL.pending;
            return (
              <div key={r.id} className="border-b border-neutral-50 last:border-0 p-5 hover:bg-neutral-50/50">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full ig-gradient flex items-center justify-center text-white font-bold shrink-0">
                    {r.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {r.contact ? (
                        <Link href={`/admin/crm/contacts/${r.contact.id}`} className="font-bold text-neutral-900 hover:text-pink-500">
                          {r.name}
                        </Link>
                      ) : (
                        <span className="font-bold text-neutral-900">{r.name}</span>
                      )}
                      <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + status.tone}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{r.email}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600 mt-1.5">
                      {r.phone && <span>📞 {r.phone}</span>}
                      {r.instagramHandle && <span>📷 {r.instagramHandle}</span>}
                      {r.followerCount && <span>팔로워 {r.followerCount}</span>}
                      <span className="text-neutral-400">신청 {formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                  <ConsultationStatusToggle id={r.id} current={r.status} />
                </div>
                <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 mt-3 text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {r.painPoint}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-neutral-500">{label}</p>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tone} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-2xl font-black text-neutral-900">{value.toLocaleString()}</div>
    </div>
  );
}
