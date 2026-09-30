"use client";

import { useState } from "react";
import { PageBuilder, type PageField } from "./PageBuilder";
import { StepHeader } from "./common";
import { FileText, Ticket, PartyPopper, Check } from "lucide-react";
import type { FreebieKind, GuideContext, PageBuilderData } from "@/lib/consulting-guide-data";

/**
 * 인포크 첫 번째 버튼에 들어갈 페이지.
 * 무료자료 · 무료체험 · 이벤트 중 하나를 먼저 고르고, 고른 것에 맞는 질문을 받는다.
 * (첫 버튼은 "사게 하는 곳"이 아니라 "연락처를 남기게 하는 곳"이라 세 갈래가 전부 성립한다)
 */
const KINDS: {
  key: FreebieKind;
  icon: typeof FileText;
  title: string;
  desc: string;
  examples: string;
}[] = [
  {
    key: "freebie",
    icon: FileText,
    title: "무료 자료",
    desc: "받아 갈 수 있는 자료를 줍니다",
    examples: "체크리스트 · 템플릿 · PDF 가이드 · 전자책",
  },
  {
    key: "trial",
    icon: Ticket,
    title: "무료 체험",
    desc: "한 번 겪어보게 합니다",
    examples: "1회 체험 수업 · 무료 상담 · 무료 진단",
  },
  {
    key: "event",
    icon: PartyPopper,
    title: "이벤트",
    desc: "지금 참여할 이유를 줍니다",
    examples: "오픈 기념 할인 · 챌린지 · 경품 · 선착순",
  },
];

const FIELDS: Record<FreebieKind, PageField[]> = {
  freebie: [
    {
      key: "what",
      label: "어떤 자료를 나눠주실 건가요?",
      help: "소비자 문제 하나를 딱 풀어주는 자료가 가장 좋습니다. 크게 만들 필요 없어요.",
      placeholder: "예: 앉아서 하는 3분 허리 스트레칭 체크리스트 (A4 2장)",
      rows: 2,
    },
    {
      key: "result",
      label: "이 자료를 다 보고 나면 무엇을 알게 되나요?",
      help: "'받으면 좋은 것'이 아니라 '받으면 달라지는 것'을 쓰세요.",
      placeholder: "예: 하루 중 언제 허리가 망가지는지 알게 되고, 그 순간마다 할 동작 3개를 갖게 됩니다.",
      rows: 2,
    },
    {
      key: "why",
      label: "왜 이 자료를 만들었나요?",
      help: "내가 겪은 문제와 이어질수록 신뢰가 생깁니다. 앞 숙제에 쓴 내 이야기를 떠올려보세요.",
      placeholder: "예: 저도 3년간 병원만 다니다가, 결국 자세를 바꾸고 나서야 통증이 잡혔거든요.",
      rows: 2,
    },
    {
      key: "how",
      label: "어떻게 받게 하실 건가요?",
      help: "가장 단순한 방법 하나만 고르세요. 여러 개면 아무도 안 누릅니다.",
      placeholder: "예: 이메일 주소를 남기면 자동으로 발송 / 카카오 채널 추가하면 바로 전달",
      rows: 2,
    },
  ],
  trial: [
    {
      key: "what",
      label: "무엇을 체험하게 하실 건가요?",
      help: "본 상품의 축소판이면 좋습니다. 체험만으로도 하나는 얻어가게 하세요.",
      placeholder: "예: 1:1 자세 진단 30분 — 사진 3장을 보내면 지금 문제되는 자세를 짚어드립니다",
      rows: 2,
    },
    {
      key: "howLong",
      label: "얼마나 걸리나요? 어디서 하나요?",
      placeholder: "예: 30분 · 온라인(줌) 또는 매장 방문",
      rows: 2,
    },
    {
      key: "result",
      label: "체험이 끝나면 무엇을 얻어가나요?",
      help: "체험만 받고 안 사도 손해가 아니어야 신청합니다.",
      placeholder: "예: 내 자세에서 가장 문제인 지점 1개와, 오늘부터 할 동작 2개를 정리해서 드립니다.",
      rows: 2,
    },
    {
      key: "how",
      label: "어떻게 신청하나요?",
      placeholder: "예: 카카오 오픈채팅으로 '체험' 남기기 / 신청 폼 작성",
      rows: 2,
    },
  ],
  event: [
    {
      key: "what",
      label: "어떤 이벤트인가요?",
      placeholder: "예: 오픈 기념 4주 자세교정 챌린지 · 선착순 10명 50% 할인",
      rows: 2,
    },
    {
      key: "benefit",
      label: "참여하면 무엇을 받나요?",
      help: "받는 것이 분명할수록 참여율이 올라갑니다.",
      placeholder: "예: 4주 프로그램 50% 할인 + 자세 진단 1회 무료",
      rows: 2,
    },
    {
      key: "period",
      label: "언제까지인가요?",
      help: "마감이 없으면 아무도 지금 움직이지 않습니다. 없는 기간을 지어내지는 마세요.",
      placeholder: "예: 3월 10일까지 · 선착순 10명",
      rows: 2,
    },
    {
      key: "how",
      label: "어떻게 참여하나요?",
      placeholder: "예: 이 게시물에 댓글 → 오픈채팅 입장 → 신청서 작성",
      rows: 2,
    },
  ],
};

