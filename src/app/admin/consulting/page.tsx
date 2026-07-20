import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatKstHuman } from "@/lib/kst";
import { getConsultingPassword, currentDayIndex, CONSULTING_DURATION_DAYS } from "@/lib/consulting";
import { ConsultingSettings } from "./_components/ConsultingSettings";
import { Users, ChevronRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminConsultingPage() {
  const [enrollments, password] = await Promise.all([
    prisma.consultingEnrollment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        tasks: { select: { doneAt: true } },
      },
    }),
    getConsultingPassword(),
  ]);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-pink-500" />
        <h1 className="text-2xl font-black text-neutral-900">1:1 컨설팅</h1>
      </div>
      <p className="text-sm text-neutral-500 mb-6">
        등록일 기준 {CONSULTING_DURATION_DAYS}일(3주) 개인별 데일리 할 일 프로그램. 고객·관리자 모두 할 일을 편집할 수 있어요.
      </p>

      <ConsultingSettings initialPassword={password ?? ""} />

      <div className="mt-8">
        <h2 className="text-lg font-bold text-neutral-900 mb-3 inline-flex items-center gap-2">
          <Users className="w-4 h-4" /> 등록 고객
          <span className="text-sm font-semibold text-neutral-400">{enrollments.length}명</span>
        </h2>

        {enrollments.length === 0 ? (
          <p className="text-sm text-neutral-400 bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
            아직 등록한 고객이 없어요. 위 비밀번호를 안내하면, 로그인한 고객이 입력 후 여기에 등록됩니다.
          </p>
        ) : (
          <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
            {enrollments.map((e, i) => {
              const total = e.tasks.length;
              const done = e.tasks.filter((t) => t.doneAt).length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const dayIdx = currentDayIndex(e.startAt);
              const dayLabel =
                dayIdx < 1
                  ? "시작 전"
                  : dayIdx > CONSULTING_DURATION_DAYS
                    ? "완료"
                    : `Day ${dayIdx}`;
              return (
                <Link
                  key={e.id}
                  href={`/admin/consulting/${e.id}`}
                  className={
                    "flex items-center gap-4 px-5 py-4 hover:bg-neutral-50/70 " +
                    (i === enrollments.length - 1 ? "" : "border-b border-neutral-100")
                  }
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 truncate">
                      {e.user.name || "이름 없음"}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {e.user.email} · 시작 {formatKstHuman(e.startAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-neutral-900">{pct}%</p>
                    <p className="text-[11px] text-neutral-400">
                      {dayLabel} · {done}/{total}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
