"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Instagram, CheckCircle2, Link as LinkIcon, ImagePlus, X, Layers, Users } from "lucide-react";

interface Initial {
  content: string;
  formData?: unknown;
  imageUrls: string[];
  instagramUrl: string;
  submittedAt: string;
  hasFeedback: boolean;
}

// week1 제출 formData에서 프리필용 값 안전 추출
interface Week1FormData {
  kind?: string;
  products?: ProductEntry[];
  answers?: QAnswers;
  people?: PersonEntry[];
  landingUrl?: string;
  highlights?: HighlightShots;
}
function readWeek1FormData(formData: unknown): Week1FormData | null {
  if (!formData || typeof formData !== "object") return null;
  const fd = formData as Week1FormData;
  if (fd.kind !== "week1_product_customer") return null;
  return fd;
}

interface Props {
  cohortId: string;
  weekId: string;
  weekIndex: number;
  initial: Initial | null;
}

const WEEK1_QUESTIONS = [
  {
    key: "q2_expertise",
    number: "Q2",
    label: "이 일에서 나의 전문성을 보여줄 수 있는 것들은 무엇인가요?",
    placeholder:
      "경력·자격·실적·경험·수료증·수상 이력 등 · 남들과 다른 나만의 근거를 최대한 구체적으로.\n예: 필라테스 강사 8년차 · L2 지도자 자격 · 대기업 임직원 프로그램 3년 운영 · 자세 교정 후기 300건 이상",
    rows: 5,
  },
  {
    key: "q3_customer_problem",
    number: "Q3",
    label: "내 소비자가 지금 겪고 있는 문제·불편은 무엇인가요?",
    placeholder:
      "'힘들다·불편하다' 같은 두루뭉술한 말고, 어떤 상황에서 무엇을 못 해서 무엇을 놓치고 있는지 구체적으로.",
    rows: 5,
  },
  {
    key: "q4_persona",
    number: "Q4",
    label: "그 사람은 누구인가요? 그 사람의 하루는 어떤 모습인가요?",
    placeholder: "나이·직업·상황·주요 고민·평일 저녁의 흔한 풍경까지 한 사람을 생생하게 그려주세요.",
    rows: 5,
  },
  {
    key: "q5_solution",
    number: "Q5",
    label: "나는 그 문제를 어떻게 해결하나요?",
    placeholder: "내 방법·접근·철학. 다른 방법과 무엇이 다른지도 함께.",
    rows: 5,
  },
  {
    key: "q6_transformation",
    number: "Q6",
    label: "내 상품을 만난 뒤 소비자의 삶은 어떻게 바뀌나요?",
    placeholder: "Before → After 로 대비해서 생생하게. 3개월·6개월·1년 뒤의 그림도 함께.",
    rows: 5,
  },
  {
    key: "q7_search",
    number: "Q7",
    label: "내 상품을 사기 직전에 그 사람이 검색할 단어·질문은 무엇일까요?",
    placeholder: "네이버·구글·유튜브·인스타 어디에서든 실제로 검색할 만한 실제 문장 5개 이상.",
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

const HIGHLIGHT_SLOTS = [
  { key: "freebie", label: "무료자료" },
  { key: "reviews", label: "후기모음" },
  { key: "faq", label: "자주묻는질문" },
  { key: "contact", label: "문의하기" },
] as const;
type HighlightKey = (typeof HIGHLIGHT_SLOTS)[number]["key"];
// 각 하이라이트는 여러 장의 스토리로 구성되므로 URL 배열로 저장
type HighlightShots = Partial<Record<HighlightKey, string[]>>;

const MAX_HIGHLIGHT_SHOTS_PER_SLOT = 20;

function assembleContent(
  weekIndex: number,
  products: ProductEntry[],
  answers: QAnswers,
  people: PersonEntry[],
  landingUrl: string,
  highlights: HighlightShots,
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
      parts.push(`# ${q.number}. ${q.label}\n\n${a}`);
    }
    const validPeople = people.filter((p) => p.name.trim() || p.instagramUrl.trim());
    if (validPeople.length > 0) {
      parts.push(`# 나와 관련된 사람들 조사 (${validPeople.length}명)`);
      validPeople.forEach((p, i) => {
        const lines: string[] = [];
        lines.push(`### ${i + 1}. ${p.name || "(이름 없음)"}`);
        if (p.instagramUrl) lines.push(`- 인스타: ${p.instagramUrl}`);
        if (p.followerRange) lines.push(`- 팔로워: ${p.followerRange}`);
        if (p.learning) lines.push(`- 배울 점: ${p.learning}`);
        parts.push(lines.join("\n"));
      });
    }
    if (landingUrl.trim()) parts.push(`# 랜딩 페이지 URL\n\n${landingUrl.trim()}`);
    const withShots = HIGHLIGHT_SLOTS.filter((s) => (highlights[s.key] ?? []).length > 0);
    if (withShots.length > 0) {
      const total = withShots.reduce((n, s) => n + (highlights[s.key]?.length ?? 0), 0);
      parts.push(`# 하이라이트 스크린샷 (${withShots.length}종 · 총 ${total}장)`);
      for (const s of withShots) {
        const urls = highlights[s.key] ?? [];
        parts.push(`### ${s.label} (${urls.length}장)`);
        urls.forEach((u, i) => parts.push(`- ${i + 1}. ${u}`));
      }
    }
    return parts.join("\n\n");
  }
  return freeText;
}

