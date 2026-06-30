import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { seedBroadcastsForCampaign } from "@/lib/crm/kakao-broadcast-preset";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  try {
    const result = await seedBroadcastsForCampaign(id);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "seed failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
