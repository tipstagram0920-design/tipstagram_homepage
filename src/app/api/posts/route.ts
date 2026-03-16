import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { title, content } = await req.json();
  if (!title || !content) return NextResponse.json({ error: "제목과 내용을 입력하세요." }, { status: 400 });

  const post = await prisma.post.create({
    data: { title, content, authorId: session.user.id },
  });

  return NextResponse.json(post);
}
