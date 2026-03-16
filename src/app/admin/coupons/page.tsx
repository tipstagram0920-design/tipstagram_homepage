import { prisma } from "@/lib/prisma";
import { CouponManageClient } from "./CouponManageClient";

async function getCoupons() {
  return await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { title: true } } },
  }).catch(() => []);
}

async function getProducts() {
  return await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, title: true },
  }).catch(() => []);
}

export default async function AdminCouponsPage() {
  const [coupons, products] = await Promise.all([getCoupons(), getProducts()]);

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-8">쿠폰 관리</h1>
      <CouponManageClient
        coupons={coupons as Parameters<typeof CouponManageClient>[0]["coupons"]}
        products={products}
      />
    </div>
  );
}