const URL_LABEL: Record<FreebieKind, string> = {
  freebie: "무료자료 신청 페이지 주소",
  trial: "무료체험 신청 페이지 주소",
  event: "이벤트 안내 페이지 주소",
};

export function FreebiePageGuide({
  taskId,
  initialData,
  context,
  next,
}: {
  taskId: string;
  initialData: PageBuilderData | null;
  context?: GuideContext | null;
  next?: { id: string; title: string; day: number } | null;
}) {
  const [data, setData] = useState<PageBuilderData>(initialData ?? {});
  const kind = data.kind ?? null;

  // 유형을 바꿔도 이미 쓴 답은 지우지 않는다 (다시 돌아올 수 있게)
  const pick = (k: FreebieKind) => setData((prev) => ({ ...prev, kind: k }));

  const selector = (
    <>
      <StepHeader
        n={1}
        title="무엇으로 첫 버튼을 채울지 고르기"
        desc="처음 온 사람은 바로 사지 않습니다. 연락처를 남길 이유를 먼저 줘야 해요. 셋 중 하나면 됩니다."
        done={Boolean(kind)}
      />
      <div className="grid gap-2 sm:grid-cols-3">
        {KINDS.map((k) => {
          const picked = kind === k.key;
          return (
            <button
              key={k.key}
              type="button"
              onClick={() => pick(k.key)}
              className={
                "rounded-xl border p-3 text-left transition-colors " +
                (picked
                  ? "border-pink-400 bg-pink-50/50 ring-2 ring-pink-100"
                  : "border-neutral-200 bg-white hover:border-neutral-400")
              }
            >
              <span className="flex items-center gap-1.5">
                <k.icon className={"w-4 h-4 " + (picked ? "text-pink-600" : "text-neutral-400")} />
                <span className="text-[13px] font-bold text-neutral-900">{k.title}</span>
                {picked && <Check className="w-3.5 h-3.5 text-pink-600" />}
              </span>
              <span className="mt-1 block text-[12px] leading-5 text-neutral-500">{k.desc}</span>
              <span className="mt-1 block text-[11px] leading-4 text-neutral-400">{k.examples}</span>
            </button>
          );
        })}
      </div>
    </>
  );

  if (!kind) {
    return (
      <div className="space-y-4">
        {selector}
        <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-[12px] leading-5 text-amber-700">
          하나를 고르면 그에 맞는 질문이 나옵니다. 나중에 바꿔도 쓴 내용은 그대로 남아요.
        </p>
      </div>
    );
  }

  return (
    <PageBuilder
      taskId={taskId}
      kind={kind}
      fields={FIELDS[kind]}
      data={data}
      onChange={setData}
      context={context}
      next={next}
      stepOffset={2}
      intro="인포크 링크 맨 위에 들어갈 페이지입니다. 여기서 연락처를 남기게 만드는 게 전부예요."
      generateLabel="페이지 글 만들기"
      urlLabel={URL_LABEL[kind]}
      urlHelp="만든 페이지(노션·블로그·폼 등)의 주소를 넣으세요. 인포크 숙제 1번 버튼에 자동으로 들어갑니다."
    >
      {selector}
    </PageBuilder>
  );
}
