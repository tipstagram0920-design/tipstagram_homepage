import { NextRequest, NextResponse } from "next/server";
import { processDueRuns } from "@/lib/crm/workflow-engine";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // 미설정 시 디폴트로 허용 (개발 단계). 운영에선 반드시 설정.
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await processDueRuns(50);
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
