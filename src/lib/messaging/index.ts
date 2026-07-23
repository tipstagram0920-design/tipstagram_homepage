import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/crm/events";
import { ResendEmailChannel } from "./email";
import { SolapiKakaoChannel, SolapiFriendtalkChannel, SolapiSmsChannel } from "./kakao";
import type { Channel, MessagingChannel, SendArgs, SendResult } from "./types";

const CHANNELS: Record<Channel, MessagingChannel> = {
  email: new ResendEmailChannel(),
  kakao_alimtalk: new SolapiKakaoChannel(),
  kakao_friendtalk: new SolapiFriendtalkChannel(),
  sms: new SolapiSmsChannel(),
};

export interface SendMessageArgs extends SendArgs {
  channel?: Channel;
}

/**
 * 메시지 발송 단일 진입점.
 * - channel 지정 안 하면 email 기본 (알림톡/SMS은 Phase 2에서 fallback 체인 활성화 예정)
 * - MessageLog 자동 기록
 * - 마케팅성 메시지는 unsubscribedAt 사용자에게 차단 (transactional=true면 발송)
 * - 성공 시 Event(email_sent/kakao_sent/sms_sent) 기록
 */
export async function sendMessage(args: SendMessageArgs): Promise<SendResult> {
  const channel: Channel = args.channel || "email";
  const ch = CHANNELS[channel];

  // unsubscribed 차단 (거래성 예외)
  if (!args.transactional && args.contactId) {
    const contact = await prisma.contact.findUnique({
      where: { id: args.contactId },
      select: { unsubscribedAt: true, consentEmail: true, consentSms: true },
    });
    if (contact?.unsubscribedAt) {
      const err = "수신 거부된 컨택트입니다.";
      await logMessage({ ...args, channel, ch, status: "blocked", error: err });
      return { ok: false, error: err };
    }
    if (channel === "email" && contact && !contact.consentEmail) {
      const err = "이메일 수신 미동의";
      await logMessage({ ...args, channel, ch, status: "blocked", error: err });
      return { ok: false, error: err };
    }
    if ((channel === "kakao_alimtalk" || channel === "kakao_friendtalk" || channel === "sms")
        && contact && !contact.consentSms) {
      const err = "알림톡/문자 수신 미동의";
      await logMessage({ ...args, channel, ch, status: "blocked", error: err });
      return { ok: false, error: err };
    }
  }

  const result = await ch.send(args);

  await logMessage({
    ...args,
    channel,
    ch,
    status: result.ok ? "sent" : "failed",
    error: result.error,
    externalId: result.externalId,
  });

  if (result.ok && args.contactId) {
    const eventType =
      channel === "email" ? "email_sent"
      : channel === "sms" ? "sms_sent"
      : "kakao_sent";
    await logEvent(args.contactId, eventType, {
      templateKey: args.templateKey,
      channel,
      provider: ch.provider,
      externalId: result.externalId,
    });
  }

  return result;
}

async function logMessage(opts: {
  contactId?: string;
  to: string;
  channel: Channel;
  ch: MessagingChannel;
  subject?: string;
  body: string;
  templateKey?: string;
  status: string;
  error?: string;
  externalId?: string;
}) {
  try {
    await prisma.messageLog.create({
      data: {
        contactId: opts.contactId,
        channel: opts.channel,
        provider: opts.ch.provider,
        to: opts.to,
        subject: opts.subject,
        body: opts.body,
        templateKey: opts.templateKey,
        status: opts.status,
        error: opts.error,
        externalId: opts.externalId,
      },
    });
  } catch (e) {
    console.error("MessageLog 기록 실패:", e);
  }
}
