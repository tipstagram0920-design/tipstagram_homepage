import { formatKstHuman } from "@/lib/kst";
import { Lock, CheckCircle2 } from "lucide-react";

// 제출한 숙제를 읽기 전용으로 보여주는 뷰 (수정 불가).
// week1은 구조화된 formData를 예쁘게, 그 외 주차는 자유 텍스트를 그대로 렌더.

const WEEK1_Q_LABELS: Record<string, string> = {
  q2_expertise: "Q2. 이 일에서 나의 전문성을 보여줄 수 있는 것들",
  q3_customer_problem: "Q3. 내 소비자가 지금 겪고 있는 문제·불편",
  q4_persona: "Q4. 그 사람은 누구인가요? 하루는 어떤 모습인가요?",
  q5_solution: "Q5. 나는 그 문제를 어떻게 해결하나요?",
  q6_transformation: "Q6. 내 상품을 만난 뒤 소비자의 삶은 어떻게 바뀌나요?",
  q7_search: "Q7. 사기 직전에 검색할 단어·질문",
  q8_solved_experiences: "Q8. 소비자들의 문제를 해결했던 나의 경험들",
  q9_customer_change: "Q9. 내 상품·서비스를 경험한 뒤 달라진 고객의 모습",
  q10_unmet_problem: "Q10. 다른 판매자들이 채워주지 못하는 소비자의 문제",
};

const HIGHLIGHT_LABELS: Record<string, string> = {
  freebie: "무료자료",
  reviews: "후기모음",
  faq: "자주묻는질문",
  contact: "문의하기",
};

interface ProductEntry {
  name?: string;
  description?: string;
}
interface PersonEntry {
  name?: string;
  instagramUrl?: string;
  followerRange?: string;
  learning?: string;
}
interface Week1FormData {
  kind: "week1_product_customer";
  products?: ProductEntry[];
  answers?: Record<string, string>;
  people?: PersonEntry[];
  landingUrl?: string;
  highlights?: Record<string, string[]>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/60 p-4">
      <p className="text-[13px] font-bold text-neutral-900 mb-2">{label}</p>
      {children}
    </div>
  );
}

export function SubmissionView({
  content,
  formData,
  imageUrls,
  instagramUrl,
  submittedAt,
}: {
  content: string;
  formData: unknown;
  imageUrls: string[];
  instagramUrl: string | null;
  submittedAt: string;
}) {
  const fd = (formData ?? null) as { kind?: string } | null;
  const isWeek1 = fd?.kind === "week1_product_customer";
  const w1 = isWeek1 ? (fd as unknown as Week1FormData) : null;

  return (
    <div className="space-y-4">
      {/* 제출 상태 배너 */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200/70 bg-white px-5 py-3.5">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 제출 완료
          <span className="text-neutral-400 font-normal">· {formatKstHuman(submittedAt)}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
          <Lock className="w-3 h-3" /> 수정 불가
        </span>
      </div>

      {w1 ? (
        <>
          {w1.products && w1.products.some((p) => p.name || p.description) && (
            <Field label="Q1. 팔고 싶은 것 · 팔고 있는 것">
              <div className="space-y-2">
                {w1.products
                  .filter((p) => p.name || p.description)
                  .map((p, i) => (
                    <div key={i} className="rounded-xl bg-white border border-neutral-200/70 p-3">
                      <p className="text-sm font-semibold text-neutral-900">
                        {i + 1}. {p.name || "(이름 미입력)"}
                      </p>
                      {p.description && (
                        <p className="text-[13px] text-neutral-600 mt-1 whitespace-pre-wrap">
                          {p.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </Field>
          )}

          {w1.answers &&
            Object.entries(WEEK1_Q_LABELS).map(([key, label]) => {
              const a = (w1.answers?.[key] || "").trim();
              if (!a) return null;
              return (
                <Field key={key} label={label}>
                  <p className="text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {a}
                  </p>
                </Field>
              );
            })}

          {w1.people && w1.people.some((p) => p.name || p.instagramUrl) && (
            <Field label={`나와 관련된 사람들 조사 (${w1.people.filter((p) => p.name || p.instagramUrl).length}명)`}>
              <div className="space-y-2">
                {w1.people
                  .filter((p) => p.name || p.instagramUrl)
                  .map((p, i) => (
                    <div key={i} className="rounded-xl bg-white border border-neutral-200/70 p-3">
                      <p className="text-sm font-semibold text-neutral-900">
                        {i + 1}. {p.name || "(이름 없음)"}
                      </p>
                      {p.instagramUrl && (
                        <a
                          href={p.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] text-pink-600 hover:underline break-all"
                        >
                          {p.instagramUrl}
                        </a>
                      )}
                      {p.followerRange && (
                        <p className="text-[12px] text-neutral-500 mt-0.5">팔로워: {p.followerRange}</p>
                      )}
                      {p.learning && (
                        <p className="text-[12px] text-neutral-600 mt-0.5 whitespace-pre-wrap">
                          배울 점: {p.learning}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </Field>
          )}

          {w1.landingUrl && (
            <Field label="랜딩 페이지 URL">
              <a
                href={w1.landingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-pink-600 hover:underline break-all"
              >
                {w1.landingUrl}
              </a>
            </Field>
          )}

          {w1.highlights &&
            Object.entries(w1.highlights).some(([, urls]) => (urls?.length ?? 0) > 0) && (
              <Field label="하이라이트 스크린샷">
                <div className="space-y-4">
                  {Object.entries(w1.highlights).map(([key, urls]) => {
                    if (!urls || urls.length === 0) return null;
                    return (
                      <div key={key}>
                        <p className="text-[12px] font-semibold text-neutral-600 mb-2">
                          {HIGHLIGHT_LABELS[key] ?? key} ({urls.length}장)
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {urls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-square block"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`${HIGHLIGHT_LABELS[key] ?? key} ${i + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Field>
            )}
        </>
      ) : (
        <>
          <Field label="제출한 답변">
            <p className="text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {content || "(내용 없음)"}
            </p>
          </Field>
          {imageUrls.length > 0 && (
            <Field label="첨부 이미지">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {imageUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-square block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`첨부 ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </Field>
          )}
        </>
      )}

      {instagramUrl && (
        <Field label="내 인스타 URL">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-pink-600 hover:underline break-all"
          >
            {instagramUrl}
          </a>
        </Field>
      )}
    </div>
  );
}