// ── Apple 시스템 설정 스타일 톤 ──────────────────────────────────
const SECTION = "rounded-2xl border border-neutral-200/70 bg-neutral-50/50 p-5 sm:p-6";
const NESTED_CARD = "rounded-2xl border border-neutral-200/70 bg-white p-4 space-y-3";
const INPUT =
  "w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900";
const TEXTAREA = INPUT + " resize-none";
const LABEL_LG = "block text-[15px] font-bold text-neutral-900";
const HELP = "text-[12px] text-neutral-500 leading-relaxed";
const ADD_BUTTON =
  "w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-neutral-300 bg-white text-neutral-600 text-sm hover:border-neutral-900 hover:text-neutral-900";

function QHeader({
  number,
  label,
  help,
}: {
  number: string;
  label: string;
  help?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="shrink-0 inline-flex items-center justify-center min-w-10 h-10 px-2 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 text-white text-[13px] font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_10px_-4px_rgba(0,0,0,0.3)]">
        {number}
      </span>
      <div className="flex-1 pt-0.5">
        <p className={LABEL_LG}>{label}</p>
        {help && <p className={HELP + " mt-1"}>{help}</p>}
      </div>
    </div>
  );
}

export function HomeworkForm({ cohortId, weekId, weekIndex, initial }: Props) {
  const router = useRouter();
  const isWeek1 = weekIndex === 1;

  // 마감 전 재편집을 위해 기존 제출 내용 프리필
  const w1Initial = readWeek1FormData(initial?.formData);

  const [products, setProducts] = useState<ProductEntry[]>(
    w1Initial?.products && w1Initial.products.length > 0
      ? w1Initial.products.map((p) => ({ ...EMPTY_PRODUCT, ...p }))
      : [{ ...EMPTY_PRODUCT }]
  );
  const [answers, setAnswers] = useState<QAnswers>(w1Initial?.answers ?? {});
  const [people, setPeople] = useState<PersonEntry[]>(
    w1Initial?.people && w1Initial.people.length > 0
      ? w1Initial.people.map((p) => ({ ...EMPTY_PERSON, ...p }))
      : isWeek1
        ? Array.from({ length: MIN_PEOPLE }, () => ({ ...EMPTY_PERSON }))
        : []
  );
  const [freeText, setFreeText] = useState<string>(!isWeek1 ? initial?.content ?? "" : "");
  const [instagramUrl, setInstagramUrl] = useState<string>(initial?.instagramUrl ?? "");
  const [landingUrl, setLandingUrl] = useState<string>(w1Initial?.landingUrl ?? "");
  const [highlights, setHighlights] = useState<HighlightShots>(w1Initial?.highlights ?? {});
  const [uploadingKey, setUploadingKey] = useState<HighlightKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const fileRefs = useRef<Record<HighlightKey, HTMLInputElement | null>>({
    freebie: null,
    reviews: null,
    faq: null,
    contact: null,
  });

  const uploadHighlight = async (key: HighlightKey, files: FileList | File[]) => {
    setError("");
    const list = Array.from(files);
    if (list.length === 0) return;
    const current = highlights[key] ?? [];
    const room = MAX_HIGHLIGHT_SHOTS_PER_SLOT - current.length;
    if (room <= 0) {
      setError(`이 하이라이트에는 최대 ${MAX_HIGHLIGHT_SHOTS_PER_SLOT}장까지 올릴 수 있어요.`);
      return;
    }
    const toUpload = list.slice(0, room);
    setUploadingKey(key);
    try {
      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) {
          setError("이미지 파일만 첨부할 수 있어요.");
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError("10MB 이하 이미지만 첨부할 수 있어요.");
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/homework/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.url) {
          setError(data.error || "업로드 실패");
          continue;
        }
        setHighlights((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), data.url as string] }));
      }
    } finally {
      setUploadingKey(null);
    }
  };

  const removeHighlight = (key: HighlightKey, index: number) => {
    setHighlights((prev) => {
      const cur = prev[key] ?? [];
      const next = cur.filter((_, i) => i !== index);
      const copy = { ...prev };
      if (next.length === 0) delete copy[key];
      else copy[key] = next;
      return copy;
    });
  };

  const canSubmit = useMemo(() => {
    if (isWeek1) {
      const answered = WEEK1_QUESTIONS.filter((q) => (answers[q.key] || "").trim().length > 0).length;
      const hasProduct = products.some((p) => p.name.trim() || p.description.trim());
      const peopleCount = people.filter((p) => p.name.trim() || p.instagramUrl.trim()).length;
      const hasLanding = landingUrl.trim().length > 0;
      const slotsWithShots = HIGHLIGHT_SLOTS.filter((s) => (highlights[s.key] ?? []).length > 0).length;
      return (
        answered >= 4 &&
        hasProduct &&
        peopleCount >= MIN_PEOPLE &&
        hasLanding &&
        slotsWithShots >= HIGHLIGHT_SLOTS.length
      );
    }
    return freeText.trim().length > 30;
  }, [isWeek1, answers, freeText, people, products, landingUrl, highlights]);

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
      if (!landingUrl.trim()) {
        setError("랜딩 페이지 URL을 남겨 주세요.");
        return;
      }
      const missing = HIGHLIGHT_SLOTS.filter((s) => (highlights[s.key] ?? []).length === 0);
      if (missing.length > 0) {
        setError(`하이라이트 4종 모두 1장 이상 올려 주세요. (미제출: ${missing.map((s) => s.label).join(" · ")})`);
        return;
      }
    } else if (freeText.trim().length <= 30) {
      setError("숙제 내용을 30자 이상 작성해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const content = assembleContent(
        weekIndex,
        products,
        answers,
        people,
        landingUrl,
        highlights,
        freeText
      );
      const formData = isWeek1
        ? {
            kind: "week1_product_customer",
            products: products.filter((p) => p.name.trim() || p.description.trim()),
            answers,
            people: people.filter((p) => p.name.trim() || p.instagramUrl.trim()),
            landingUrl: landingUrl.trim(),
            highlights,
          }
        : { kind: "free_text", text: freeText };
      const highlightImageUrls = HIGHLIGHT_SLOTS.flatMap((s) => highlights[s.key] ?? []);
      const res = await fetch("/api/homework/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekId,
          content,
          formData,
          imageUrls: highlightImageUrls,
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
    <div className="space-y-4">
      {isWeek1 ? (
        <>
          {/* Q1. 상품 · 다중 카드 */}
          <div className={SECTION}>
            <QHeader
              number="Q1"
              label="팔고 싶은 것 또는 팔고 있는 것은 무엇인가요?"
              help="여러 개라면 카드를 추가해서 각각 남겨 주세요."
            />
            <div className="space-y-3">
              {products.map((p, i) => (
                <div key={i} className={NESTED_CARD}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-500">상품 {i + 1}</p>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setProducts((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-xs text-neutral-500 hover:text-red-600 inline-flex items-center gap-1"
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
                    placeholder="상품·서비스·콘텐츠 이름"
                    className={INPUT}
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
                    className={TEXTAREA}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProducts((prev) => [...prev, { ...EMPTY_PRODUCT }])}
                className={ADD_BUTTON}
              >
                <Plus className="w-4 h-4" /> 상품 추가
              </button>
            </div>
          </div>

          {/* Q2~Q7 각각 카드 */}
          {WEEK1_QUESTIONS.map((q) => (
            <div key={q.key} className={SECTION}>
              <QHeader number={q.number} label={q.label} />
              <textarea
                value={answers[q.key] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
                rows={q.rows}
                placeholder={q.placeholder}
                className={TEXTAREA}
                maxLength={2500}
              />
            </div>
          ))}

          {/* 사람 조사 5명 이상 */}
          <div className={SECTION}>
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(37,99,235,0.4)]">
                <Users className="w-4.5 h-4.5" strokeWidth={2.25} />
              </span>
              <div className="flex-1 pt-0.5 flex items-start justify-between gap-3">
                <div>
                  <p className={LABEL_LG}>나와 관련된 사람들 조사</p>
                  <p className={HELP + " mt-1"}>
                    내 잠재 고객이 이미 팔로우 중일 만한 계정 · 롤모델 · 경쟁 계정. 인스타 URL은 실제 계정 링크로 남겨 주세요.
                  </p>
                </div>
                <span className="text-[11px] text-neutral-500 shrink-0 whitespace-nowrap">
                  최소 <strong className="text-neutral-900">5명</strong>
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {people.map((p, i) => (
                <div key={i} className={NESTED_CARD}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-500">사람 {i + 1}</p>
                    {people.length > MIN_PEOPLE && (
                      <button
                        type="button"
                        onClick={() => setPeople((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-xs text-neutral-500 hover:text-red-600 inline-flex items-center gap-1"
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
                      className={INPUT}
                    />
                    <input
                      type="url"
                      value={p.instagramUrl}
                      onChange={(e) =>
                        setPeople((prev) =>
                          prev.map((x, idx) => (idx === i ? { ...x, instagramUrl: e.target.value } : x))
                        )
                      }
                      placeholder="인스타 URL"
                      className={INPUT}
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
                    className={INPUT}
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
                    className={TEXTAREA}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPeople((prev) => [...prev, { ...EMPTY_PERSON }])}
                className={ADD_BUTTON}
              >
                <Plus className="w-4 h-4" /> 사람 추가
              </button>
            </div>
          </div>

          {/* 랜딩 페이지 URL */}
          <div className={SECTION}>
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(20,184,166,0.4)]">
                <LinkIcon className="w-4.5 h-4.5" strokeWidth={2.25} />
              </span>
              <div className="flex-1 pt-0.5">
                <p className={LABEL_LG}>랜딩 페이지 URL</p>
                <p className={HELP + " mt-1"}>
                  내 상품에 대한 소개 페이지를 만들어 URL을 남겨 주세요. 인포크 · 리틀리 등 무엇이든 좋습니다. (참고 영상은 이 페이지 상단 &quot;참고 영상&quot; 섹션에 있어요.)
                </p>
              </div>
            </div>
            <input
              type="url"
              value={landingUrl}
              onChange={(e) => setLandingUrl(e.target.value)}
              placeholder="https://inpock.co.kr/... 또는 https://litt.ly/..."
              className={INPUT}
            />
          </div>

          {/* 하이라이트 4장 */}
          <div className={SECTION}>
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(219,39,119,0.4)]">
                <Layers className="w-4.5 h-4.5" strokeWidth={2.25} />
              </span>
              <div className="flex-1 pt-0.5">
                <p className={LABEL_LG}>하이라이트 스크린샷 업로드</p>
                <p className={HELP + " mt-1"}>
                  네 개의 하이라이트를 만든 뒤, 각 하이라이트를 열어서 <strong>스토리 여러 장을 한 장씩 캡처</strong>해 올려 주세요. 슬롯당 최대 {MAX_HIGHLIGHT_SHOTS_PER_SLOT}장까지 가능합니다.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {HIGHLIGHT_SLOTS.map((s) => {
                const urls = highlights[s.key] ?? [];
                const isUploading = uploadingKey === s.key;
                const reachedMax = urls.length >= MAX_HIGHLIGHT_SHOTS_PER_SLOT;
                return (
                  <div key={s.key} className="rounded-2xl border border-neutral-200/70 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-neutral-900">{s.label}</p>
                      <p className="text-[11px] text-neutral-500">
                        {urls.length} / {MAX_HIGHLIGHT_SHOTS_PER_SLOT} 장
                      </p>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {urls.map((url, i) => (
                        <div
                          key={i}
                          className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-square"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`${s.label} ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeHighlight(s.key, i)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-neutral-900/80 text-white flex items-center justify-center hover:bg-neutral-900"
                            aria-label="삭제"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-1 left-1 text-[10px] font-bold bg-black/60 text-white rounded px-1.5 py-0.5">
                            {i + 1}
                          </span>
                        </div>
                      ))}
                      {!reachedMax && (
                        <button
                          type="button"
                          onClick={() => fileRefs.current[s.key]?.click()}
                          disabled={isUploading}
                          className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 hover:bg-white flex flex-col items-center justify-center gap-1 disabled:opacity-60 transition-colors"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-[10px]">업로드 중</span>
                            </>
                          ) : (
                            <>
                              <ImagePlus className="w-4 h-4" />
                              <span className="text-[10px]">추가</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <input
                      ref={(el) => {
                        fileRefs.current[s.key] = el;
                      }}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) uploadHighlight(s.key, files);
                        const el = fileRefs.current[s.key];
                        if (el) el.value = "";
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className={SECTION}>
          <p className={LABEL_LG + " mb-3"}>숙제 답변</p>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={10}
            placeholder="이번 주 프롬프트에 맞춰 자유롭게 작성해 주세요."
            className={TEXTAREA}
            maxLength={15000}
          />
          <p className="mt-1 text-[11px] text-neutral-400 text-right">{freeText.length} / 15000</p>
        </div>
      )}

      {/* 내 인스타 URL */}
      <div className={SECTION}>
        <div className="flex items-start gap-3 mb-3">
          <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(236,72,153,0.4)]">
            <Instagram className="w-4.5 h-4.5" strokeWidth={2.25} />
          </span>
          <div className="flex-1 pt-0.5">
            <p className={LABEL_LG}>내 인스타 URL <span className="text-neutral-500 font-normal text-[13px]">(선택)</span></p>
          </div>
        </div>
        <input
          type="url"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://instagram.com/내계정"
          className={INPUT}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-2xl">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={saving || !canSubmit}
        className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-neutral-900 text-white font-bold text-base hover:bg-neutral-800 disabled:opacity-50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> 저장 중...
          </>
        ) : initial ? (
          "수정 저장하기"
        ) : (
          "숙제 제출하기"
        )}
      </button>

      {savedAt && (
        <p className="text-center text-sm text-neutral-900 inline-flex items-center gap-1.5 justify-center w-full">
          <CheckCircle2 className="w-4 h-4" />
          {initial
            ? "저장되었습니다. 마감 전까지 계속 수정할 수 있어요."
            : "제출되었습니다. 마감 후 강사 피드백을 이메일로 알려드려요."}
        </p>
      )}

      <div className="pt-2 text-center">
        <a href={`/challenge/${cohortId}`} className="text-xs text-neutral-500 hover:text-neutral-800">
          챌린지 대시보드로 돌아가기 →
        </a>
      </div>
    </div>
  );
}
