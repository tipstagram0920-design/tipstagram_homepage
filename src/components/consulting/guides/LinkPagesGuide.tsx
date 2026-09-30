"use client";

import { useState } from "react";
import {
  useGuideSave,
  useGuideAutosave,
  AutosaveStatus,
  SaveButton,
  FIELD,
  FIELD_TA,
  FLABEL,
} from "./common";
import { Gift, MessageSquareQuote, HelpCircle, PhoneCall, CheckCircle2, Circle, Lightbulb } from "lucide-react";
import type { GuideContext } from "@/lib/consulting-guide-data";

/**
 * 인포크(링크인바이오)에 넣을 페이지 4종.
 * 링크 버튼을 먼저 만들면 넣을 페이지가 없어 빈 링크가 된다 → 페이지를 먼저 만들고,
 * 여기서 모은 URL 4개를 다음 숙제(인포크 링크)에서 그대로 배치한다.
 */
export interface LinkPagesData {
  freebieUrl?: string;
  freebieNote?: string;
  proofUrl?: string;
  proofNote?: string;
  faqUrl?: string;
  faqNote?: string;
  contactUrl?: string;
  contactNote?: string;
}

const PAGES: {
  order: number;
  urlKey: keyof LinkPagesData;
  noteKey: keyof LinkPagesData;
  icon: typeof Gift;
  title: string;
  why: string;
  how: string[];
  notePlaceholder: string;
}[] = [
  {
    order: 1,
    urlKey: "freebieUrl",
    noteKey: "freebieNote",
    icon: Gift,
    title: "무료자료 또는 이벤트 페이지",
    why: "처음 온 사람은 바로 사지 않습니다. 연락처를 남길 이유를 먼저 줘야 합니다.",
    how: [
      "내 소비자가 당장 겪는 문제 하나를 딱 풀어주는 자료를 만드세요 (PDF·체크리스트·템플릿 등)",
      "받는 방법을 한 줄로: 이름·연락처만 남기면 바로 받도록",
      "이벤트로 대신해도 됩니다 (체험·할인·챌린지)",
    ],
    notePlaceholder: "예: '앉아서 하는 3분 허리 스트레칭' PDF · 이메일 입력하면 자동 발송",
  },
  {
    order: 2,
    urlKey: "proofUrl",
    noteKey: "proofNote",
    icon: MessageSquareQuote,
    title: "고객 후기 또는 나의 변화 스토리",
    why: "믿을 이유가 없으면 무료자료도 안 받습니다. 후기가 없다면 내 변화가 곧 후기입니다.",
    how: [
      "후기가 있다면: 캡처 + 어떤 상태에서 어떻게 바뀌었는지 한 줄씩",
      "후기가 없다면: 1번 숙제에 쓴 내 스토리(이전 → 지금)를 그대로 페이지로",
      "숫자가 있으면 반드시 넣으세요 (기간·인원·변화폭)",
    ],
    notePlaceholder: "예: 수강생 후기 8건 + 나의 3년 통증 극복 스토리",
  },
  {
    order: 3,
    urlKey: "faqUrl",
    noteKey: "faqNote",
    icon: HelpCircle,
    title: "자주 묻는 질문",
    why: "문의로 오는 질문의 90%는 정해져 있습니다. 미리 답해두면 상담이 '살까 말까'에서 시작합니다.",
    how: [
      "실제로 DM·댓글로 받은 질문을 그대로 5~10개 적으세요",
      "가격·기간·환불·초보 가능 여부는 꼭 넣으세요",
      "질문이 없다면 내가 이 일을 시작할 때 궁금했던 것을 쓰세요",
    ],
    notePlaceholder: "예: 가격·기간·초보 가능·환불 규정 등 8문항",
  },
  {
    order: 4,
    urlKey: "contactUrl",
    noteKey: "contactNote",
    icon: PhoneCall,
    title: "상담하기 또는 주문하기",
    why: "앞의 3개를 다 봐도 살 곳이 없으면 그냥 나갑니다. 마지막에 반드시 행동할 곳이 있어야 합니다.",
    how: [
      "상담형: 오픈채팅·폼·전화 중 하나로 통일 (여러 개면 오히려 안 누릅니다)",
      "판매형: 바로 결제되는 주문 페이지",
      "다음 숙제(랜딩페이지 글 생성기)로 이 페이지 문구를 만들 수 있습니다",
    ],
    notePlaceholder: "예: 카카오 오픈채팅 상담 링크",
  },
];

