export type Channel = "email" | "kakao_alimtalk" | "kakao_friendtalk" | "sms";

export interface SendArgs {
  to: string;
  subject?: string;
  body: string;
  templateKey?: string;
  contactId?: string;
  /** 거래성(구매확인 등)은 unsubscribed 사용자에게도 발송. 기본 false(=마케팅성) */
  transactional?: boolean;
}

export interface SendResult {
  ok: boolean;
  externalId?: string;
  error?: string;
}

export interface MessagingChannel {
  channel: Channel;
  provider: string;
  send(args: SendArgs): Promise<SendResult>;
}
