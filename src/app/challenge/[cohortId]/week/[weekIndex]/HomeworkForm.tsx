"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ImagePlus, X, Plus, Trash2, Instagram, CheckCircle2 } from "lucide-react";

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

// Week 1 · "내 상품과 소비자 찾기" 질문 5개
const WEEK1_QUESTIONS = [
  {
    key: "q1_product",
    label: "Q1. 지금 팔고 싶은 것(상품·서비스·콘텐츠)은 무엇인가요?",
    placeholder: "예: 온라인 필라테스 4주 프로그램, 인스타 그로스 컨설팅, 홈베이킹 원데이 클래스…",
    rows: 3,
  },
  {
    key: "q2_problem",
    label: "Q2. 이 상품이 해결하는 진짜 문제 하나를 한 문장으로 써 주세요.",
    placeholder: "예: 헬스장에 오래 있어도 자세가 잘못돼 오히려 다치는 30대 여성의 통증을 잡아준다.",
    rows: 3,
  },
  {
    key: "q3_persona",
    label: "Q3. 누구를 위한 상품인가요? 그 사람은 지금 어떤 하루를 살고 있나요?",
    placeholder: "나이·직업·상황·주요 고민·평일 저녁의 흔한 풍경까지 구체적으로 그려 주세요.",
    rows: 5,
  },
  {
    key: "q4_influences",
    label: "Q4. 그 사람이 이미 팔로우하고 있을 만한 인스타 계정 3~5개는 무엇인가요?",
    placeholder: "각 계정을 한 줄씩 · 왜 그 계정을 팔로우할지 짧게 이유도 함께",
    rows: 4,
  },
  {
    key: "q5_search",
    label: "Q5. 내 상품을 사기 직전에 그 사람이 검색할 단어·질문은 무엇일 것 같나요?",
    placeholder: "네이버·구글·유튜브·인스타 어디에서든 검색할 만한 실제 문장 5개 이상.",
    rows: 4,
  },
] as const;

type QAnswers = Record<string, string>;

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

/** initial content(자동 조립된 텍스트)에서 formData 파싱 시도 (재제출 시 폼 복원용). */
function parseInitialFormData(content: string): { answers: QAnswers; people: PersonEntry[] } | null {
  // v1은 content에 자동 조립된 텍스트만 넣어두므로 여기서 파싱하지 않음.
  // (initial content가 자유 서술일 수 있으므로) 대신 formData는 서버가 원본 그대로 저장하는 별도 컬럼이라
  // 클라이언트에서 formData 원본을 다시 받으려면 별도 fetch 필요. v1은 재제출 시 처음부터 다시 입력하도록.
  void content;
  return null;
}

function assembleContent(
  weekIndex: number,
  answers: QAnswers,
  people: PersonEntry[],
  freeText: string
): string {
  if (weekIndex === 1) {
    const parts: string[] = [];
    for (const q of WEEK1_QUESTIONS) {
      const a = (answers[q.key] || "").trim();
      if (!a) continue;
      parts.push(`# ${q.label}\n\n${a}`);
    }
    const validPeople = people.filter((p) => p.name.trim() || p.instagramUrl.trim());
    if (validPeople.length > 0) {
      parts.push(`\n# 🔍 나와 관련된 사람들 조사`);
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

  const [answers, setAnswers] = useState<QAnswers>(() => {
    const parsed = initial ? parseInitialFormData(initial.content) : null;
    return parsed?.answers ?? {};
  });
  const [people, setPeople] = useState<PersonEntry[]>(() => {
    const parsed = initial ? parseInitialFormData(initial.content) : null;
    return parsed?.people ?? (isWeek1 ? [{ ...EMPTY_PERSON }] : []);
  });
  const [freeText, setFreeText] = useState<string>(!isWeek1 ? initial?.content ?? "" : "");
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.imageUrls ?? []);
  const [instagramUrl, setInstagramUrl] = useState<string>(initial?.instagramUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 첨부할 수 있어요.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("10MB 이하 이미지만 첨부할 수 있어요.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/homework/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "업로드 실패");
        return;
      }
      setImageUrls((prev) => [...prev, data.url]);
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = useMemo(() => {
    if (isWeek1) {
      const answered = WEEK1_QUESTIONS.filter((q) => (answers[q.key] || "").trim().length > 0).length;
      return answered >= 3;
    }
    return freeText.trim().length > 30;
  }, [isWeek1, answers, freeText]);

  const submit = async () => {
    setError("");
    if (!canSubmit) {
      setError(
        isWeek1
          ? "최소 3개 질문에 답변해 주세요."
          : "숙제 내용을 30자 이상 작성해 주세요."
      );
      return;
    }
    setSaving(true);
    try {
      const content = assembleContent(weekIndex, answers, people, freeText);
      const formData = isWeek1
        ? {
            kind: "week1_product_customer",
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
          imageUrls,
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
      {/* Week 1 특화: 질문 답변 */}
      {isWeek1 && (
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
                maxLength={2000}
              />
            </div>
          ))}

          {/* 사람 조사 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-white">
                🔍 나와 관련된 사람들 조사
              </label>
              <span className="text-xs text-white/50">
                내 잠재 고객이 이미 팔로우 중인 계정 · 롤모델 · 경쟁 계정 등 3~5명
              </span>
            </div>
            <div className="space-y-3">
              {people.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white/60">사람 {i + 1}</p>
                    {people.length > 1 && (
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
                        setPeople((prev) => prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))
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
                      setPeople((prev) => prev.map((x, idx) => (idx === i ? { ...x, followerRange: e.target.value } : x)))
                    }
                    placeholder="팔로워 규모 (예: 1만~5만)"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400"
                  />
                  <textarea
                    value={p.learning}
                    onChange={(e) =>
                      setPeople((prev) => prev.map((x, idx) => (idx === i ? { ...x, learning: e.target.value } : x)))
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
        </div>
      )}

      {/* Week 2 이후: 자유 서술 */}
      {!isWeek1 && (
        <div>
          <label className="block text-sm font-bold text-white mb-2">숙제 답변</label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={10}
            placeholder="이번 주 숙제 프롬프트에 맞춰 자유롭게 작성해 주세요."
            className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-400 focus:bg-white/[0.08] resize-none"
            maxLength={15000}
          />
          <p className="mt-1 text-[11px] text-white/40 text-right">{freeText.length} / 15000</p>
        </div>
      )}

      {/* 이미지 첨부 */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">
          📎 이미지 첨부 (선택 · 조사한 계정의 스크린샷·프로필 캡처 등)
        </label>
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {imageUrls.map((url, i) => (
              <div key={url + i} className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`업로드 ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                  aria-label="삭제"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full py-3 rounded-xl border-2 border-dashed border-white/20 text-white/60 hover:border-pink-400 hover:text-white flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> 업로드 중...
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4" /> 이미지 추가 (JPG · PNG · 10MB 이하)
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);
            if (fileRef.current) fileRef.current.value = "";
          }}
        />
      </div>

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
        disabled={saving || uploading}
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

      {/* 참여자 유입 유도 라벨 (cohort 링크) */}
      <div className="pt-2 text-center">
        <a
          href={`/challenge/${cohortId}`}
          className="text-xs text-white/40 hover:text-white/70"
        >
          챌린지 대시보드로 돌아가기 →
        </a>
      </div>
    </div>
  );
}
