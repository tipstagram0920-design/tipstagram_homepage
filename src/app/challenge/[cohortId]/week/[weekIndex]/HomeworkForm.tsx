"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Instagram, CheckCircle2 } from "lucide-react";

interface Initial {
  content: string;
  imageUrls: string[];
  instagramUrl: string;
  submittedAt: string;
  hasFeedback: boolean;
}

interface Props {
  cohortId: string;
  weekId: string;
  weekIndex: number;
  initial: Initial | null;
}

// Week 1 · "내 상품과 소비자 찾기" — 프로필 생성용 6개 질문
const WEEK1_QUESTIONS = [
  {
    key: "q2_expertise",
    label: "Q2. 이 일에서 나의 전문성을 보여줄 수 있는 것들은 무엇인가요?",
    placeholder:
      "경력·자격·실적·경험·수료증·수상 이력 등 · 남들과 다른 나만의 근거를 최대한 구체적으로.\n예: 필라테스 강사 8년차 · L2 지도자 자격 · 대기업 임직원 프로그램 3년 운영 · 자세 교정 후기 300건 이상",
    rows: 5,
  },
  {
    key: "q3_customer_problem",
    label: "Q3. 내 소비자가 지금 겪고 있는 문제·불편은 무엇인가요?",
    placeholder:
      "'힘들다·불편하다' 같은 두루뭉술한 말고, 어떤 상황에서 무엇을 못 해서 무엇을 놓치고 있는지 구체적으로.\n예: 결혼식 준비하면서 새벽 6시 헬스장 다녀도 배가 안 빠져 웨딩드레스 사이즈 못 낮추고 있음.",
    rows: 5,
  },
  {
    key: "q4_persona",
    label: "Q4. 그 사람은 누구인가요? 그 사람의 하루는 어떤 모습인가요?",
    placeholder:
      "나이·직업·상황·주요 고민·평일 저녁의 흔한 풍경까지 한 사람을 생생하게 그려주세요.",
    rows: 5,
  },
  {
    key: "q5_solution",
    label: "Q5. 나는 그 문제를 어떻게 해결하나요?",
    placeholder:
      "내 방법·접근·철학. 다른 방법과 무엇이 다른지도 함께.\n예: 하루 15분 홈트 루틴 + 식단 자동화 챗봇 + 주 1회 자세 피드백. '헬스장 3시간'이 아니라 '집에서 15분·매일 지속'이 핵심.",
    rows: 5,
  },
  {
    key: "q6_transformation",
    label: "Q6. 내 상품을 만난 뒤 소비자의 삶은 어떻게 바뀌나요?",
    placeholder:
      "Before → After 로 대비해서 생생하게. 3개월·6개월·1년 뒤의 그림도 함께.\n예: (전) 매일 아침 거울 보며 한숨 · (후) 결혼식 3개월 뒤 남편이 다시 반해 사진 찍자고 함.",
    rows: 5,
  },
  {
    key: "q7_search",
    label: "Q7. 내 상품을 사기 직전에 그 사람이 검색할 단어·질문은 무엇일까요?",
    placeholder:
      "네이버·구글·유튜브·인스타 어디에서든 실제로 검색할 만한 실제 문장 5개 이상.",
    rows: 4,
  },
] as const;

type QAnswers = Record<string, string>;

interface ProductEntry {
  name: string;
  description: string;
}
const EMPTY_PRODUCT: ProductEntry = { name: "", description: "" };

interface PersonEntry {
  name: string;
  instagramUrl: string;
  followerRange: string;
  learning: string;
}
const EMPTY_PERSON: PersonEntry = {
  name: "",
  instagramUrl: "",
  followerRange: "",
  learning: "",
};

const MIN_PEOPLE = 5;

