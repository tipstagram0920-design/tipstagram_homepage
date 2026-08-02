"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Instagram, CheckCircle2, Link as LinkIcon, ImagePlus, X, Layers, Users, Save, Film, CalendarCheck2, BarChart3, HelpCircle, Target, MapPin } from "lucide-react";

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

// ── Week 2: 바이럴 릴스 레퍼런스 → 내 릴스 ──────────────────────────
interface ReelEntry {
  viralUrl: string; // 참고한 바이럴 릴스 URL
  why: string; // 이 릴스가 왜 터졌나 (핵심 요소)
  myHook: string; // 내가 만든 후킹 (핵심 유지·변형)
  myUrl: string; // 내가 만들어 올린 릴스 URL
}
const EMPTY_REEL: ReelEntry = { viralUrl: "", why: "", myHook: "", myUrl: "" };
const MIN_REELS = 3;

interface Week2FormData {
  kind?: string;
  reels?: ReelEntry[];
}
function readWeek2FormData(formData: unknown): Week2FormData | null {
  if (!formData || typeof formData !== "object") return null;
  const fd = formData as Week2FormData;
  if (fd.kind !== "week2_viral_reels") return null;
  return fd;
}

// ── Week 3: 오프라인 1:1 진단 사전 제출 ────────────────────────────
interface Week3Reel {
  url: string; // 2주차에 올린 내 릴스
  views: string;
  saves: string;
  profileVisits: string;
  newFollows: string;
  myRead: string; // 내가 보기에 왜 이런 결과가 나왔나
}
const EMPTY_W3_REEL: Week3Reel = {
  url: "",
  views: "",
  saves: "",
  profileVisits: "",
  newFollows: "",
  myRead: "",
};
const MIN_W3_REELS = 3;
const W3_QUESTION_SLOTS = 3;
const MAX_INSIGHT_SHOTS = 10;

interface Week3Account {
  followers?: string;
  reach30d?: string;
  profileVisits30d?: string;
  mainTopic?: string;
}

interface Week3FormData {
  kind?: string;
  attend?: string; // "yes" | "no"
  preferredSlot?: string;
  attendNote?: string;
  account?: Week3Account;
  reels?: Week3Reel[];
  stuckPoint?: string;
  goal?: string;
  questions?: string[];
  insightShots?: string[];
}
function readWeek3FormData(formData: unknown): Week3FormData | null {
  if (!formData || typeof formData !== "object") return null;
  const fd = formData as Week3FormData;
  if (fd.kind !== "week3_offline_diagnosis") return null;
  return fd;
}

