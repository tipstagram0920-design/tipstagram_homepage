import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { UserManageClient } from "./UserManageClient";

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      purchases: { include: { product: { select: { title: true } } } },
      _count: { select: { purchases: true } },
    },
  }).catch(() => []);
}

async function getProducts() {
  return await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, title: true },
    orderBy: { order: "asc" },
  }).catch(() => []);
}

export default async function AdminUsersPage() {
  const [users, products] = await Promise.all([getUsers(), getProducts()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">회원 관리</h1>
          <p className="text-neutral-500 text-sm mt-1">전체 {users.length}명</p>
        </div>
      </div>
      <UserManageClient
        users={users as Parameters<typeof UserManageClient>[0]["users"]}
        products={products}
      />
    </div>
  );
}
