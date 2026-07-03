import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/messaging";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { resolveAudience, type AudienceCriteria } from "./webinar-audience";
import type { Prisma } from "@prisma/client";

export type StepKind = "webinar" | "endDate";

export interface WebinarStep {
  kind: StepKind;
  offsetDays: number;        // - 또는 +
  time: string;              // "HH:MM" (KST 기준)
  subject: string;
  body: string;              // HTML, 변수 치환 지원
  templateKey?: string;
  transactional?: boolean;   // 일부 step은 거래성으로
}

const KST_OFFSET_MIN = 9 * 60; // KST = UTC+9

/**
 * 캠페인의 step이 언제 발송되어야 하는지 계산 (UTC Date).
 * time은 KST 기준으로 해석.
 */
export function computeFireAt(
  step: WebinarStep,
  webinarDate: Date,
  endDate: Date | null
): Date | null {
  const base = step.kind === "webinar" ? webinarDate : endDate;
  if (!base) return null;
  const [hh, mm] = step.time.split(":").map(Number);
  // base의 KST 날짜에서 offsetDays를 더하고, time(KST)을 적용
  const baseUtcMs = base.getTime();
  // KST의 같은 날 자정 (UTC 기준 전날 15:00)
  const kstMidnightUtcMs = baseUtcMs - ((base.getUTCHours() * 60 + base.getUTCMinutes()) - KST_OFFSET_MIN) * 60 * 1000;
  // 위 계산이 복잡 — 단순화: base에 offset 추가 후 hh:mm을 그 날 KST로 설정
  const target = new Date(base);
  target.setUTCDate(target.getUTCDate() + step.offsetDays);
  // KST hh:mm → UTC (hh - 9):mm
  let utcHour = hh - 9;
  let dayShift = 0;
  if (utcHour < 0) { utcHour += 24; dayShift = -1; }
  target.setUTCHours(utcHour, mm, 0, 0);
  target.setUTCDate(target.getUTCDate() + dayShift);
  // 위 결과는 baseUtcMs와 무관하게 hh:mm KST + offsetDays 적용된 시각
  void kstMidnightUtcMs;
  return target;
}

function diffDays(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

function formatKstDate(d: Date): string {
  const ko = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  });
  return ko.format(d);
}

interface ContactRow {
  id: string;
  name: string | null;
  email: string;
}

async function buildVars(
  contact: ContactRow,
  campaign: {
    id: string;
    webinarDate: Date;
    endDate: Date | null;
    zoomUrl?: string | null;
    salesUrl?: string | null;
    preQuestionUrl?: string | null;
    kakaoChatUrl?: string | null;
  }
): Promise<Record<string, string>> {
  const now = new Date();
  const [zoomUrl, preQUrl, consultationUrl, ebook1Url, ebook2Url, externalCheckoutUrl, kakaoChatUrl] = await Promise.all([
    getSetting(SETTING_KEYS.webinarZoomUrl),
    getSetting(SETTING_KEYS.webinarPreQuestionUrl),
    getSetting(SETTING_KEYS.consultationUrl),
    getSetting(SETTING_KEYS.ebook1Url),
    getSetting(SETTING_KEYS.ebook2Url),
    getSetting(SETTING_KEYS.externalCheckoutUrl),
    getSetting(SETTING_KEYS.kakaoChatUrl),
  ]);

  const SITE = "https://tipstagram-homepage.vercel.app";

  return {
    "{{name}}": contact.name || "회원",
    "{{email}}": contact.email,
    "{{daysToWebinar}}": String(diffDays(now, campaign.webinarDate)),
    "{{daysToEnd}}": campaign.endDate ? String(diffDays(now, campaign.endDate)) : "-",
    "{{webinarDate}}": formatKstDate(campaign.webinarDate),
    "{{endDate}}": campaign.endDate ? formatKstDate(campaign.endDate) : "-",
    // 캠페인 컬럼 > Setting > 기본값
    "{{zoomUrl}}": campaign.zoomUrl || zoomUrl || "",
    "{{preQuestionUrl}}":
      campaign.preQuestionUrl || preQUrl || `${SITE}/webinar/ask/${campaign.id}`,
    "{{salesUrl}}":
      campaign.salesUrl || externalCheckoutUrl || `${SITE}/courses`,
    "{{consultationUrl}}": consultationUrl || `${SITE}/consultation`,
    "{{ebook1Url}}": ebook1Url || "",
    "{{ebook2Url}}": ebook2Url || "",    "{{kakaoChatUrl}}": campaign.kakaoChatUrl || kakaoChatUrl || "",
  };
}