interface Props {
  cohortId: string;
  weekId: string;
  weekIndex: number;
  initial: Initial | null;
  /** 이미 정식 제출한 숙제인지 (임시저장 버튼 노출 여부 판단) */
  alreadySubmitted?: boolean;
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
    key: "q7_search",
    number: "Q6",
    label: "내 상품을 사기 직전에 그 사람이 검색할 단어·질문은 무엇일까요?",
    placeholder: "네이버·구글·유튜브·인스타 어디에서든 실제로 검색할 만한 실제 문장 5개 이상.",
    rows: 4,
  },
  {
    key: "q8_solved_experiences",
    number: "Q7",
    label: "소비자들의 문제를 해결했던 나의 경험들",
    placeholder:
      "실제로 고객·주변 사람의 문제를 해결해 준 사례를 구체적으로. 어떤 상황의 누구를, 어떻게 도왔고, 결과가 어땠는지.",
    rows: 5,
  },
  {
    key: "q9_customer_change",
    number: "Q8",
    label: "내 상품·서비스를 경험한 뒤 달라진 고객의 모습",
    placeholder:
      "고객이 겪은 변화를 Before → After로. 후기·수치·표정 변화 등 생생한 근거와 함께.",
    rows: 5,
  },
  {
    key: "q10_unmet_problem",
    number: "Q9",
    label: "다른 판매자들이 채워주지 못하는 소비자의 문제",
    placeholder:
      "경쟁 상품·다른 판매자가 놓치거나 해결하지 못하는 지점. 내가 그 빈틈을 어떻게 메우는지도 함께.",
    rows: 5,
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
  freeText: string,
  reels: ReelEntry[],
  w3: Required<Omit<Week3FormData, "kind">>
): string {
  if (weekIndex === 3) {
    const parts: string[] = [];
    parts.push(
      `# 오프라인 1:1 참석\n\n- 참석 여부: ${
        w3.attend === "yes" ? "참석" : w3.attend === "no" ? "불참" : "(미선택)"
      }` +
        (w3.preferredSlot.trim() ? `\n- 희망 시간대: ${w3.preferredSlot.trim()}` : "") +
        (w3.attendNote.trim() ? `\n- 남길 말: ${w3.attendNote.trim()}` : "")
    );
    const acc = w3.account;
    const accLines = [
      acc.followers?.trim() ? `- 팔로워: ${acc.followers.trim()}` : "",
      acc.reach30d?.trim() ? `- 최근 30일 도달: ${acc.reach30d.trim()}` : "",
      acc.profileVisits30d?.trim() ? `- 최근 30일 프로필 방문: ${acc.profileVisits30d.trim()}` : "",
      acc.mainTopic?.trim() ? `- 주력 주제·상품: ${acc.mainTopic.trim()}` : "",
    ].filter(Boolean);
    if (accLines.length) parts.push(`# 내 계정 현황\n\n${accLines.join("\n")}`);

    const validReels = w3.reels.filter((r) => r.url.trim());
    if (validReels.length) {
      parts.push(`# 2주차 릴스 성과 (${validReels.length}개)`);
      validReels.forEach((r, i) => {
        const lines = [`### ${i + 1}번 릴스`, `- URL: ${r.url.trim()}`];
        const metrics = [
          r.views.trim() ? `조회수 ${r.views.trim()}` : "",
          r.saves.trim() ? `저장 ${r.saves.trim()}` : "",
          r.profileVisits.trim() ? `프로필 방문 ${r.profileVisits.trim()}` : "",
          r.newFollows.trim() ? `신규 팔로우 ${r.newFollows.trim()}` : "",
        ].filter(Boolean);
        if (metrics.length) lines.push(`- 지표: ${metrics.join(" · ")}`);
        if (r.myRead.trim()) lines.push(`- 내 해석: ${r.myRead.trim()}`);
        parts.push(lines.join("\n"));
      });
    }
    if (w3.stuckPoint.trim()) parts.push(`# 지금 가장 막힌 지점\n\n${w3.stuckPoint.trim()}`);
    if (w3.goal.trim()) parts.push(`# 이번 챌린지가 끝날 때 원하는 상태\n\n${w3.goal.trim()}`);
    const qs = w3.questions.map((q) => q.trim()).filter(Boolean);
    if (qs.length) {
      parts.push(`# 20분 안에 꼭 묻고 싶은 질문 (${qs.length}개)`);
      qs.forEach((q, i) => parts.push(`${i + 1}. ${q}`));
    }
    if (w3.insightShots.length) parts.push(`# 인사이트 스크린샷 (${w3.insightShots.length}장)`);
    return parts.join("\n\n");
  }
  if (weekIndex === 2) {
    const valid = reels.filter((r) => r.viralUrl.trim() || r.myUrl.trim());
    const parts: string[] = [`# 바이럴 릴스 레퍼런스 → 내 릴스 (${valid.length}개)`];
    valid.forEach((r, i) => {
      const lines = [`### ${i + 1}번 릴스`];
      if (r.viralUrl.trim()) lines.push(`- 참고 바이럴 릴스: ${r.viralUrl.trim()}`);
      if (r.why.trim()) lines.push(`- 왜 터졌나(핵심): ${r.why.trim()}`);
      if (r.myHook.trim()) lines.push(`- 내 후킹: ${r.myHook.trim()}`);
      if (r.myUrl.trim()) lines.push(`- 내 릴스: ${r.myUrl.trim()}`);
      parts.push(lines.join("\n"));
    });
    return parts.join("\n\n");
  }
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

export function HomeworkForm({ cohortId, weekId, weekIndex, initial, alreadySubmitted }: Props) {
  const router = useRouter();
  const isWeek1 = weekIndex === 1;
  const isWeek2 = weekIndex === 2;
  const isWeek3 = weekIndex === 3;

  // 마감 전 재편집을 위해 기존 제출 내용 프리필
  const w1Initial = readWeek1FormData(initial?.formData);
  const w2Initial = readWeek2FormData(initial?.formData);
  const w3Initial = readWeek3FormData(initial?.formData);

  const [attend, setAttend] = useState<string>(w3Initial?.attend ?? "");
  const [preferredSlot, setPreferredSlot] = useState<string>(w3Initial?.preferredSlot ?? "");
  const [attendNote, setAttendNote] = useState<string>(w3Initial?.attendNote ?? "");
  const [account, setAccount] = useState<Week3Account>(w3Initial?.account ?? {});
  const [w3Reels, setW3Reels] = useState<Week3Reel[]>(
    w3Initial?.reels && w3Initial.reels.length > 0
      ? w3Initial.reels.map((r) => ({ ...EMPTY_W3_REEL, ...r }))
      : isWeek3
        ? Array.from({ length: MIN_W3_REELS }, () => ({ ...EMPTY_W3_REEL }))
        : []
  );
  const [stuckPoint, setStuckPoint] = useState<string>(w3Initial?.stuckPoint ?? "");
  const [goal, setGoal] = useState<string>(w3Initial?.goal ?? "");
  const [questions, setQuestions] = useState<string[]>(() => {
    const base = w3Initial?.questions ?? [];
    return Array.from({ length: Math.max(W3_QUESTION_SLOTS, base.length) }, (_, i) => base[i] ?? "");
  });
  const [insightShots, setInsightShots] = useState<string[]>(w3Initial?.insightShots ?? []);
  const [insightUploading, setInsightUploading] = useState(false);
  const insightFileRef = useRef<HTMLInputElement | null>(null);
  const [reels, setReels] = useState<ReelEntry[]>(
    w2Initial?.reels && w2Initial.reels.length > 0
      ? w2Initial.reels.map((r) => ({ ...EMPTY_REEL, ...r }))
      : isWeek2
        ? Array.from({ length: MIN_REELS }, () => ({ ...EMPTY_REEL }))
        : []
  );

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
  const [draftSaving, setDraftSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
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

  // Week3 인사이트 스크린샷 업로드
  const uploadInsightShots = async (files: FileList | File[]) => {
    setError("");
    const list = Array.from(files);
    if (list.length === 0) return;
    const room = MAX_INSIGHT_SHOTS - insightShots.length;
    if (room <= 0) {
      setError(`인사이트 스크린샷은 최대 ${MAX_INSIGHT_SHOTS}장까지 올릴 수 있어요.`);
      return;
    }
    setInsightUploading(true);
    try {
      for (const file of list.slice(0, room)) {
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
        setInsightShots((prev) => [...prev, data.url as string]);
      }
    } finally {
      setInsightUploading(false);
    }
  };

  // 제출까지 남은 항목 (버튼 옆 안내용)
  const missing = useMemo(() => {
    const m: string[] = [];
    if (isWeek3) {
      if (!attend) m.push("오프라인 참석 여부");
      const done = w3Reels.filter((r) => r.url.trim() && r.views.trim()).length;
      if (done < MIN_W3_REELS) m.push(`릴스 성과 ${MIN_W3_REELS - done}개 더 (URL+조회수)`);
      if (stuckPoint.trim().length < 20) m.push("막힌 지점 20자 이상");
      const qn = questions.filter((q) => q.trim()).length;
      if (qn < 2) m.push(`질문 ${2 - qn}개 더`);
      return m;
    }
    if (isWeek1) {
      if (!products.some((p) => p.name.trim() || p.description.trim())) m.push("상품 1개");
      const answered = WEEK1_QUESTIONS.filter((q) => (answers[q.key] || "").trim()).length;
      if (answered < 4) m.push(`질문 ${4 - answered}개 더`);
      const ppl = people.filter((p) => p.name.trim() || p.instagramUrl.trim()).length;
      if (ppl < MIN_PEOPLE) m.push(`사람 ${MIN_PEOPLE - ppl}명 더`);
      if (!landingUrl.trim()) m.push("랜딩 URL");
      const missSlots = HIGHLIGHT_SLOTS.filter((s) => (highlights[s.key] ?? []).length === 0);
      if (missSlots.length) m.push(`하이라이트 ${missSlots.map((s) => s.label).join("·")}`);
    } else if (isWeek2) {
      const complete = reels.filter((r) => r.viralUrl.trim() && r.myUrl.trim()).length;
      if (complete < MIN_REELS) m.push(`릴스 ${MIN_REELS - complete}개 더 (바이럴+내 릴스 URL)`);
    } else if (freeText.trim().length <= 30) {
      m.push("30자 이상 작성");
    }
    return m;
  }, [
    isWeek1,
    isWeek2,
    isWeek3,
    answers,
    freeText,
    people,
    products,
    landingUrl,
    highlights,
    reels,
    attend,
    w3Reels,
    stuckPoint,
    questions,
  ]);

  // 제출·임시저장 공통 payload 조립
  const buildPayload = () => {
    const w3 = {
      attend,
      preferredSlot,
      attendNote,
      account,
      reels: w3Reels,
      stuckPoint,
      goal,
      questions,
      insightShots,
    };
    const content = assembleContent(
      weekIndex,
      products,
      answers,
      people,
      landingUrl,
      highlights,
      freeText,
      reels,
      w3
    );
    if (isWeek3) {
      return {
        content,
        formData: {
          kind: "week3_offline_diagnosis",
          attend,
          preferredSlot: preferredSlot.trim(),
          attendNote: attendNote.trim(),
          account,
          reels: w3Reels.filter((r) => r.url.trim() || r.myRead.trim()),
          stuckPoint: stuckPoint.trim(),
          goal: goal.trim(),
          questions: questions.map((q) => q.trim()).filter(Boolean),
          insightShots,
        },
        imageUrls: insightShots,
        instagramUrl,
      };
    }
    const formData = isWeek1
      ? {
          kind: "week1_product_customer",
          products: products.filter((p) => p.name.trim() || p.description.trim()),
          answers,
          people: people.filter((p) => p.name.trim() || p.instagramUrl.trim()),
          landingUrl: landingUrl.trim(),
          highlights,
        }
      : isWeek2
        ? {
            kind: "week2_viral_reels",
            reels: reels.filter((r) => r.viralUrl.trim() || r.myUrl.trim() || r.why.trim() || r.myHook.trim()),
          }
        : { kind: "free_text", text: freeText };
    const highlightImageUrls = HIGHLIGHT_SLOTS.flatMap((s) => highlights[s.key] ?? []);
    return { content, formData, imageUrls: highlightImageUrls, instagramUrl };
  };

  // 임시 저장 — 검증 없이 현재까지 작성한 내용을 저장 (미제출 상태 유지)
  const saveDraft = async () => {
    setError("");
    setSavedAt(null);
    setDraftSaving(true);
    try {
      const res = await fetch("/api/homework/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekId, ...buildPayload(), draft: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "임시 저장 중 오류가 발생했어요.");
        return;
      }
      setDraftSavedAt(new Date().toISOString());
      router.refresh();
    } finally {
      setDraftSaving(false);
    }
  };

  const submit = async () => {
    setError("");
    if (isWeek3) {
      if (!attend) {
        setError("오프라인 1:1 참석 여부를 선택해 주세요.");
        return;
      }
      if (attend === "yes" && !preferredSlot.trim()) {
        setError("참석 시 희망 시간대를 남겨 주세요.");
        return;
      }
      const done = w3Reels.filter((r) => r.url.trim() && r.views.trim()).length;
      if (done < MIN_W3_REELS) {
        setError(
          `2주차에 올린 릴스 ${MIN_W3_REELS}개의 URL과 조회수를 채워 주세요. (현재 ${done}개)`
        );
        return;
      }
      if (stuckPoint.trim().length < 20) {
        setError("지금 가장 막힌 지점을 20자 이상 구체적으로 적어 주세요.");
        return;
      }
      const qn = questions.filter((q) => q.trim()).length;
      if (qn < 2) {
        setError(`꼭 묻고 싶은 질문을 최소 2개 이상 적어 주세요. (현재 ${qn}개)`);
        return;
      }
    } else if (isWeek1) {
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
    } else if (isWeek2) {
      const complete = reels.filter((r) => r.viralUrl.trim() && r.myUrl.trim()).length;
      if (complete < MIN_REELS) {
        setError(`릴스 ${MIN_REELS}개를 채워 주세요. 각 릴스마다 참고 바이럴 릴스 URL과 내가 만든 릴스 URL을 넣어야 해요. (현재 ${complete}개)`);
        return;
      }
    } else if (freeText.trim().length <= 30) {
      setError("숙제 내용을 30자 이상 작성해 주세요.");
      return;
    }
    setSaving(true);
    setDraftSavedAt(null);
    try {
      const res = await fetch("/api/homework/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekId, ...buildPayload() }),
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
    <div className="space-y-4 pb-28">
      {isWeek3 ? (
        <>
          {/* 1. 오프라인 1:1 참석 */}
          <div className={SECTION}>
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_10px_-4px_rgba(0,0,0,0.3)]">
                <CalendarCheck2 className="w-4.5 h-4.5" strokeWidth={2.25} />
              </span>
              <div className="flex-1 pt-0.5">
                <p className={LABEL_LG}>오프라인 1:1 진단 참석</p>
                <p className={HELP + " mt-1"}>
                  <span className="inline-flex items-center gap-1 font-semibold text-neutral-700">
                    <MapPin className="w-3 h-3" /> 서울 종로
                  </span>{" "}
                  · 1인당 20분. 이번 주는 제가 여러분 계정을 직접 뜯어보는 날이에요. 참석 여부를 먼저 알려 주세요.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { value: "yes", label: "참석합니다" },
                { value: "no", label: "참석이 어려워요" },
              ].map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setAttend(o.value)}
                  className={
                    "py-3 rounded-xl border text-sm font-bold transition-colors " +
                    (attend === o.value
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400")
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>
            {attend === "yes" && (
              <div className="mb-3">
                <label className="block text-[12px] font-semibold text-neutral-700 mb-1">희망 시간대</label>
                <input
                  type="text"
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  placeholder="예: 토요일 오후 2시~4시 사이 · 오전은 어려움"
                  className={INPUT}
                />
              </div>
            )}
            <div>
              <label className="block text-[12px] font-semibold text-neutral-700 mb-1">
                남길 말 <span className="text-neutral-400 font-normal">(선택)</span>
              </label>
              <textarea
                value={attendNote}
                onChange={(e) => setAttendNote(e.target.value)}
                rows={2}
                placeholder={
                  attend === "no"
                    ? "참석이 어려운 사정과, 대신 어떤 방식으로 진단받고 싶은지 적어 주세요."
                    : "이동 시간·동행 여부 등 미리 알아야 할 게 있다면 적어 주세요."
                }
                className={TEXTAREA}
              />
            </div>
          </div>

          {/* 2. 내 계정 현황 */}
          <div className={SECTION}>
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(37,99,235,0.4)]">
                <BarChart3 className="w-4.5 h-4.5" strokeWidth={2.25} />
              </span>
              <div className="flex-1 pt-0.5">
                <p className={LABEL_LG}>지금 내 계정 현황</p>
                <p className={HELP + " mt-1"}>
                  인스타 앱 → 프로페셔널 대시보드 → 인사이트에서 <strong>최근 30일</strong> 기준 숫자를 그대로 옮겨 주세요. 정확한 숫자가 있어야 20분을 진단에만 쓸 수 있어요.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: "followers" as const, label: "팔로워 수", ph: "예: 1,240" },
                { key: "reach30d" as const, label: "30일 도달", ph: "예: 8,500" },
                { key: "profileVisits30d" as const, label: "30일 프로필 방문", ph: "예: 420" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[12px] font-semibold text-neutral-700 mb-1">{f.label}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={account[f.key] ?? ""}
                    onChange={(e) => setAccount((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.ph}
                    className={INPUT}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-[12px] font-semibold text-neutral-700 mb-1">주력 주제 · 팔고 있는 상품</label>
              <input
                type="text"
                value={account.mainTopic ?? ""}
                onChange={(e) => setAccount((prev) => ({ ...prev, mainTopic: e.target.value }))}
                placeholder="1주차에 정한 방향에서 달라진 게 있다면 지금 기준으로 적어 주세요"
                className={INPUT}
              />
            </div>
          </div>

          {/* 3. 2주차 릴스 성과 */}
          <div className={SECTION}>
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(220,38,38,0.4)]">
                <Film className="w-4.5 h-4.5" strokeWidth={2.25} />
              </span>
              <div className="flex-1 pt-0.5 flex items-start justify-between gap-3">
                <div>
                  <p className={LABEL_LG}>2주차에 올린 릴스 성과</p>
                  <p className={HELP + " mt-1"}>
                    지난주에 만든 릴스의 <strong>실제 숫자</strong>를 넣어 주세요. 잘 된 것·안 된 것 섞여 있을수록 좋습니다. 마지막 칸에는 <strong>내가 보기에 왜 이런 결과가 나왔는지</strong> 한 줄로 적어 주세요. 정답이 아니어도 됩니다 — 그걸 제가 뜯어봅니다.
                  </p>
                </div>
                <span className="text-[11px] text-neutral-500 shrink-0 whitespace-nowrap">
                  최소 <strong className="text-neutral-900">{MIN_W3_REELS}개</strong>
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {w3Reels.map((r, i) => (
                <div key={i} className={NESTED_CARD}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-500">릴스 {i + 1}</p>
                    {w3Reels.length > MIN_W3_REELS && (
                      <button
                        type="button"
                        onClick={() => setW3Reels((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-xs text-neutral-500 hover:text-red-600 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> 삭제
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-neutral-700 mb-1">릴스 URL</label>
                    <input
                      type="url"
                      value={r.url}
                      onChange={(e) =>
                        setW3Reels((prev) => prev.map((x, idx) => (idx === i ? { ...x, url: e.target.value } : x)))
                      }
                      placeholder="https://www.instagram.com/reel/..."
                      className={INPUT}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: "views" as const, label: "조회수" },
                      { key: "saves" as const, label: "저장" },
                      { key: "profileVisits" as const, label: "프로필 방문" },
                      { key: "newFollows" as const, label: "신규 팔로우" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[12px] font-semibold text-neutral-700 mb-1">{f.label}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={r[f.key]}
                          onChange={(e) =>
                            setW3Reels((prev) =>
                              prev.map((x, idx) => (idx === i ? { ...x, [f.key]: e.target.value } : x))
                            )
                          }
                          placeholder="0"
                          className={INPUT}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-neutral-700 mb-1">
                      내가 보기에 왜 이런 결과가 나왔나 <span className="text-neutral-400 font-normal">(선택)</span>
                    </label>
                    <textarea
                      value={r.myRead}
                      onChange={(e) =>
                        setW3Reels((prev) => prev.map((x, idx) => (idx === i ? { ...x, myRead: e.target.value } : x)))
                      }
                      rows={2}
                      placeholder="후킹이 약했다 / 대상 지목이 흐렸다 / 저장은 많은데 프로필 방문이 없다 등"
                      className={TEXTAREA}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setW3Reels((prev) => [...prev, { ...EMPTY_W3_REEL }])}
                className={ADD_BUTTON}
              >
                <Plus className="w-4 h-4" /> 릴스 추가
              </button>
            </div>
          </div>

          {/* 4. 막힌 지점 + 목표 */}
          <div className={SECTION}>
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(234,88,12,0.4)]">
                <Target className="w-4.5 h-4.5" strokeWidth={2.25} />
              </span>
              <div className="flex-1 pt-0.5">
                <p className={LABEL_LG}>지금 가장 막힌 지점</p>
                <p className={HELP + " mt-1"}>
                  &ldquo;잘 안 돼요&rdquo; 말고, <strong>어디에서 무엇이 안 되는지</strong> 한 장면으로. 조회수인지, 프로필 방문인지, DM은 오는데 결제로 안 넘어가는지.
                </p>
              </div>
            </div>
            <textarea
              value={stuckPoint}
              onChange={(e) => setStuckPoint(e.target.value)}
              rows={5}
              placeholder="예: 조회수는 3천까지 나오는데 프로필 방문이 20명대라 팔로우로 이어지지 않아요. 릴스 마지막에 뭘 말해야 할지 모르겠습니다."
              className={TEXTAREA}
              maxLength={2000}
            />
            <p className="mt-1 text-[11px] text-neutral-400 text-right">{stuckPoint.length} / 2000</p>
            <div className="mt-4">
              <label className="block text-[12px] font-semibold text-neutral-700 mb-1">
                챌린지 끝날 때 원하는 상태 <span className="text-neutral-400 font-normal">(선택)</span>
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                placeholder="예: 5주차 안에 첫 결제 1건. 최소한 상담 DM 5건은 받고 싶어요."
                className={TEXTAREA}
              />
            </div>
          </div>

          {/* 5. 질문 3개 */}
          <div className={SECTION}>
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(124,58,237,0.4)]">
                <HelpCircle className="w-4.5 h-4.5" strokeWidth={2.25} />
              </span>
              <div className="flex-1 pt-0.5 flex items-start justify-between gap-3">
                <div>
                  <p className={LABEL_LG}>20분 안에 꼭 묻고 싶은 질문</p>
                  <p className={HELP + " mt-1"}>
                    현장에서 이 순서대로 답해 드립니다. 검색하면 나오는 질문 말고, <strong>내 계정이라서 생기는 질문</strong>을 적어 주세요.
                  </p>
                </div>
                <span className="text-[11px] text-neutral-500 shrink-0 whitespace-nowrap">
                  최소 <strong className="text-neutral-900">2개</strong>
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="shrink-0 mt-2.5 w-6 h-6 rounded-lg bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <textarea
                    value={q}
                    onChange={(e) =>
                      setQuestions((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
                    }
                    rows={2}
                    placeholder={
                      i === 0
                        ? "예: 제 주제로는 릴스 후킹을 어디까지 자극적으로 가도 되나요?"
                        : "궁금한 걸 그대로 적어 주세요"
                    }
                    className={TEXTAREA}
                  />
                  {questions.length > W3_QUESTION_SLOTS && (
                    <button
                      type="button"
                      onClick={() => setQuestions((prev) => prev.filter((_, idx) => idx !== i))}
                      className="shrink-0 mt-2.5 text-neutral-400 hover:text-red-600"
                      aria-label="질문 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setQuestions((prev) => [...prev, ""])}
                className={ADD_BUTTON}
              >
                <Plus className="w-4 h-4" /> 질문 추가
              </button>
            </div>
          </div>

          {/* 6. 인사이트 스크린샷 */}
          <div className={SECTION}>
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(219,39,119,0.4)]">
                <Layers className="w-4.5 h-4.5" strokeWidth={2.25} />
              </span>
              <div className="flex-1 pt-0.5">
                <p className={LABEL_LG}>
                  인사이트 스크린샷 <span className="text-neutral-500 font-normal text-[13px]">(선택)</span>
                </p>
                <p className={HELP + " mt-1"}>
                  프로페셔널 대시보드 · 릴스 인사이트 화면을 캡처해 올려주시면 현장에서 바로 같이 봅니다. 최대 {MAX_INSIGHT_SHOTS}장.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {insightShots.map((url, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-square"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`인사이트 ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setInsightShots((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-neutral-900/80 text-white flex items-center justify-center hover:bg-neutral-900"
                    aria-label="삭제"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {insightShots.length < MAX_INSIGHT_SHOTS && (
                <button
                  type="button"
                  onClick={() => insightFileRef.current?.click()}
                  disabled={insightUploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 hover:bg-white flex flex-col items-center justify-center gap-1 disabled:opacity-60 transition-colors"
                >
                  {insightUploading ? (
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
              ref={insightFileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) uploadInsightShots(files);
                if (insightFileRef.current) insightFileRef.current.value = "";
              }}
            />
          </div>
        </>
      ) : isWeek1 ? (
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
      ) : isWeek2 ? (
        <div className={SECTION}>
          <div className="flex items-start gap-3 mb-4">
            <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(220,38,38,0.4)]">
              <Film className="w-4.5 h-4.5" strokeWidth={2.25} />
            </span>
            <div className="flex-1 pt-0.5">
              <p className={LABEL_LG}>바이럴 릴스 3개 → 내 릴스로</p>
              <p className={HELP + " mt-1"}>
                터지고 있는 <strong>바이럴 릴스 3개</strong>를 찾아, <strong>왜 터졌는지 핵심</strong>을 파악하고, 그 핵심은 살린 채 <strong>내 상품·고객</strong>으로 변형해 릴스를 만들어 올리세요.
                핵심(예: &lsquo;구체적 대상 지목&rsquo;)을 지우고 껍데기만 바꾸면 안 돼요. 참고한 릴스 URL과 내가 만든 릴스 URL을 함께 남겨 주세요.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {reels.map((r, i) => (
              <div key={i} className={NESTED_CARD}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-neutral-500">릴스 {i + 1}</p>
                  {reels.length > MIN_REELS && (
                    <button
                      type="button"
                      onClick={() => setReels((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-xs text-neutral-500 hover:text-red-600 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> 삭제
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-700 mb-1">참고한 바이럴 릴스 URL</label>
                  <input
                    type="url"
                    value={r.viralUrl}
                    onChange={(e) => setReels((prev) => prev.map((x, idx) => (idx === i ? { ...x, viralUrl: e.target.value } : x)))}
                    placeholder="https://www.instagram.com/reel/..."
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-700 mb-1">이 릴스가 왜 터졌나요? <span className="text-neutral-400 font-normal">(핵심 — 선택)</span></label>
                  <textarea
                    value={r.why}
                    onChange={(e) => setReels((prev) => prev.map((x, idx) => (idx === i ? { ...x, why: e.target.value } : x)))}
                    rows={2}
                    placeholder="포맷·대상 지목·숫자·반전 중 무엇이 멈추게 했나. 그 핵심을 한 줄로."
                    className={TEXTAREA}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-700 mb-1">내 후킹 <span className="text-neutral-400 font-normal">(변형 — 선택)</span></label>
                  <input
                    type="text"
                    value={r.myHook}
                    onChange={(e) => setReels((prev) => prev.map((x, idx) => (idx === i ? { ...x, myHook: e.target.value } : x)))}
                    placeholder="핵심은 살리고 내 주제로 바꾼 첫 3초 후킹 문구"
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-700 mb-1">내가 만든 릴스 URL</label>
                  <input
                    type="url"
                    value={r.myUrl}
                    onChange={(e) => setReels((prev) => prev.map((x, idx) => (idx === i ? { ...x, myUrl: e.target.value } : x)))}
                    placeholder="https://www.instagram.com/reel/... (내 계정에 올린 릴스)"
                    className={INPUT}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setReels((prev) => [...prev, { ...EMPTY_REEL }])}
              className={ADD_BUTTON}
            >
              <Plus className="w-4 h-4" /> 릴스 추가
            </button>
          </div>
        </div>
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

      <div className="pt-2 text-center">
        <a href={`/challenge/${cohortId}`} className="text-xs text-neutral-500 hover:text-neutral-800">
          챌린지 대시보드로 돌아가기 →
        </a>
      </div>

      {/* 하단 고정 액션 바 — 작성 중 항상 저장/제출 버튼 노출 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur-md shadow-[0_-6px_20px_-8px_rgba(0,0,0,0.15)]">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          {savedAt && (
            <p className="text-xs text-center text-emerald-700 inline-flex items-center gap-1.5 justify-center w-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {alreadySubmitted
                ? "저장되었습니다. 마감 전까지 계속 수정할 수 있어요."
                : "제출되었습니다. 마감 후 강사 피드백을 이메일로 알려드려요."}
            </p>
          )}
          {!savedAt && draftSavedAt && (
            <p className="text-xs text-center text-neutral-600 inline-flex items-center gap-1.5 justify-center w-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500" />
              임시 저장됨 · 이어서 작성하고 제출하세요.
            </p>
          )}
          {!alreadySubmitted && !savedAt && missing.length > 0 && (
            <p className="text-[11px] text-center text-amber-600">
              제출까지 필요: {missing.join(" · ")}
            </p>
          )}
          <div className="flex items-center gap-2">
            {!alreadySubmitted && (
              <button
                type="button"
                onClick={saveDraft}
                disabled={draftSaving || saving}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-700 font-bold text-sm hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50"
              >
                {draftSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                임시 저장
              </button>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={saving || draftSaving}
              className={
                "inline-flex items-center justify-center gap-1.5 py-3.5 rounded-xl bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800 disabled:opacity-50 " +
                (alreadySubmitted ? "flex-1" : "flex-[2]")
              }
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "제출 중..." : alreadySubmitted ? "수정 저장하기" : "숙제 제출하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
