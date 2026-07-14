import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * 챌린지 참여자만 이미지를 업로드할 수 있는 게이트 있는 업로드 API.
 * 경로: uploads/homework/{userId}/…
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // 챌린지 계열 상품을 유효 구매한 사용자만 허용
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: session.user.id,
      refundedAt: null,
      product: { slug: { in: ["5-week-challenge", "5-week-challenge-plus-consulting"] } },
    },
    select: { id: true },
  });
  if (!purchase) {
    return NextResponse.json({ error: "챌린지 참여자만 업로드할 수 있어요." }, { status: 403 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "스토리지 설정이 없습니다." }, { status: 503 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "이미지 파일만 업로드 가능합니다." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "파일 크기는 10MB 이하만 가능합니다." }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `homework/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from("uploads")
    .upload(filename, buffer, { contentType: file.type, upsert: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from("uploads").getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
