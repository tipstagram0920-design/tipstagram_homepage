import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/messaging";
import { logEvent } from "./events";
import { COMPANY } from "@/lib/company";
import { buildEbookLivePromoEmail } from "@/app/api/ebook/_email";
import type { Channel } from "@/lib/messaging/types";
import type { Prisma } from "@prisma/client";

export type Trigger =
  | "live_signup"
  | "register"
  | "purchase"
  | "lesson_complete"
  | "ebook_step1"
  | "freebie_signup";

/**
 * 코드로 관리하는 내장 메일 템플릿. step.templateKey가 여기 매칭되면
 * EmailTemplate DB 조회 대신 이 본문을 사용한다. {{name}} 등 변수는
 * executeStep의 치환 로직이 발송 직전에 처리한다.
 */
const BUILTIN_TEMPLATES: Record<
  string,
  () => { subject: string; html: string }
> = {
  ebook1_live_promo: () => ({
    subject: `[${COMPANY.serviceName}] {{name}}님, 무료 라이브에 초대합니다 🔴`,
    html: buildEbookLivePromoEmail({ name: "{{name}}" }),
  }),
};

export interface WorkflowStep {
  /** 직전 step부터의 지연 시간(분) */
  delayMinutes: number;
  /** "send_message" | "add_tag" */
  action?: "send_message" | "add_tag";
  channel?: Channel;
  templateKey?: string; // EmailTemplate.type 매칭
  /** 직접 본문 사용 (templateKey 우선) */
  subject?: string;
  body?: string;
  tags?: string[]; // action=add_tag 일 때
}

export interface WorkflowConditions {
  /** 특정 상품(productId) 트리거에만 매칭 */
  productId?: string;
  /** 회원 태그 중 하나라도 일치 시 매칭 */
  tagsAny?: string[];
}

/**
 * 트리거 발생 시 매칭되는 활성 워크플로우의 WorkflowRun을 enqueue.
 */
export async function triggerWorkflow(
  trigger: Trigger,
  contactId: string,
  context: Record<string, unknown> = {}
) {
  const workflows = await prisma.workflow.findMany({
    where: { trigger, isActive: true },
  });

  for (const wf of workflows) {
    if (!matchesConditions(wf.conditions, context, contactId)) continue;
    const steps = parseSteps(wf.steps);
    if (steps.length === 0) continue;

    // 같은 컨택트에 같은 워크플로우가 이미 진행 중이면 스킵
    const already = await prisma.workflowRun.findFirst({
      where: { workflowId: wf.id, contactId, status: "pending" },
    });
    if (already) continue;

    const firstDelay = Math.max(0, steps[0].delayMinutes);
    await prisma.workflowRun.create({
      data: {
        workflowId: wf.id,
        contactId,
        currentStep: 0,
        nextRunAt: new Date(Date.now() + firstDelay * 60 * 1000),
        status: "pending",
        context: context as Prisma.InputJsonValue,
      },
    });
  }
}

function matchesConditions(
  raw: Prisma.JsonValue,
  context: Record<string, unknown>,
  contactId: string
): boolean {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return true;
  const c = raw as WorkflowConditions;
  if (c.productId && context.productId !== c.productId) return false;
  if (c.tagsAny && c.tagsAny.length > 0) {
    // contact의 user.tags와 OR 매칭은 워크플로우 실행 시점에 따로 검사
    // 여기서는 contactId만 전달, 실제 매칭은 비동기로 보강 가능
    // MVP: tagsAny 조건은 무시 (Phase 2에서 강화)
    return true;
  }
  return true;
}

function parseSteps(raw: Prisma.JsonValue): WorkflowStep[] {
  if (!Array.isArray(raw)) return [];
  return (raw as unknown[]).filter((s): s is WorkflowStep =>
    !!s && typeof s === "object"
  );
}

/**
 * Vercel Cron이 호출. nextRunAt이 도래한 pending run들을 처리.
 */
