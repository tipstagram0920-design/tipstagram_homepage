"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Save, ToggleLeft, ToggleRight, Mail, Info, Plus, Trash2, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UnlayerEditorHandle } from "@/components/admin/UnlayerEditor";

const UnlayerEditor = dynamic(() => import("@/components/admin/UnlayerEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-neutral-50 rounded-xl">
      <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
    </div>
  ),
});

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
  design?: string | null;
  bodyText?: string | null;
  smsBody?: string | null;
  isActive: boolean;
  updatedAt: Date;
  product?: { id: string; title: string } | null;
}

const TEMPLATE_TYPES = [
  {
    type: "purchase_confirmation",
    label: "구매 완료 안내",
    description: "상품 결제 완료 시 이메일·문자 자동 발송",
    variables: ["{{name}}", "{{product}}", "{{amount}}", "{{orderId}}"],
    // 5주 챌린지 계열 구매에서만 값이 채워지는 변수 (기수 편집 화면의 값을 읽어온다)
    challengeVariables: ["{{openChatUrl}}", "{{cohortName}}", "{{week1Date}}", "{{challengeUrl}}"],
    defaultSubject: "{{product}} 구매가 완료되었습니다!",
    // 자주 손대는 문안이라 드래그앤드롭 대신 "보이는 글"로 편집한다
    textMode: true,
    smsSupported: true,
    defaultSms:
      "[팁스타그램] {{name}}님, {{product}} 결제가 완료되었습니다.\n\n" +
      "· 1주차 시작: {{week1Date}}\n" +
      "· 오픈채팅방: {{openChatUrl}}\n" +
      "· 챌린지 페이지: {{challengeUrl}}\n\n" +
      "시작 전에 방향 선택부터 해주세요.",
  },
  {
    type: "welcome",
    label: "회원가입 환영 이메일",
    description: "신규 회원가입 완료 시 자동 발송",
    variables: ["{{name}}"],
    challengeVariables: [] as string[],
    defaultSubject: "팁스타그램에 오신 것을 환영합니다!",
    textMode: false,
    smsSupported: false,
    defaultSms: "",
  },
];

