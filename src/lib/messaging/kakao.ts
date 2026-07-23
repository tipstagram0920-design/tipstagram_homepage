import { SolapiMessageService } from "solapi";
import { getSetting } from "@/lib/settings";
import type { MessagingChannel, SendArgs, SendResult } from "./types";

/**
 * Solapi 알림톡(KakaoOption) / 친구톡 / SMS 어댑터.
 *
 * 필요한 설정 (Setting 또는 env):
 * - SOLAPI_API_KEY, SOLAPI_API_SECRET
 * - SOLAPI_SENDER_NUMBER (등록된 발신번호, 알림톡 fallback)
 * - SOLAPI_KAKAO_PFID (카카오 채널 식별자 = pfId)
 * - 알림톡 발송 시: SendArgs.templateKey 또는 templateExternalId 가 카카오 사전등록 템플릿 코드여야 함
 */

async function getCfg() {
  const apiKey = (await getSetting("solapi_api_key")) || process.env.SOLAPI_API_KEY;
  const apiSecret = (await getSetting("solapi_api_secret")) || process.env.SOLAPI_API_SECRET;
  const sender = (await getSetting("solapi_sender_number")) || process.env.SOLAPI_SENDER_NUMBER;
  const pfId = (await getSetting("solapi_kakao_pfid")) || process.env.SOLAPI_KAKAO_PFID;
  return { apiKey, apiSecret, sender, pfId };
}

function makeService(apiKey?: string, apiSecret?: string) {
  if (!apiKey || !apiSecret) return null;
  return new SolapiMessageService(apiKey, apiSecret);
}

export class SolapiKakaoChannel implements MessagingChannel {
  channel = "kakao_alimtalk" as const;
  provider = "solapi";

  async send(args: SendArgs): Promise<SendResult> {
    const cfg = await getCfg();
    const svc = makeService(cfg.apiKey, cfg.apiSecret);
    if (!svc) return { ok: false, error: "Solapi API 키 미설정" };
    if (!cfg.sender) return { ok: false, error: "Solapi 발신번호 미설정" };
    if (!cfg.pfId) return { ok: false, error: "카카오 채널 pfId 미설정" };

    // 알림톡: 사전등록 템플릿 코드 필요. SendArgs.templateKey를 templateId로 사용.
    if (!args.templateKey) {
      return { ok: false, error: "알림톡 발송은 templateKey(카카오 템플릿 코드)가 필요합니다." };
    }

    try {
      const res = await svc.send({
        to: normalizePhone(args.to),
        from: cfg.sender,
        text: args.body,
        kakaoOptions: {
          pfId: cfg.pfId,
          templateId: args.templateKey,
          disableSms: true, // 카카오톡만 발송(실패 시 SMS로 새어나가지 않게)
        },
      });
      return { ok: true, externalId: res.groupInfo?.groupId };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
}

/**
 * 카카오 친구톡: 사전등록 템플릿 없이 자유 텍스트 발송(마케팅성).
 * 단, 발신 카카오 채널(@팁스타그램)을 '친구 추가'한 번호에만 도달한다.
 */
export class SolapiFriendtalkChannel implements MessagingChannel {
  channel = "kakao_friendtalk" as const;
  provider = "solapi";

  async send(args: SendArgs): Promise<SendResult> {
    const cfg = await getCfg();
    const svc = makeService(cfg.apiKey, cfg.apiSecret);
    if (!svc) return { ok: false, error: "Solapi API 키 미설정" };
    if (!cfg.sender) return { ok: false, error: "Solapi 발신번호 미설정" };
    if (!cfg.pfId) return { ok: false, error: "카카오 채널 pfId 미설정" };

    try {
      const res = await svc.send({
        to: normalizePhone(args.to),
        from: cfg.sender,
        text: args.body,
        kakaoOptions: {
          pfId: cfg.pfId,
          // 친구톡은 templateId 없이 발송. 채널 친구가 아니면 실패하므로 SMS fallback 비활성.
          disableSms: true,
        },
      });
      return { ok: true, externalId: res.groupInfo?.groupId };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
}

export class SolapiSmsChannel implements MessagingChannel {
  channel = "sms" as const;
  provider = "solapi";

  async send(args: SendArgs): Promise<SendResult> {
    const cfg = await getCfg();
    const svc = makeService(cfg.apiKey, cfg.apiSecret);
    if (!svc) return { ok: false, error: "Solapi API 키 미설정" };
    if (!cfg.sender) return { ok: false, error: "Solapi 발신번호 미설정" };

    try {
      const res = await svc.send({
        to: normalizePhone(args.to),
        from: cfg.sender,
        text: args.body,
      });
      return { ok: true, externalId: res.groupInfo?.groupId };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
}

function normalizePhone(p: string) {
  // 한국 번호 정규화: 하이픈/공백 제거. +82 → 0 변환
  let s = p.replace(/[^\d+]/g, "");
  if (s.startsWith("+82")) s = "0" + s.slice(3);
  return s;
}
