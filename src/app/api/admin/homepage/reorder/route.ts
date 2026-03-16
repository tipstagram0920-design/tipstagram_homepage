import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ids: ordered array of block IDs
  const { ids } = await req.json();
  await Promise.all(ids.map((id: string, order: number) =>
    prisma.homepageBlock.update({ where: { id }, data: { order } })
  ));
  return NextResponse.json({ ok: true });
}