export async function processDueRuns(maxBatch = 50) {
  const now = new Date();
  const runs = await prisma.workflowRun.findMany({
    where: {
      status: "pending",
      nextRunAt: { lte: now },
    },
    include: {
      workflow: true,
      contact: { select: { id: true, email: true, name: true, unsubscribedAt: true } },
    },
    take: maxBatch,
  });

  const results: { runId: string; ok: boolean; error?: string }[] = [];

  for (const run of runs) {
    const steps = parseSteps(run.workflow.steps);
    const step = steps[run.currentStep];

    if (!step) {
      // 잘못된 step 인덱스 — 종료
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: { status: "completed", completedAt: new Date() },
      });
      continue;
    }

    try {
      await executeStep(step, run.contact, run.context as Record<string, unknown>);
      const next = run.currentStep + 1;
      if (next >= steps.length) {
        await prisma.workflowRun.update({
          where: { id: run.id },
          data: { status: "completed", completedAt: new Date() },
        });
      } else {
        const nextDelay = Math.max(0, steps[next].delayMinutes);
        await prisma.workflowRun.update({
          where: { id: run.id },
          data: {
            currentStep: next,
            nextRunAt: new Date(Date.now() + nextDelay * 60 * 1000),
          },
        });
      }
      results.push({ runId: run.id, ok: true });
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: "failed",
          completedAt: new Date(),
          context: {
            ...((run.context as Record<string, unknown>) ?? {}),
            error: err,
          } as Prisma.InputJsonValue,
        },
      });
      results.push({ runId: run.id, ok: false, error: err });
    }
  }

  return { processed: runs.length, results };
}

async function executeStep(
  step: WorkflowStep,
  contact: { id: string; email: string; name: string | null },
  context: Record<string, unknown>
) {
  const action = step.action ?? "send_message";

  if (action === "add_tag") {
    if (!step.tags || step.tags.length === 0) return;
    // Contact.tags 우선 부여 (회원·비회원 모두). 회원이면 User.tags도 동기화.
    const c = await prisma.contact.findUnique({
      where: { id: contact.id },
      select: { tags: true },
    });
    if (c) {
      const newTags = Array.from(new Set([...c.tags, ...step.tags]));
      if (newTags.length !== c.tags.length) {
        await prisma.contact.update({ where: { id: contact.id }, data: { tags: newTags } });
      }
    }
    const user = await prisma.user.findUnique({
      where: { contactId: contact.id },
      select: { id: true, tags: true },
    });
    if (user) {
      const newUserTags = Array.from(new Set([...user.tags, ...step.tags]));
      if (newUserTags.length !== user.tags.length) {
        await prisma.user.update({ where: { id: user.id }, data: { tags: newUserTags } });
      }
    }
    await logEvent(contact.id, "tag_added", { tags: step.tags, via: "workflow" });
    return;
  }

  // send_message (default)
  const channel: Channel = step.channel ?? "email";
  let subject = step.subject ?? "";
  let body = step.body ?? "";

  if (step.templateKey && BUILTIN_TEMPLATES[step.templateKey]) {
    const builtin = BUILTIN_TEMPLATES[step.templateKey]();
    subject = builtin.subject;
    body = builtin.html;
  } else if (step.templateKey) {
    const tpl = await prisma.emailTemplate.findFirst({
      where: { type: step.templateKey, isActive: true },
      orderBy: { productId: "desc" },
    });
    if (tpl) {
      subject = tpl.subject;
      body = tpl.html;
    }
  }

  // 변수 치환
  const vars: Record<string, string> = {
    "{{name}}": contact.name || "회원",
    "{{email}}": contact.email,
  };
  if (typeof context.productTitle === "string") vars["{{product}}"] = context.productTitle;
  if (typeof context.amount === "number")
    vars["{{amount}}"] = new Intl.NumberFormat("ko-KR").format(context.amount) + "원";

  for (const [k, v] of Object.entries(vars)) {
    subject = subject.replaceAll(k, v);
    body = body.replaceAll(k, v);
  }

  if (!subject && !body) {
    throw new Error("step에 subject/body 또는 templateKey가 없습니다");
  }

  const result = await sendMessage({
    to: contact.email,
    contactId: contact.id,
    subject,
    body,
    templateKey: step.templateKey,
    channel,
  });

  if (!result.ok) throw new Error(result.error || "발송 실패");
}
