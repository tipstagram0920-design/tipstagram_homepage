import { prisma } from "@/lib/prisma";
import type {
  CustomerSelectData,
  FreebieKind,
  GuideContext,
  MyStoryData,
  PageUrls,
} from "@/lib/consulting-guide-data";

/** 앞 숙제로서 값을 넘겨주는 도우미들 */
const SOURCE_KEYS = [
  "my-story",
  "customer-select",
  "freebie-page",
  "proof-page",
  "faq-page",
  "landing-page",
  "link-pages",
];

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * 같은 등록(enrollment) 안에서 앞 숙제의 답을 읽어온다.
 * 숙제끼리 데이터를 넘길 때 항상 여기를 통한다 (숙제 페이지 · AI 생성 API 공통).
 */
export async function loadGuideContext(enrollmentId: string): Promise<GuideContext> {
  const tasks = await prisma.consultingTask.findMany({
    where: { enrollmentId, guideKey: { in: SOURCE_KEYS } },
    orderBy: [{ day: "asc" }, { order: "asc" }],
    select: { guideKey: true, data: true },
  });

  const pick = (key: string) =>
    (tasks.find((t) => t.guideKey === key)?.data ?? null) as Record<string, unknown> | null;

  const s = pick("my-story");
  const c = pick("customer-select");

  const story: MyStoryData | null = s
    ? {
        origin: str(s.origin),
        turningPoint: str(s.turningPoint),
        howSolved: str(s.howSolved),
        expertise: str(s.expertise),
        numbers: str(s.numbers),
      }
    : null;

  const customer: CustomerSelectData | null = c
    ? {
        myProblem: str(c.myProblem),
        myTurning: str(c.myTurning),
        myProof: str(c.myProof),
        whyThem: str(c.whyThem),
        problems: Array.isArray(c.problems) ? c.problems.map(str) : [],
        change: str(c.change),
        personaLine: str(c.personaLine),
        personaDetail: str(c.personaDetail),
        expertise: str(c.expertise),
        chosenName: str(c.chosenName),
        finalLines: Array.isArray(c.finalLines) ? c.finalLines.map(str).filter(Boolean) : [],
      }
    : null;

  // 페이지 주소 — 페이지를 만드는 숙제가 1순위, 예전 link-pages 숙제가 2순위
  const freebie = pick("freebie-page");
  const proof = pick("proof-page");
  const faq = pick("faq-page");
  const landing = pick("landing-page");
  const legacy = pick("link-pages");

  const pages: PageUrls = {
    freebieUrl: str(freebie?.url) || str(legacy?.freebieUrl),
    proofUrl: str(proof?.url) || str(legacy?.proofUrl),
    faqUrl: str(faq?.url) || str(legacy?.faqUrl),
    contactUrl: str(landing?.url) || str(legacy?.contactUrl),
  };

  const kind = str(freebie?.kind);
  const freebieKind: FreebieKind | null =
    kind === "freebie" || kind === "trial" || kind === "event" ? kind : null;

  return { story, customer, pages, freebieKind };
}

/** 내용이 하나라도 채워져 있는지 (미리 채우기 버튼 노출 판단용) */
export function hasContext(ctx: GuideContext | null | undefined): boolean {
  if (!ctx) return false;
  const vals = [
    ...Object.values(ctx.story ?? {}),
    ...Object.values(ctx.customer ?? {}),
  ];
  return vals.some((v) =>
    Array.isArray(v) ? v.some((x) => (x ?? "").trim()) : (v ?? "").toString().trim()
  );
}
