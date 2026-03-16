import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { ClassroomClient } from "./ClassroomClient";

async function getClassroomData(userId: string, slug: string) {
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      product: { slug },
    },
    include: {
      product: {
        include: {
          course: {
            include: {
              sections: {
                orderBy: { order: "asc" },
                include: {
                  lessons: { orderBy: { order: "asc" } },
                },
              },
            },
          },
        },
      },
    },
  });
  return purchase;
}

export default async function ClassroomCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?redirect=/classroom/${slug}`);
  }

  const purchase = await getClassroomData(session.user.id, slug).catch(() => null);
  if (!purchase) notFound();

  const progresses = await prisma.progress.findMany({
    where: { userId: session.user.id },
  }).catch(() => []);

  const progressMap = Object.fromEntries(
    progresses.map((p) => [p.lessonId, p.completed])
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ClassroomClient
        product={purchase.product as Parameters<typeof ClassroomClient>[0]["product"]}
        progressMap={progressMap}
        userId={session.user.id}
      />
    </div>
  );
}
