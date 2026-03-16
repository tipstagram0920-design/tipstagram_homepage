import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserEditClient } from "./UserEditClient";

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, tags: true },
  }).catch(() => null);

  if (!user) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-8">회원 정보 수정</h1>
      <UserEditClient user={user} />
    </div>
  );
}