export function LinkPagesGuide({
  taskId,
  initialData,
  context,
}: {
  taskId: string;
  initialData: LinkPagesData | null;
  context?: GuideContext | null;
}) {
  const [data, setData] = useState<LinkPagesData>(initialData ?? {});
  const { saving, saved, save } = useGuideSave(taskId);
  const auto = useGuideAutosave(taskId, data);

  const set = (k: keyof LinkPagesData, v: string) => setData((prev) => ({ ...prev, [k]: v }));
  const doneCount = PAGES.filter((p) => (data[p.urlKey] || "").trim()).length;

  // 앞 숙제(소비자 선정 → 프로필)에서 확정한 값 — 여기서 만드는 페이지의 기준이 된다.
  const c = context?.customer ?? null;
  const profileLines = (c?.finalLines ?? []).map((l) => (l ?? "").trim()).filter(Boolean);
  const problems = (c?.problems ?? []).map((p) => (p ?? "").trim()).filter(Boolean);
  const persona = (c?.personaLine ?? "").trim();
  const hasCarry = profileLines.length > 0 || problems.length > 0 || Boolean(persona);

  // 페이지별로 "앞 숙제의 무엇을 보고 만들면 되는지" 한 줄
  const carryHint: Partial<Record<keyof LinkPagesData, string>> = {
    freebieUrl: problems[0] ? `앞 숙제 문제 1번 "${problems[0]}"을 풀어주는 자료로 만드세요.` : "",
    proofUrl: (c?.myProblem ?? "").trim()
      ? "앞 숙제에 쓴 내 이야기(그때 → 지금)를 그대로 페이지로 옮기면 됩니다."
      : "",
    faqUrl: problems.length > 1 ? `문제 ${problems.length}개가 곧 질문 목록입니다.` : "",
    contactUrl: "이 페이지 문구는 다음 숙제(랜딩페이지 글)에서 자동으로 만들어집니다.",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] text-neutral-500 leading-relaxed flex-1">
          인포크 링크를 만들기 <strong>전에</strong> 넣을 페이지부터 만듭니다. 여기 모은 주소 4개를
          다음 숙제에서 그대로 버튼으로 배치합니다.
        </p>
        <AutosaveStatus saving={auto.saving} saved={auto.saved} />
      </div>

      {hasCarry && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-[12px] font-bold text-emerald-700 mb-1.5">
            앞 숙제에서 정한 내용 — 이 4개 페이지는 전부 여기에 맞춰 만듭니다
          </p>
          {profileLines.length > 0 && (
            <div className="mb-2 space-y-0.5 text-[13px] leading-6 text-emerald-900/85">
              {profileLines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
          )}
          {persona && (
            <p className="text-[12.5px] text-emerald-900/75">
              <strong>타겟</strong> · {persona}
            </p>
          )}
          {problems.length > 0 && (
            <div className="mt-1.5">
              <p className="text-[12px] font-bold text-emerald-900/70">소비자 문제</p>
              <ol className="mt-0.5 list-decimal space-y-0.5 pl-4 text-[12.5px] leading-5 text-emerald-900/75">
                {problems.slice(0, 5).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <p className="text-[13px] font-bold text-neutral-800">
          완료 {doneCount}/{PAGES.length}
        </p>
        <p className="mt-1 text-[12px] text-neutral-500 leading-5">
          순서가 중요합니다. <strong>무료자료 → 후기 → FAQ → 상담</strong> 순으로 의심이 하나씩 걷히면서
          마지막에 행동하게 됩니다.
        </p>
      </div>

      {PAGES.map((p) => {
        const filled = (data[p.urlKey] || "").trim().length > 0;
        return (
          <div
            key={p.urlKey}
            className={
              "rounded-xl border p-4 " +
              (filled ? "border-emerald-200 bg-emerald-50/40" : "border-neutral-200 bg-white")
            }
          >
            <div className="flex items-start gap-2.5 mb-2">
              <span className="shrink-0 mt-0.5">
                {filled ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-300" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-bold text-neutral-900 inline-flex items-center gap-1.5">
                  <p.icon className="w-3.5 h-3.5 text-neutral-500" />
                  {p.order}. {p.title}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-neutral-600">{p.why}</p>
              </div>
            </div>

            <ul className="list-disc space-y-1 pl-8 mb-3 text-[12px] leading-5 text-neutral-600">
              {p.how.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>

            {carryHint[p.urlKey] && (
              <p className="ml-8 mb-3 inline-flex items-start gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-2 text-[12px] leading-5 text-indigo-800">
                <Lightbulb className="mt-0.5 w-3.5 h-3.5 shrink-0" />
                <span>{carryHint[p.urlKey]}</span>
              </p>
            )}

            <div className="space-y-2 pl-8">
              <div>
                <label className={FLABEL}>페이지 주소</label>
                <input
                  type="url"
                  value={data[p.urlKey] ?? ""}
                  onChange={(e) => set(p.urlKey, e.target.value)}
                  placeholder="https://..."
                  className={FIELD}
                />
              </div>
              <div>
                <label className={FLABEL}>
                  무엇을 만들었나 <span className="text-neutral-400 font-normal">(선택)</span>
                </label>
                <textarea
                  value={data[p.noteKey] ?? ""}
                  onChange={(e) => set(p.noteKey, e.target.value)}
                  rows={2}
                  placeholder={p.notePlaceholder}
                  className={FIELD_TA}
                />
              </div>
            </div>
          </div>
        );
      })}

      <SaveButton onClick={() => save(data)} saving={saving} saved={saved} />
    </div>
  );
}
