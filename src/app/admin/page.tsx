import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Users, ShoppingBag, DollarSign, FileText } from "lucide-react";

async function getStats() {
  try {
    const [userCount, productCount, purchaseSum, postCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.purchase.aggregate({ _sum: { amount: true } }),
      prisma.post.count(),
    ]);
    return {
      users: userCount,
      products: productCount,
      revenue: purchaseSum._sum?.amount || 0,
      posts: postCount,
    };
  } catch {
    return { users: 0, products: 0, revenue: 0, posts: 0 };
  }
}

async function getRecentPurchases() {
  return await prisma.purchase.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { title: true } },
    },
  }).catch(() => []);
}

async function getRecentUsers() {
  return await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true, tags: true },
  }).catch(() => []);
}

export default async function AdminDashboard() {
  const [stats, recentPurchases, recentUsers] = await Promise.all([
    getStats(),
    getRecentPurchases(),
    getRecentUsers(),
  ]);

  const statCards = [
    { label: "전체 회원", value: stats.users.toLocaleString(), icon: Users, color: "from-purple-500 to-pink-500" },
    { label: "활성 상품", value: stats.products.toLocaleString(), icon: ShoppingBag, color: "from-pink-500 to-orange-500" },
    { label: "총 매출", value: formatPrice(stats.revenue), icon: DollarSign, color: "from-orange-500 to-yellow-500" },
    { label: "게시글", value: stats.posts.toLocaleString(), icon: FileText, color: "from-blue-500 to-purple-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-8">대시보드</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-black text-neutral-900">{value}</div>
            <div className="text-sm text-neutral-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h2 className="font-bold text-neutral-900 mb-4">최근 결제</h2>
          {recentPurchases.length === 0 ? (
            <p className="text-sm text-neutral-400">결제 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {recentPurchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{p.user.name}</p>
                    <p className="text-xs text-neutral-400">{p.product.title}</p>
                  </div>
                  <span className="text-sm font-bold text-neutral-900">{formatPrice(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h2 className="font-bold text-neutral-900 mb-4">최근 가입</h2>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-neutral-400">가입 회원이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full ig-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {u.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{u.name}</p>
                    <p className="text-xs text-neutral-400">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
