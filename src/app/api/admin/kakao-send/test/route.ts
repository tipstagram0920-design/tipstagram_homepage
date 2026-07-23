import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendMessage } from "@/lib/messaging";
import type { Channel } from "@/lib/messaging/types";

export const dynamic = "force-dynamic";

// 단일 번호로 즉시 테스트 발송 (컨택트/동의 게이팅 없이 관리자 확인용)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { channel?: string; phone?: string; body?: string; templateKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const channel = body.channel as Channel;
  if (channel !== "kakao_alimtalk" && channel !== "kakao_friendtalk") {
    return NextResponse.json({ error: "채널은 알림톡 또는 친구톡이어야 합니다." }, { status: 400 });
  }
  const phone = (body.phone || "").replace(/[^\d+]/g, "");
  if (!phone) return NextResponse.json({ error: "테스트 받을 전화번호를 입력해 주세요." }, { status: 400 });
  const text = (body.body || "").trim();
  if (!text) return NextResponse.json({ error: "메시지 내용을 입력해 주세요." }, { status: 400 });
  const templateKey = (body.templateKey || "").trim() || undefined;
  if (channel === "kakao_alimtalk" && !templateKey) {
    return NextResponse.json({ error: "알림톡은 승인된 템플릿 코드가 필요합니다." }, { status: 400 });
  }

  // contactId 없이 → 수신동의 게이팅 통과. transactional로 확실히 발송.
  const result = await sendMessage({ to: phone, body: text, channel, templateKey, transactional: true });
  return NextResponse.json(result);
}
