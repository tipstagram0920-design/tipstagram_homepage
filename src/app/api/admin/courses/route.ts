import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  return (session?.user as { role?: string })?.role === "ADMIN";
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { productId, title, sections } = await req.json();

  const course = await prisma.course.upsert({
    where: { productId },
    update: { title },
    create: { productId, title },
  });

  if (sections) {
    await prisma.section.deleteMany({ where: { courseId: course.id } });

    for (const [sIdx, section] of sections.entries()) {
      const sec = await prisma.section.create({
        data: { courseId: course.id, title: section.title, order: sIdx },
      });

      for (const [lIdx, lesson] of section.lessons.entries()) {
        await prisma.lesson.create({
          data: {
            sectionId: sec.id,
            title: lesson.title,
            vimeoId: lesson.vimeoId || null,
            duration: lesson.duration || null,
            isFree: lesson.isFree || false,
            order: lIdx,
          },
        });
      }
    }
  }

  return NextResponse.json(course);
}
