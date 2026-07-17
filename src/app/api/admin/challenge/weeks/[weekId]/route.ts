import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

const extractFirstUrl = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  const m = trimmed.match(/https?:\/\/\S+/);
  return m ? m[0] : trimmed;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const { weekId } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.homeworkPrompt === "string") data.homeworkPrompt = body.homeworkPrompt;
  if (body.openAt) data.openAt = new Date(body.openAt);
  if (body.homeworkDueAt) data.homeworkDueAt = new Date(body.homeworkDueAt);
  if (body.liveAt !== undefined)
    data.liveAt = body.liveAt ? new Date(body.liveAt) : null;
  if (body.zoomUrl !== undefined) data.zoomUrl = extractFirstUrl(body.zoomUrl);
  if (body.recordingUrl !== undefined) data.recordingUrl = extractFirstUrl(body.recordingUrl);
  if (body.recommendedLessonIds !== undefined) data.recommendedLessonIds = body.recommendedLessonIds;
  if (body.externalVideos !== undefined) {
    // 배열 · [{ title, url, description? }] 만 통과
    const arr = Array.isArray(body.externalVideos) ? body.externalVideos : [];
    data.externalVideos = arr
      .map((v: unknown) => {
        if (!v || typeof v !== "object") return null;
        const rec = v as Record<string, unknown>;
        const url = extractFirstUrl(rec.url);
        if (!url) return null;
        return {
          title: typeof rec.title === "string" ? rec.title.slice(0, 200) : "",
          url,
          description:
            typeof rec.description === "string" ? rec.description.slice(0, 500) : undefined,
        };
      })
      .filter(Boolean);
  }
  if (body.materials !== undefined) {
    // 배열 · [{ title, url, filename, size? }] 만 통과
    const arr = Array.isArray(body.materials) ? body.materials : [];
    data.materials = arr
      .map((v: unknown) => {
        if (!v || typeof v !== "object") return null;
        const rec = v as Record<string, unknown>;
        const url = extractFirstUrl(rec.url);
        if (!url) return null;
        return {
          title: typeof rec.title === "string" ? rec.title.slice(0, 200) : "",
          url,
          filename: typeof rec.filename === "string" ? rec.filename.slice(0, 300) : "",
          size: typeof rec.size === "number" ? rec.size : undefined,
        };
      })
      .filter(Boolean);
  }
  const week = await prisma.challengeWeek.update({ where: { id: weekId }, data });
  return NextResponse.json({ week });
}
