import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { subject, html, tags } = await req.json();
  if (!subject || !html) {
    return NextResponse.json({ error: "제목과 내용을 입력하세요." }, { status: 400 });
  }

  // Get target users
  const users = await prisma.user.findMany({
    where: tags?.length ? { tags: { hasSome: tags } } : undefined,
    select: { email: true, name: true },
  });

  if (users.length === 0) {
    return NextResponse.json({ error: "대상 회원이 없습니다." }, { status: 400 });
  }

  const results = await Promise.allSettled(
    users.map((user) =>
      resend.emails.send({
        from: `팁스타그램 <${process.env.ADMIN_EMAIL || "noreply@tipstagram.com"}>`,
        to: user.email,
        subject,
        html: html.replace("{{name}}", user.name || "회원"),
      })
    )
  );

  const success = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ success, failed, total: users.length });
}