function substitute(s: string, vars: Record<string, string>): string {
  let out = s;
  for (const [k, v] of Object.entries(vars)) out = out.replaceAll(k, v);
  return out;
}

function parseSteps(raw: Prisma.JsonValue): WebinarStep[] {
  if (!Array.isArray(raw)) return [];
  return (raw as unknown[]).filter((s): s is WebinarStep => {
    if (!s || typeof s !== "object") return false;
    const x = s as Record<string, unknown>;
    return (
      (x.kind === "webinar" || x.kind === "endDate") &&
      typeof x.offsetDays === "number" &&
      typeof x.time === "string"
    );
  });
}

function parseAudience(raw: Prisma.JsonValue): AudienceCriteria {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as AudienceCriteria;
}

/**
 * Cron이 호출. 발송 시점 도래한 step을 audience에게 발송.
 */
export async function processCampaigns(maxPerCampaign = 500): Promise<{
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}> {
  const now = new Date();
  const campaigns = await prisma.webinarCampaign.findMany({ where: { isActive: true } });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const c of campaigns) {
    const steps = parseSteps(c.steps);
    if (steps.length === 0) continue;

    for (let idx = 0; idx < steps.length; idx++) {
      const step = steps[idx];
      const fireAt = computeFireAt(step, c.webinarDate, c.endDate);
      if (!fireAt) continue;
      if (fireAt > now) continue;
      // skipPast가 true이고 fireAt이 24시간 이상 지났으면 skip
      if (c.skipPast && (now.getTime() - fireAt.getTime()) > 24 * 60 * 60 * 1000) continue;

      const audience = parseAudience(c.audience);
      const contactIds = await resolveAudience(audience);
      if (contactIds.length === 0) continue;

      // 이미 발송된 contactId 제외
      const already = await prisma.webinarCampaignSend.findMany({
        where: { campaignId: c.id, stepIndex: idx, contactId: { in: contactIds } },
        select: { contactId: true },
      });
      const alreadySet = new Set(already.map((a) => a.contactId));
      const remaining = contactIds.filter((id) => !alreadySet.has(id));
      const targets = remaining.slice(0, maxPerCampaign);

      if (targets.length === 0) continue;

      const contacts = await prisma.contact.findMany({
        where: { id: { in: targets } },
        select: { id: true, email: true, name: true },
      });

      for (const ct of contacts) {
        try {
          const vars = await buildVars(ct, c);
          const subject = substitute(step.subject || "", vars);
          const body = substitute(step.body || "", vars);

          const result = await sendMessage({
            to: ct.email,
            contactId: ct.id,
            subject,
            body,
            templateKey: step.templateKey || `webinar_${c.id}_step${idx}`,
            transactional: !!step.transactional,
          });

          await prisma.webinarCampaignSend.create({
            data: {
              campaignId: c.id,
              stepIndex: idx,
              contactId: ct.id,
              status: result.ok ? "sent" : "failed",
              error: result.ok ? null : (result.error ?? null),
            },
          }).catch(() => {
            // unique 충돌 시 동시에 발송된 것 — 무시
          });

          if (result.ok) sent++;
          else failed++;
        } catch (e) {
          failed++;
          console.error("webinar send error:", e);
          await prisma.webinarCampaignSend.create({
            data: {
              campaignId: c.id,
              stepIndex: idx,
              contactId: ct.id,
              status: "failed",
              error: e instanceof Error ? e.message : String(e),
            },
          }).catch(() => {});
        }
      }

      skipped += contactIds.length - targets.length;
    }
  }

  return { processed: campaigns.length, sent, failed, skipped };
}
