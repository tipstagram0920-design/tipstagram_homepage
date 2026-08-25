import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { liveSchedule, formatLive, daysUntil } from "@/lib/challenge-schedule";
import {
  MessageCircle,
  Video,
  MapPin,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  PenLine,
  MessageSquareText,
} from "lucide-react";

export interface StartGuideCohort {
  id: string;
  name: string;
  week1StartAt: Date;
  openChatUrl: string | null;
  weeks: { weekIndex: number; openAt: Date; liveAt: Date | null; homeworkDueAt: Date }[];
}

/** 기수 시작 안내 화면(표현 전용). 접근 권한·데이터 조회는 page.tsx 가 맡는다. */
export function StartGuide({ cohort }: { cohort: StartGuideCohort }) {
  const sessions = liveSchedule(cohort.weeks);
  const dday = daysUntil(cohort.week1StartAt);
  const dueByWeek = new Map(cohort.weeks.map((w) => [w.weekIndex, w.homeworkDueAt]));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* 헤더 */}
          <p className="text-[11px] font-bold tracking-[2px] text-pink-600 uppercase">
            {cohort.name}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            5주 챌린지 시작 안내
          </h1>
          <p className="mt-3 text-neutral-600 leading-relaxed">
            결제해 주셔서 고맙습니다. 아래 내용만 확인하시면 준비는 끝납니다.
          </p>

          <div className="mt-6 rounded-3xl bg-neutral-950 text-white px-6 py-6">
            <p className="text-[11px] font-bold tracking-[2px] uppercase text-white/50">시작일</p>
            <p className="mt-2 text-2xl font-black">
              {formatLive(sessions[0]?.at ?? cohort.week1StartAt)}
            </p>
            <p className="mt-2 text-sm text-white/60">
              {dday > 0
                ? `첫 라이브까지 ${dday}일 남았습니다.`
                : dday === 0
                  ? "오늘 첫 라이브가 있습니다."
                  : "이미 시작된 기수입니다."}
            </p>
          </div>

          {/* STEP 1 — 오픈채팅방 */}
          {cohort.openChatUrl && (
            <section className="mt-10">
              <h2 className="text-lg font-black text-neutral-900">
                <span className="text-pink-600">STEP 1.</span> 지금 오픈채팅방에 들어와 주세요
              </h2>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                공지·라이브 링크·질문은 전부 이 방에서 오갑니다. 들어와 계시지 않으면 안내를 놓치게
                됩니다. 이 기수 전용 방이라 지금 바로 입장해 주세요.
              </p>
              <a
                href={cohort.openChatUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center gap-4 rounded-3xl bg-[#FEE500] px-5 py-4 hover:brightness-95 transition"
              >
                <span className="shrink-0 w-11 h-11 rounded-2xl bg-black/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#3C1E1E]" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-black text-[#3C1E1E]">
                    오픈채팅방 입장하기
                  </span>
                  <span className="block text-[12px] text-[#3C1E1E]/70 mt-0.5">
                    입장 후 실명(신청하신 이름)으로 닉네임을 바꿔 주세요.
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 shrink-0 text-[#3C1E1E]" />
              </a>
            </section>
          )}

          {/* STEP 2 — 일정 */}
          <section className="mt-10">
            <h2 className="text-lg font-black text-neutral-900">
              <span className="text-pink-600">STEP 2.</span> 5주 일정을 달력에 넣어 주세요
            </h2>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              라이브는 실시간 참여가 원칙입니다. 부득이하게 못 오시면 녹화본을 올려 드리지만,
              질문하고 바로 답을 듣는 자리가 가장 크게 남습니다.
            </p>

            <ul className="mt-4 space-y-2">
              {sessions.map((s) => {
                const due = dueByWeek.get(s.weekIndex);
                return (
                  <li
                    key={s.weekIndex}
                    className="rounded-2xl border border-neutral-200 bg-white px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                          s.offline ? "bg-amber-100 text-amber-700" : "bg-pink-50 text-pink-600"
                        }`}
                      >
                        {s.offline ? <MapPin className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
                          Week {s.weekIndex}
                        </p>
                        <p className="text-[15px] font-bold text-neutral-900">
                          {formatLive(s.at, s.tbd)}
                          {s.offline && (
                            <span className="ml-2 text-[12px] font-bold text-amber-700">
                              오프라인 1:1 진단
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 pl-12 text-[13px] text-neutral-500 leading-relaxed">
                      {s.offline
                        ? "서울에서 1인당 20분씩 직접 뵙습니다. 시간과 장소는 오픈채팅방에서 추후 공지합니다."
                        : "온라인 라이브 (참여 링크는 오픈채팅방에 올라갑니다)"}
                      {due && (
                        <>
                          {" · "}
                          숙제 마감 {formatLive(due)}
                        </>
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* STEP 3 — 진행 방식 */}
          <section className="mt-10">
            <h2 className="text-lg font-black text-neutral-900">
              <span className="text-pink-600">STEP 3.</span> 매주 이렇게 굴러갑니다
            </h2>
            <ol className="mt-4 space-y-3">
              {[
                {
                  icon: CalendarDays,
                  title: "주차가 열립니다",
                  body: "매주 그 주의 강의·자료·숙제가 대시보드에 열립니다. 열리면 오픈채팅방으로 알려 드립니다.",
                },
                {
                  icon: Video,
                  title: "라이브에 참여합니다",
                  body: "위 일정대로 진행합니다. 그 주에 무엇을 왜 하는지 짚어 드리고, 질문을 그 자리에서 받습니다.",
                },
                {
                  icon: PenLine,
                  title: "숙제를 제출합니다",
                  body: "대시보드에서 그 주 숙제를 제출합니다. 마감 전이면 몇 번이든 고쳐 낼 수 있습니다.",
                },
                {
                  icon: MessageSquareText,
                  title: "1:1 피드백을 받습니다",
                  body: "마감 후 제출물을 하나씩 보고 개별 피드백을 드립니다. 대시보드에서 확인하실 수 있습니다.",
                },
              ].map((step) => (
                <li key={step.title} className="flex gap-4">
                  <span className="shrink-0 w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                    <step.icon className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-[15px] font-bold text-neutral-900">{step.title}</p>
                    <p className="mt-1 text-[13px] text-neutral-600 leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* STEP 4 — 준비 */}
          <section className="mt-10">
            <h2 className="text-lg font-black text-neutral-900">
              <span className="text-pink-600">STEP 4.</span> 시작 전에 준비해 주세요
            </h2>
            <ul className="mt-4 space-y-2.5">
              {[
                "오픈채팅방 입장 후 닉네임을 신청하신 이름으로 변경",
                "위 라이브 일정 5개를 달력에 등록 (3주차는 토요일입니다)",
                "운영할 인스타그램 계정 준비 — 없으시면 만들어 오세요",
                "1주차 라이브 전까지 계정 현황(팔로워·주제·최근 게시물)을 한 번 정리",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[14px] text-neutral-700">
                  <CheckCircle2 className="w-[18px] h-[18px] text-pink-500 mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <Link
            href={`/challenge/${cohort.id}`}
            className="mt-10 flex items-center justify-center gap-2 rounded-2xl ig-gradient text-white font-bold py-4 hover:opacity-90 transition"
          >
            챌린지 대시보드 열기 <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="mt-6 text-center text-[13px] text-neutral-500">
            궁금한 점은 오픈채팅방에 남겨 주세요. 가장 빠르게 답해 드립니다.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