function TemplateEditor({
  templateType,
  existing,
  onSave,
  onDelete,
}: {
  templateType: (typeof TEMPLATE_TYPES)[0];
  existing?: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
  onDelete?: (id: string) => void;
}) {
  const [subject, setSubject] = useState(existing?.subject || templateType.defaultSubject);
  const [smsBody, setSmsBody] = useState(existing?.smsBody ?? "");
  const [bodyText, setBodyText] = useState(existing?.bodyText ?? "");
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef<UnlayerEditorHandle>(null);

  const existingDesign = (() => {
    try {
      return existing?.design ? JSON.parse(existing.design) : null;
    } catch {
      return null;
    }
  })();

  const handleSave = async () => {
    if (!subject) return;
    setSaving(true);
    try {
      let html = existing?.html || "";
      let design: object | undefined;

      // 글로 쓰는 문안은 서버가 HTML 을 만든다. 에디터는 아예 쓰지 않는다.
      if (!templateType.textMode && editorRef.current) {
        const exported = await editorRef.current.exportHtmlAndDesign();
        html = exported.html;
        design = exported.design;
      }

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
          html,
          design,
          bodyText: templateType.textMode ? bodyText : null,
          smsBody: templateType.smsSupported ? smsBody : null,
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

  const handleReady = useCallback(() => setEditorReady(true), []);

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
        <div className="min-w-0">
          <p className="text-xs font-semibold text-blue-700 mb-1">
            사용 가능한 변수 (메일·문자 내용에 그대로 입력)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {templateType.variables.map((v) => (
              <code key={v} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-mono">
                {v}
              </code>
            ))}
          </div>

          {templateType.challengeVariables.length > 0 && (
            <>
              <p className="text-xs font-semibold text-blue-700 mt-2.5 mb-1">
                5주 챌린지 구매일 때만 채워지는 변수
              </p>
              <div className="flex flex-wrap gap-1.5">
                {templateType.challengeVariables.map((v) => (
                  <code
                    key={v}
                    className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md font-mono"
                  >
                    {v}
                  </code>
                ))}
              </div>
              <p className="text-[11px] leading-relaxed text-blue-600/80 mt-2">
                기수 정보는 발송하는 순간 DB에서 읽어옵니다. 기수가 바뀌면 문안은 그대로 두고{" "}
                <strong>5주 챌린지 → 기수 상세 → 오픈채팅방 URL</strong>만 바꾸면 됩니다.
                구매자가 들어갈 기수는 &ldquo;아직 시작 안 한 활성 기수 중 가장 이른 것&rdquo;으로 정해집니다.
              </p>
            </>
          )}
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

      {/* 메일 내용 — 자주 고치는 문안은 글로, 그 외는 드래그앤드롭 에디터 */}
      {templateType.textMode ? (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">메일 내용</label>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={20}
            placeholder="여기에 쓴 글이 그대로 메일로 나갑니다."
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm leading-[1.8] focus:outline-none focus:border-pink-400 resize-y font-mono"
          />
          <div className="mt-2 p-3 bg-neutral-50 rounded-xl">
            <p className="text-xs font-semibold text-neutral-700 mb-1.5">쓰는 방법 (전부 선택사항)</p>
            <ul className="space-y-1 text-[11.5px] leading-relaxed text-neutral-500">
              <li>
                <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 font-mono"># 제목</code>{" "}
                → 큰 제목
              </li>
              <li>
                <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 font-mono">- 항목</code>{" "}
                → 목록 한 줄
              </li>
              <li>
                <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 font-mono">
                  [버튼]오픈채팅방 입장하기|https://open.kakao.com/o/xxxx
                </code>{" "}
                → 누를 수 있는 버튼
              </li>
              <li>주소를 그냥 적으면 자동으로 링크가 됩니다. 빈 줄은 문단이 나뉩니다.</li>
              <li>제목·로고·꼬리말 틀은 자동으로 붙으니 본문만 쓰시면 됩니다.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">메일 내용</label>
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <UnlayerEditor
              ref={editorRef}
              design={existingDesign}
              onReady={handleReady}
            />
          </div>
          {!editorReady && (
            <p className="text-xs text-neutral-400 mt-1.5">에디터 로딩 중...</p>
          )}
        </div>
      )}

      {/* 문자(SMS) 문안 — 비워두면 문자는 안 나간다 */}
      {templateType.smsSupported && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
              <MessageSquare className="w-3.5 h-3.5 text-neutral-400" /> 문자(SMS) 내용
            </label>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[11px] font-semibold tabular-nums",
                  smsBody.length > 90 ? "text-amber-600" : "text-neutral-400"
                )}
              >
                {smsBody.length}자{smsBody.length > 90 ? " · 장문(LMS)" : ""}
              </span>
              {!smsBody && (
                <button
                  type="button"
                  onClick={() => setSmsBody(templateType.defaultSms)}
                  className="text-[11px] font-bold text-pink-600 hover:underline"
                >
                  기본 문안 넣기
                </button>
              )}
            </div>
          </div>
          <textarea
            value={smsBody}
            onChange={(e) => setSmsBody(e.target.value)}
            rows={7}
            placeholder="비워두면 문자는 발송하지 않고 이메일만 나갑니다."
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm leading-relaxed focus:outline-none focus:border-pink-400 resize-none font-mono"
          />
          <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
            90자를 넘으면 장문(LMS)으로 발송돼 요금이 올라갑니다. 문자는 연락처에 전화번호가 있는
            구매자에게만 나갑니다.
          </p>
        </div>
      )}

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
      html: "",
      design: null,
      isActive: true,
      updatedAt: new Date(),
      product,
    };
    setTemplateList((prev) => [...prev, fake]);
    setAddingProduct(false);
    const next = availableProducts.find((p) => p.id !== selectedNewProduct);
    if (next) setSelectedNewProduct(next.id);
  };

  return (
    <div className="max-w-5xl">
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
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          </div>
        ))}

        {/* 상품별 추가 */}
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