function assembleContent(
  weekIndex: number,
  products: ProductEntry[],
  answers: QAnswers,
  people: PersonEntry[],
  freeText: string
): string {
  if (weekIndex === 1) {
    const parts: string[] = [];
    const validProducts = products.filter((p) => p.name.trim() || p.description.trim());
    if (validProducts.length > 0) {
      parts.push(`# Q1. 팔고 싶은 것 · 팔고 있는 것`);
      validProducts.forEach((p, i) => {
        const line = [`### ${i + 1}. ${p.name || "(이름 미입력)"}`];
        if (p.description) line.push(p.description);
        parts.push(line.join("\n"));
      });
    }
    for (const q of WEEK1_QUESTIONS) {
      const a = (answers[q.key] || "").trim();
      if (!a) continue;
      parts.push(`# ${q.label}\n\n${a}`);
    }
    const validPeople = people.filter((p) => p.name.trim() || p.instagramUrl.trim());
    if (validPeople.length > 0) {
      parts.push(`# 🔍 나와 관련된 사람들 조사 (${validPeople.length}명)`);
      validPeople.forEach((p, i) => {
        const lines: string[] = [];
        lines.push(`### ${i + 1}. ${p.name || "(이름 없음)"}`);
        if (p.instagramUrl) lines.push(`- 인스타: ${p.instagramUrl}`);
        if (p.followerRange) lines.push(`- 팔로워: ${p.followerRange}`);
        if (p.learning) lines.push(`- 배울 점: ${p.learning}`);
        parts.push(lines.join("\n"));
      });
    }
    return parts.join("\n\n");
  }
  return freeText;
}

