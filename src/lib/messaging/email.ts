import { Resend } from "resend";
import { COMPANY } from "@/lib/company";
import type { MessagingChannel, SendArgs, SendResult } from "./types";

export class ResendEmailChannel implements MessagingChannel {
  channel = "email" as const;
  provider = "resend";

  async send(args: SendArgs): Promise<SendResult> {
    if (!process.env.RESEND_API_KEY) {
      return { ok: false, error: "RESEND_API_KEY 미설정" };
    }
    const fromAddr = process.env.MAIL_FROM || "noreply@tipstagram.co.kr";
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: `${COMPANY.serviceName} <${fromAddr}>`,
        to: args.to,
        subject: args.subject || "(제목 없음)",
        html: args.body,
      });
      if (result.error) {
        return { ok: false, error: result.error.message };
      }
      return { ok: true, externalId: result.data?.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
}
