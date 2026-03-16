"use client";

import { useState, useRef } from "react";
import { Search, ChevronDown, ChevronUp, ShoppingBag, X, Check, Users, Upload, FileText, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  tags: string[];
  createdAt: Date;
  _count: { purchases: number };
  purchases: { product: { title: string } }[];
}

interface Product {
  id: string;
  title: string;
}

type BulkActionType = "addTags" | "removeTags" | "setRole" | "addProduct" | "delete" | null;

interface CsvImportResult {
  total: number;
  created: number;
  skipped: number;
  errors: string[];
}

function CsvImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CsvImportResult | null>(null);

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/users/csv-import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      if (data.created > 0) onSuccess();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "가져오기 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-neutral-900">CSV 회원 일괄 등록</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!result ? (
          <>
            {/* 형식 안내 */}
            <div className="bg-blue-50 rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-blue-700 mb-2">CSV 파일 형식</p>
              <code className="text-xs text-blue-600 block font-mono whitespace-pre">{`name,email,password,tags
홍길동,hong@example.com,pass123,"VIP,수강생"
김철수,kim@example.com,,`}</code>
              <ul className="text-xs text-blue-600 mt-2 space-y-0.5 list-disc list-inside">
                <li><strong>email</strong> 필수, 나머지는 선택</li>
                <li>이미 가입된 이메일은 자동 건너뜀</li>
                <li>password 없으면 소셜 로그인만 가능</li>
                <li>tags: 쉼표로 구분, 따옴표로 감싸기</li>
              </ul>
            </div>

            {/* 파일 선택 */}
            <div
              className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center cursor-pointer hover:border-pink-300 hover:bg-pink-50/30 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-pink-500" />
                  <span className="text-sm font-semibold text-neutral-700">{file.name}</span>
                  <span className="text-xs text-neutral-400">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">클릭하여 CSV 파일 선택</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50">
                취소
              </button>
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="flex-1 py-3 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "가져오는 중..." : "가져오기"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 결과 */}
            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-neutral-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-neutral-900">{result.total}</p>
                  <p className="text-xs text-neutral-500">전체</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-green-600">{result.created}</p>
                  <p className="text-xs text-green-600">등록 성공</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-neutral-500">{result.skipped}</p>
                  <p className="text-xs text-neutral-500">건너뜀</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-red-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-xs font-semibold text-red-600">오류 목록</p>
                  </div>
                  <ul className="text-xs text-red-500 space-y-0.5 max-h-24 overflow-y-auto">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90"
            >
              완료
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function UserManageClient({ users, products }: { users: User[]; products: Product[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "purchases">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTagsId, setEditTagsId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [userTags, setUserTags] = useState<Record<string, string[]>>(
    Object.fromEntries(users.map((u) => [u.id, u.tags]))
  );
  const [userList, setUserList] = useState(users);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkActionType>(null);
  const [bulkTagInput, setBulkTagInput] = useState("");
  const [bulkRole, setBulkRole] = useState<"USER" | "ADMIN">("USER");
  const [bulkProductId, setBulkProductId] = useState(products[0]?.id || "");
  const [bulkLoading, setBulkLoading] = useState(false);

  const filtered = userList
    .filter(
      (u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        userTags[u.id]?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "purchases") {
        return sortDir === "desc"
          ? b._count.purchases - a._count.purchases
          : a._count.purchases - b._count.purchases;
      }
      return sortDir === "desc"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortDir("desc"); }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((u) => u.id)));
    }
  };

  const addTag = async (userId: string) => {
    if (!tagInput.trim()) return;
    const newTags = [...(userTags[userId] || []), tagInput.trim()];
    setUserTags((prev) => ({ ...prev, [userId]: newTags }));
    setTagInput("");
    await fetch(`/api/admin/users/${userId}/tags`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: newTags }),
    }).catch(console.error);
  };

  const removeTag = async (userId: string, tag: string) => {
    const newTags = (userTags[userId] || []).filter((t) => t !== tag);
    setUserTags((prev) => ({ ...prev, [userId]: newTags }));
    await fetch(`/api/admin/users/${userId}/tags`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: newTags }),
    }).catch(console.error);
  };

  const executeBulkAction = async () => {
    if (selectedIds.size === 0 || !bulkAction) return;

    setBulkLoading(true);

    const payload: Record<string, unknown> = {};
    if (bulkAction === "addTags" || bulkAction === "removeTags") {
      payload.tags = bulkTagInput.split(",").map((t) => t.trim()).filter(Boolean);
      if ((payload.tags as string[]).length === 0) { setBulkLoading(false); return; }
    }
    if (bulkAction === "setRole") payload.role = bulkRole;
    if (bulkAction === "addProduct") payload.productId = bulkProductId;

    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selectedIds), action: bulkAction, payload }),
      });

      if (res.ok) {
        const data = await res.json();

        if (bulkAction === "addTags") {
          const tags = payload.tags as string[];
          setUserTags((prev) => {
            const next = { ...prev };
            selectedIds.forEach((id) => {
              next[id] = Array.from(new Set([...(next[id] || []), ...tags]));
            });
            return next;
          });
        }
        if (bulkAction === "removeTags") {
          const tags = payload.tags as string[];
          setUserTags((prev) => {
            const next = { ...prev };
            selectedIds.forEach((id) => {
              next[id] = (next[id] || []).filter((t) => !tags.includes(t));
            });
            return next;
          });
        }
        if (bulkAction === "setRole") {
          setUserList((prev) =>
            prev.map((u) => (selectedIds.has(u.id) ? { ...u, role: bulkRole } : u))
          );
        }
        if (bulkAction === "delete") {
          setUserList((prev) => prev.filter((u) => !selectedIds.has(u.id)));
          setSelectedIds(new Set());
        }

        alert(`${data.count ?? selectedIds.size}명에게 적용되었습니다.`);
        setBulkAction(null);
        setBulkTagInput("");
      } else {
        alert("처리 중 오류가 발생했습니다.");
      }
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setBulkLoading(false);
    }
  };

  const SortIcon = ({ field }: { field: typeof sortBy }) =>
    sortBy === field ? (
      sortDir === "desc" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />
    ) : null;

  const allChecked = filtered.length > 0 && selectedIds.size === filtered.length;
  const someChecked = selectedIds.size > 0 && selectedIds.size < filtered.length;

  const bulkActionLabels: Record<string, string> = {
    addTags: "태그 추가",
    removeTags: "태그 제거",
    setRole: "역할 변경",
    addProduct: "강의 추가",
    delete: "회원 삭제",
  };

  return (
    <div>
      {showCsvModal && (
        <CsvImportModal
          onClose={() => setShowCsvModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

      {/* Search + CSV 버튼 */}
      <div className="flex gap-3 mb-5">
      <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="이름, 이메일, 태그 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
          />
        </div>
        <button
          onClick={() => setShowCsvModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shrink-0"
        >
          <Upload className="w-4 h-4" />
          CSV 가져오기
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 bg-neutral-900 text-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-semibold">{selectedIds.size}명 선택됨</span>
            </div>
            <button
              onClick={() => { setSelectedIds(new Set()); setBulkAction(null); }}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              선택 해제
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["addTags", "removeTags", "setRole", "addProduct", "delete"] as BulkActionType[]).map((action) => (
              <button
                key={action!}
                onClick={() => setBulkAction(bulkAction === action ? null : action)}
                className={cn(
                  "text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
                  action === "delete"
                    ? bulkAction === action
                      ? "bg-red-500 text-white"
                      : "bg-red-500/20 text-red-300 hover:bg-red-500/40"
                    : bulkAction === action
                      ? "bg-pink-500 text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                {bulkActionLabels[action!]}
              </button>
            ))}
          </div>

          {/* Action input area */}
          {bulkAction && bulkAction !== "delete" && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3">
              {(bulkAction === "addTags" || bulkAction === "removeTags") && (
                <input
                  type="text"
                  value={bulkTagInput}
                  onChange={(e) => setBulkTagInput(e.target.value)}
                  placeholder="태그 입력 (쉼표로 구분, 예: vip, 수강생)"
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/10 text-white placeholder-neutral-400 border border-white/20 focus:outline-none focus:border-pink-400"
                  onKeyDown={(e) => e.key === "Enter" && executeBulkAction()}
                />
              )}
              {bulkAction === "setRole" && (
                <select
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value as "USER" | "ADMIN")}
                  className="px-3 py-2 text-xs rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
                >
                  <option value="USER" className="text-black">일반회원 (USER)</option>
                  <option value="ADMIN" className="text-black">관리자 (ADMIN)</option>
                </select>
              )}
              {bulkAction === "addProduct" && (
                <select
                  value={bulkProductId}
                  onChange={(e) => setBulkProductId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="text-black">{p.title}</option>
                  ))}
                </select>
              )}
              <button
                onClick={executeBulkAction}
                disabled={bulkLoading}
                className="px-4 py-2 text-xs font-semibold bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors shrink-0"
              >
                {bulkLoading ? "처리 중..." : "적용"}
              </button>
            </div>
          )}

          {bulkAction === "delete" && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3">
              <p className="text-xs text-red-300 flex-1">
                선택한 {selectedIds.size}명을 영구 삭제합니다. 되돌릴 수 없습니다.
              </p>
              <button
                onClick={executeBulkAction}
                disabled={bulkLoading}
                className="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors shrink-0"
              >
                {bulkLoading ? "삭제 중..." : "영구 삭제"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-neutral-50 border-b border-neutral-100 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={allChecked}
              ref={(el) => { if (el) el.indeterminate = someChecked; }}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
            />
          </div>
          <div className="col-span-3">회원</div>
          <div className="col-span-3">이메일</div>
          <div className="col-span-1">태그</div>
          <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-neutral-700" onClick={() => toggleSort("purchases")}>
            구매 <SortIcon field="purchases" />
          </div>
          <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-neutral-700" onClick={() => toggleSort("createdAt")}>
            가입일 <SortIcon field="createdAt" />
          </div>
        </div>

        {/* Rows */}
        {filtered.map((user) => (
          <div key={user.id} className="border-b border-neutral-50 last:border-0">
            <div
              className={cn(
                "grid grid-cols-12 gap-2 px-5 py-3.5 items-center hover:bg-neutral-50 cursor-pointer",
                selectedIds.has(user.id) && "bg-pink-50"
              )}
              onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
            >
              <div className="col-span-1" onClick={(e) => toggleSelect(user.id, e)}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(user.id)}
                  onChange={() => {}}
                  className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
                />
              </div>
              <div className="col-span-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full ig-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{user.name || "이름 없음"}</p>
                  {user.role === "ADMIN" && (
                    <span className="text-xs text-pink-600 font-semibold">관리자</span>
                  )}
                </div>
              </div>
              <div className="col-span-3 text-sm text-neutral-500 truncate">{user.email}</div>
              <div className="col-span-1">
                {(userTags[user.id] || []).length > 0 && (
                  <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">
                    {(userTags[user.id] || []).length}개
                  </span>
                )}
              </div>
              <div className="col-span-2 text-sm text-neutral-700 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-neutral-400" />
                {user._count.purchases}건
              </div>
              <div className="col-span-2 text-xs text-neutral-400">
                {formatDate(user.createdAt)}
              </div>
            </div>

            {/* Expanded */}
            {expandedId === user.id && (
              <div className="px-5 pb-4 bg-neutral-50 border-t border-neutral-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                  {/* Purchases */}
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">구매 강의</h4>
                    {user.purchases.length === 0 ? (
                      <p className="text-sm text-neutral-400">구매한 강의가 없습니다.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {user.purchases.map((p, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                            <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            {p.product.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">태그 관리</h4>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(userTags[user.id] || []).map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                          {tag}
                          <button onClick={() => removeTag(user.id, tag)} className="hover:text-purple-900">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editTagsId === user.id ? tagInput : ""}
                        onFocus={() => setEditTagsId(user.id)}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTag(user.id)}
                        placeholder="태그 입력 후 Enter"
                        className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-pink-400"
                      />
                      <button
                        onClick={() => addTag(user.id)}
                        className="px-3 py-1.5 text-xs bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-200">
                  <a
                    href={`/admin/users/${user.id}/edit`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    정보 수정
                  </a>
                  <a
                    href={`/admin/users/${user.id}/add-product`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg ig-gradient text-white hover:opacity-90 transition-opacity"
                  >
                    강의 추가
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
