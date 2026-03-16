"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem { q: string; a: string; }

const defaultFaqs: FaqItem[] = [
  { q: "인스타그램을 잘 모르는데 괜찮을까요?", a: "네! 인스타그램 왕초보를 위해 입문 강의부터 차근차근 준비했습니다. 인스타그램의 기본적인 기능조차 잘 모르는 분들을 위해 입문부터 꼼꼼하게 준비했습니다." },
  { q: "수강 후 즉시 적용 가능할까요?", a: "네! 가능합니다. 강의의 내용이 실전 중심이라 수강 후 나의 브랜드에 바로 적용하실 수 있습니다. 가장 중요한 건 실행이에요!" },
  { q: "수업이 끝나도 질문을 할 수 있을까요?", a: "네! 물론입니다. 수강생 카톡방을 통해 궁금한 점은 언제든지 여쭤보세요! 함께 성장하는 커뮤니티가 항상 열려 있습니다." },
  { q: "VOD 강의의 영구 소장이 가능한가요?", a: "VOD 강의의 유효 기간은 개강일 기준 4개월입니다. 4개월이 지난 이후에는 강의 시청이 불가하니 반드시 기간 내 완강해 주세요. 새로운 업데이트가 될 때마다 기존 수강생들에게 새로운 강의 링크를 오픈해드립니다." },
  { q: "VOD 강의는 언제부터 시청이 가능한가요?", a: "VOD 강의는 구매 후 바로 시청이 가능합니다. 수강 기간은 4개월입니다." },
  { q: "수강 신청했습니다. 이제 어떻게 하나요?", a: "① 안내 메일 확인: 수강 신청 시 작성하신 이메일로 안내 메일이 발송됩니다.\n② 수강생 카톡방 입장: 안내 메일에 포함된 링크를 통해 오픈채팅방에 입장해주세요.\n③ 동영상 강의 수강: 해당 강의를 수강해주세요.\n④ 라이브 강의 참여: 매주 일요일 수강생 전용 라이브에 참여하세요.\n⑤ 틸스 20일 챌린지 참여: 매달 첫째 주부터 진행되는 20일 챌린지에 참여해주세요." },
];

function FaqAccordion({ q, a }: FaqItem) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border border-neutral-100 rounded-2xl overflow-hidden transition-all duration-200", open && "border-pink-200 shadow-sm")}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-neutral-50 transition-colors">
        <span className="font-semibold text-neutral-900 text-base">Q. {q}</span>
        <ChevronDown className={cn("w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200", open && "rotate-180 text-pink-500")} />
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-neutral-100">
          <p className="text-neutral-600 text-sm leading-relaxed pt-4" style={{ whiteSpace: "pre-line" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export function FaqSection({ faqs = defaultFaqs }: { faqs?: FaqItem[] }) {
  return (
    <section className="py-24 px-4 sm:px-6 bg-neutral-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold mb-5">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">자주 묻는 질문</h2>
          <p className="mt-4 text-neutral-500 text-base">궁금한 점이 있으시면 언제든지 문의해 주세요</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => <FaqAccordion key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
        <div className="mt-10 text-center text-sm text-neutral-400">
          더 궁금한 점이 있으신가요?{" "}
          <a href="mailto:hognyt@naver.com" className="text-pink-500 font-semibold hover:text-pink-600 transition-colors">이메일로 문의하기</a>
        </div>
      </div>
    </section>
  );
}
