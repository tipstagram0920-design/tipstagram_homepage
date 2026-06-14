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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.note === "string") data.note = body.note;
  if (typeof body.phone === "string") data.phone = body.phone;
  if (typeof body.consentEmail === "boolean") data.consentEmail = body.consentEmail;
  if (typeof body.consentSms === "boolean") data.consentSms = body.consentSms;
  if (body.unsubscribe === true) data.unsubscribedAt = new Date();
  if (body.unsubscribe === false) data.unsubscribedAt = null;

  const contact = await prisma.contact.update({ where: { id }, data });
  return NextResponse.json({ contact });
}
