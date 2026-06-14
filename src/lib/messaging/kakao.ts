import type { MessagingChannel, SendArgs, SendResult } from "./types";

/**
 * Solapi 알림톡/친구톡 어댑터. 현재는 placeholder.
 * 실제 발송 시 @solapi/solapi-nodejs 패키지를 설치하고 인터페이스 구현.
 */
export class SolapiKakaoChannel implements MessagingChannel {
  channel = "kakao_alimtalk" as const;
  provider = "solapi";

  async send(_args: SendArgs): Promise<SendResult> {
    if (!process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET) {
      return { ok: false, error: "SOLAPI API 키 미설정" };
    }
    // TODO: Solapi SDK 통합 (Phase 1 후반)
    return { ok: false, error: "알림톡 채널은 아직 구현되지 않았습니다." };
  }
}

export class SolapiSmsChannel implements MessagingChannel {
  channel = "sms" as const;
  provider = "solapi";

  async send(_args: SendArgs): Promise<SendResult> {
    if (!process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET) {
      return { ok: false, error: "SOLAPI API 키 미설정" };
    }
    return { ok: false, error: "SMS 채널은 아직 구현되지 않았습니다." };
  }
}
