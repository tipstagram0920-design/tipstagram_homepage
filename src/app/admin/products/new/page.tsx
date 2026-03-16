import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-8">상품 등록</h1>
      <ProductForm />
    </div>
  );
}