export function HomeworkForm({ cohortId, weekId, weekIndex, initial }: Props) {
  const router = useRouter();
  const isWeek1 = weekIndex === 1;

  const [products, setProducts] = useState<ProductEntry[]>([{ ...EMPTY_PRODUCT }]);
  const [answers, setAnswers] = useState<QAnswers>({});
  const [people, setPeople] = useState<PersonEntry[]>(
    isWeek1 ? Array.from({ length: MIN_PEOPLE }, () => ({ ...EMPTY_PERSON })) : []
  );
  const [freeText, setFreeText] = useState<string>(!isWeek1 ? initial?.content ?? "" : "");
  const [instagramUrl, setInstagramUrl] = useState<string>(initial?.instagramUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (isWeek1) {
      const answered = WEEK1_QUESTIONS.filter((q) => (answers[q.key] || "").trim().length > 0).length;
      const hasProduct = products.some((p) => p.name.trim() || p.description.trim());
      const peopleCount = people.filter((p) => p.name.trim() || p.instagramUrl.trim()).length;
      return answered >= 4 && hasProduct && peopleCount >= MIN_PEOPLE;
    }
    return freeText.trim().length > 30;
  }, [isWeek1, answers, freeText, people, products]);

  const submit = async () => {
    setError("");
    if (isWeek1) {
      const validProducts = products.filter((p) => p.name.trim() || p.description.trim());
      const validPeople = people.filter((p) => p.name.trim() || p.instagramUrl.trim());
      const answered = WEEK1_QUESTIONS.filter((q) => (answers[q.key] || "").trim().length > 0).length;
      if (validProducts.length === 0) {
        setError("Q1: 팔고 싶은 것을 최소 1개 이상 남겨 주세요.");
        return;
      }
      if (answered < 4) {
        setError(`Q2~Q7 중 최소 4개 질문에 답해 주세요. (현재 ${answered}개)`);
        return;
      }
      if (validPeople.length < MIN_PEOPLE) {
        setError(`관련된 사람 조사를 최소 ${MIN_PEOPLE}명 이상 채워 주세요. (현재 ${validPeople.length}명)`);
        return;
      }
    } else if (freeText.trim().length <= 30) {
      setError("숙제 내용을 30자 이상 작성해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const content = assembleContent(weekIndex, products, answers, people, freeText);
      const formData = isWeek1
        ? {
            kind: "week1_product_customer",
            products: products.filter((p) => p.name.trim() || p.description.trim()),
            answers,
            people: people.filter((p) => p.name.trim() || p.instagramUrl.trim()),
          }
        : { kind: "free_text", text: freeText };
      const res = await fetch("/api/homework/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekId,
          content,
          formData,
          imageUrls: [],
          instagramUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "제출 중 오류가 발생했어요.");
        return;
      }
      setSavedAt(new Date().toISOString());
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {isWeek1 ? (
        <>
          {/* Q1. 상품 · 다중 카드 */}
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Q1. 팔고 싶은 것 <span className="text-white/60">또는</span> 팔고 있는 것은 무엇인가요?
            </label>
            <p className="text-xs text-white/50 mb-3">여러 개라면 카드를 추가해서 각각 남겨 주세요.</p>
            <div className="space-y-3">
              {products.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white/60">상품 {i + 1}</p>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setProducts((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-300 hover:text-red-400 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> 삭제
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x))
                      )
                    }
                    placeholder="상품·서비스·콘텐츠 이름 (예: 4주 홈필라테스 프로그램)"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400"
                  />
                  <textarea
                    value={p.description}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x))
                      )
                    }
                    rows={3}
                    placeholder="한두 문장으로 설명 · 가격·형태·핵심 결과가 드러나면 더 좋아요"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 resize-none"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProducts((prev) => [...prev, { ...EMPTY_PRODUCT }])}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 text-sm hover:border-pink-400 hover:text-white"
              >
                <Plus className="w-4 h-4" /> 상품 추가
              </button>
            </div>
          </div>

          {/* Q2~Q7 */}
          <div className="space-y-5">
            {WEEK1_QUESTIONS.map((q) => (
              <div key={q.key}>
                <label className="block text-sm font-bold text-white mb-2">{q.label}</label>
                <textarea
                  value={answers[q.key] || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
                  rows={q.rows}
                  placeholder={q.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08] resize-none"
                  maxLength={2500}
                />
              </div>
            ))}
          </div>

          {/* 사람 조사 · 최소 5명 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-white">
                🔍 나와 관련된 사람들 조사
              </label>
              <span className="text-xs text-white/50">
                최소 <strong className="text-pink-400">5명 이상</strong>
              </span>
            </div>
            <p className="text-xs text-white/50 mb-3">
              내 잠재 고객이 이미 팔로우 중일 만한 계정 · 롤모델 · 경쟁 계정 · 벤치마킹 계정.
              인스타 URL은 반드시 실제 계정 링크로 남겨 주세요.
            </p>
            <div className="space-y-3">
              {people.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white/60">사람 {i + 1}</p>
                    {people.length > MIN_PEOPLE && (
                      <button
                        type="button"
                        onClick={() => setPeople((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-300 hover:text-red-400 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> 삭제
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) =>
                        setPeople((prev) =>
                          prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x))
                        )
                      }
                      placeholder="계정 이름·닉네임"
                      className="px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400"
                    />
                    <input
                      type="url"
                      value={p.instagramUrl}
                      onChange={(e) =>
                        setPeople((prev) =>
                          prev.map((x, idx) => (idx === i ? { ...x, instagramUrl: e.target.value } : x))
                        )
                      }
                      placeholder="인스타 URL (https://instagram.com/…)"
                      className="px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400"
                    />
                  </div>
                  <input
                    type="text"
                    value={p.followerRange}
                    onChange={(e) =>
                      setPeople((prev) =>
                        prev.map((x, idx) => (idx === i ? { ...x, followerRange: e.target.value } : x))
                      )
                    }
                    placeholder="팔로워 규모 (예: 1만~5만)"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400"
                  />
                  <textarea
                    value={p.learning}
                    onChange={(e) =>
                      setPeople((prev) =>
                        prev.map((x, idx) => (idx === i ? { ...x, learning: e.target.value } : x))
                      )
                    }
                    rows={2}
                    placeholder="이 계정에서 내가 배울 점·차별화할 점"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 resize-none"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPeople((prev) => [...prev, { ...EMPTY_PERSON }])}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 text-sm hover:border-pink-400 hover:text-white"
              >
                <Plus className="w-4 h-4" /> 사람 추가
              </button>
            </div>
          </div>
        </>
      ) : (
        <div>
          <label className="block text-sm font-bold text-white mb-2">숙제 답변</label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={10}
            placeholder="이번 주 프롬프트에 맞춰 자유롭게 작성해 주세요."
            className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08] resize-none"
            maxLength={15000}
          />
          <p className="mt-1 text-[11px] text-white/40 text-right">{freeText.length} / 15000</p>
        </div>
      )}

      {/* 내 인스타 URL */}
      <div>
        <label className="block text-sm font-bold text-white mb-2 inline-flex items-center gap-1.5">
          <Instagram className="w-4 h-4 text-pink-400" /> 내 인스타 URL (선택)
        </label>
        <input
          type="url"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://instagram.com/내계정"
          className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400"
        />
      </div>

      {error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={saving || !canSubmit}
        className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl ig-gradient text-white font-bold text-base shadow-lg shadow-pink-900/30 hover:opacity-90 disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> 제출 중...
          </>
        ) : initial ? (
          "다시 제출하기 (덮어쓰기)"
        ) : (
          "숙제 제출하기"
        )}
      </button>

      {savedAt && (
        <p className="text-center text-sm text-green-400 inline-flex items-center gap-1.5 justify-center w-full">
          <CheckCircle2 className="w-4 h-4" /> 제출되었습니다. 강사가 확인하면 이메일로 알려드려요.
        </p>
      )}

      <div className="pt-2 text-center">
        <a href={`/challenge/${cohortId}`} className="text-xs text-white/40 hover:text-white/70">
          챌린지 대시보드로 돌아가기 →
        </a>
      </div>
    </div>
  );
}
