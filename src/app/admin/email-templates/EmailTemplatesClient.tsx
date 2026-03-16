"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Save, ToggleLeft, ToggleRight, Mail, Info, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
}

interface EmailTemplate {
  id: string;
  type: string;
  productId: string | null;
  name: string;
  subject: string;
  html: string;
  isActive: boolean;
  updatedAt: Date;
  product?: { id: string; title: string } | null;
}

const TEMPLATE_TYPES = [
  {
    type: "purchase_confirmation",
    label: "구매 완료 이메일",
    description: "상품 결제 완료 시 자동 발송",
    variables: ["{{name}}", "{{product}}", "{{amount}}", "{{orderId}}"],
    defaultSubject: "{{product}} 구매가 완료되었습니다!",
    defaultHtml: `<p>안녕하세요 {{name}}님,</p>
<p>팁스타그램 강의 구매가 완료되었습니다. 🎉</p>
<br/>
<p><strong>주문 정보</strong></p>
<p>강의명: {{product}}</p>
<p>결제 금액: {{amount}}</p>
<p>주문 번호: {{orderId}}</p>
<br/>
<p>지금 바로 강의실에서 학습을 시작해보세요!</p>
<p><a href="/classroom">강의실 바로가기 →</a></p>
<br/>
<p>감사합니다,<br/>팁스타그램 팀</p>`,
  },
  {
    type: "welcome",
    label: "회원가입 환영 이메일",
    description: "신규 회원가입 완료 시 자동 발송",
    variables: ["{{name}}"],
    defaultSubject: "팁스타그램에 오신 것을 환영합니다!",
    defaultHtml: `<p>안녕하세요 {{name}}님,</p>
<p>팁스타그램 가입을 진심으로 환영합니다! 🎊</p>
<br/>
<p>지금 바로 강의를 둘러보세요!</p>
<p><a href="/courses">강의 목록 보기 →</a></p>
<br/>
<p>감사합니다,<br/>팁스타그램 팀</p>`,
  },
];

function TemplateEditor({
  templateType,
  existing,
  products,
  onSave,
  onDelete,
}: {
  templateType: (typeof TEMPLATE_TYPES)[0];
  existing?: EmailTemplate;
  products: Product[];
  onSave: (template: EmailTemplate) => void;
  onDelete?: (id: string) => void;
}) {
  const [subject, setSubject] = useState(existing?.subject || templateType.defaultSubject);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: existing?.html || templateType.defaultHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content ProseMirror focus:outline-none min-h-[240px] px-1",
      },
    },
  });

  const handleSave = async () => {
    if (!subject || !editor?.getHTML()) return;
    setSaving(true);
    try {
      const productTitle = existing?.product?.title;
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: templateType.type,
          productId: existing?.productId ?? null,
          name: productTitle
            ? `${templateType.label} (${productTitle})`
            : `${templateType.label} (공통)`,
          subject,
          html: editor.getHTML(),
          isActive,
        }),
      });
      if (!res.ok) throw new Error("저장 실패");
      const data = await res.json();
      onSave(data);
      alert("저장되었습니다.");
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing?.id || !onDelete) return;
    if (!confirm("이 템플릿을 삭제하시겠습니까?")) return;
    // 아직 저장 안 된 임시 항목이면 그냥 제거
    if (existing.id.startsWith("new-")) {
      onDelete(existing.id);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${existing.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDelete(existing.id);
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 활성화 토글 */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
        <div>
          <p className="text-sm font-semibold text-neutral-800">자동 발송 활성화</p>
          <p className="text-xs text-neutral-500 mt-0.5">{templateType.description}</p>
        </div>
        <button onClick={() => setIsActive((v) => !v)}>
          {isActive ? (
            <ToggleRight className="w-8 h-8 text-pink-500" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-neutral-400" />
          )}
        </button>
      </div>

      {/* 변수 안내 */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-blue-700 mb-1">사용 가능한 변수</p>
          <div className="flex flex-wrap gap-1.5">
            {templateType.variables.map((v) => (
              <code key={v} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-mono">
                {v}
              </code>
            ))}
          </div>
        </div>
      </div>

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">메일 제목</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
        />
      </div>

      {/* 내용 */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">메일 내용</label>
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-4">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-between">
        {onDelete ? (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        ) : <div />}
        <button
          onClick={handleSave}
          disabled={saving || !subject}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl ig-gradient text-white font-bold text-sm hover:opacity-90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}

export function EmailTemplatesClient({
  templates,
  products,
}: {
  templates: EmailTemplate[];
  products: Product[];
}) {
  const [activeTypeIdx, setActiveTypeIdx] = useState(0);
  const [templateList, setTemplateList] = useState<EmailTemplate[]>(templates);
  const [addingProduct, setAddingProduct] = useState(false);
  const [selectedNewProduct, setSelectedNewProduct] = useState(products[0]?.id || "");

  const activeType = TEMPLATE_TYPES[activeTypeIdx];
  const currentTemplates = templateList.filter((t) => t.type === activeType.type);
  const globalTemplate = currentTemplates.find((t) => t.productId === null);
  const productTemplates = currentTemplates.filter((t) => t.productId !== null);

  const usedProductIds = new Set(productTemplates.map((t) => t.productId));
  const availableProducts = products.filter((p) => !usedProductIds.has(p.id));

  const handleSave = (updated: EmailTemplate) => {
    setTemplateList((prev) => {
      // 임시 id(new-*)로 추가된 항목은 실제 id로 교체
      const idx = prev.findIndex(
        (t) => t.id === updated.id || (t.productId === updated.productId && t.type === updated.type)
      );
      if (idx >= 0) return prev.map((t, i) => (i === idx ? updated : t));
      return [...prev, updated];
    });
  };

  const handleDelete = (id: string) => {
    setTemplateList((prev) => prev.filter((t) => t.id !== id));
    setAddingProduct(false);
  };

  const handleAddProductTemplate = () => {
    if (!selectedNewProduct) return;
    const product = products.find((p) => p.id === selectedNewProduct);
    if (!product) return;
    const fake: EmailTemplate = {
      id: `new-${selectedNewProduct}`,
      type: activeType.type,
      productId: selectedNewProduct,
      name: `${activeType.label} (${product.title})`,
      subject: activeType.defaultSubject,
      html: activeType.defaultHtml,
      isActive: true,
      updatedAt: new Date(),
      product,
    };
    setTemplateList((prev) => [...prev, fake]);
    setAddingProduct(false);
    // 다음 추가 시 이미 선택된 상품 제외
    const next = availableProducts.find((p) => p.id !== selectedNewProduct);
    if (next) setSelectedNewProduct(next.id);
  };

  return (
    <div className="max-w-3xl">
      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        {TEMPLATE_TYPES.map((t, i) => {
          const hasActive = templateList.some((tmpl) => tmpl.type === t.type && tmpl.isActive);
          return (
            <button
              key={t.type}
              onClick={() => { setActiveTypeIdx(i); setAddingProduct(false); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                activeTypeIdx === i
                  ? "ig-gradient text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              )}
            >
              <Mail className="w-4 h-4" />
              {t.label}
              {hasActive && <span className="w-2 h-2 rounded-full bg-green-400" />}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {/* 공통 템플릿 */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-neutral-900">공통 템플릿</p>
              <p className="text-xs text-neutral-500 mt-0.5">상품별 템플릿이 없을 때 사용</p>
            </div>
            {globalTemplate?.isActive && (
              <span className="text-xs bg-green-50 text-green-600 font-semibold px-2.5 py-1 rounded-full">활성화됨</span>
            )}
          </div>
          <div className="p-6">
            <TemplateEditor
              key={`global-${activeType.type}`}
              templateType={activeType}
              existing={globalTemplate}
              products={products}
              onSave={handleSave}
            />
          </div>
        </div>

        {/* 상품별 템플릿 */}
        {productTemplates.map((tmpl) => (
          <div key={tmpl.id} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-900">{tmpl.product?.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">이 상품 구매 시 이 템플릿 우선 사용</p>
              </div>
              {tmpl.isActive && (
                <span className="text-xs bg-green-50 text-green-600 font-semibold px-2.5 py-1 rounded-full">활성화됨</span>
              )}
            </div>
            <div className="p-6">
              <TemplateEditor
                key={tmpl.id}
                templateType={activeType}
                existing={tmpl}
                products={products}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          </div>
        ))}

        {/* 상품별 추가 (구매 완료 이메일만) */}
        {activeType.type === "purchase_confirmation" && availableProducts.length > 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-200 p-5">
            {!addingProduct ? (
              <button
                onClick={() => { setAddingProduct(true); setSelectedNewProduct(availableProducts[0]?.id || ""); }}
                className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-800 transition-colors w-full justify-center py-2"
              >
                <Plus className="w-4 h-4" />
                상품별 템플릿 추가
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <select
                  value={selectedNewProduct}
                  onChange={(e) => setSelectedNewProduct(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
                >
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddProductTemplate}
                  className="px-4 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 shrink-0"
                >
                  추가
                </button>
                <button
                  onClick={() => setAddingProduct(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 shrink-0"
                >
                  취소
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
