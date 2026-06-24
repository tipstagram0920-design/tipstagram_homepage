"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Save, Trash2, ExternalLink } from "lucide-react";

interface Initial {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  fileUrl: string;
  thumbnail: string;
  category: string;
  customEmailBody: string;
  showLivePromo: boolean;
  isActive: boolean;
  submissionCount: number;
}

export function FreebieEditor({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? "");
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [customEmailBody, setCustomEmailBody] = useState(initial?.customEmailBody ?? "");
  const [showLivePromo, setShowLivePromo] = useState(initial?.showLivePromo ?? true);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File, onUrl: (url: string) => void, key: string) => {
    setError("");
    setUploadingKey(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "업로드 실패");
        return;
      }
      onUrl(data.url);
    } finally {
      setUploadingKey(null);
    }
  };

  const save = async () => {
    setError("");
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    setSaving(true);
    try {
      const url = initial ? `/api/admin/freebies/${initial.id}` : "/api/admin/freebies";
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || undefined,
          subtitle: subtitle || null,
          description: description || null,
          fileUrl: fileUrl || null,
          thumbnail: thumbnail || null,
          category: category || null,
          customEmailBody: customEmailBody || null,
          showLivePromo,
          isActive,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "저장 실패");
        return;
      }
      router.push("/admin/crm/freebies");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!initial) return;
    if (!confirm("정말 삭제할까요? 신청 기록도 함께 삭제됩니다.")) return;
    await fetch(`/api/admin/freebies/${initial.id}`, { method: "DELETE" });
    router.push("/admin/crm/freebies");
    router.refresh();
  };

  const publicUrl = slug ? `/freebie/${slug}` : null;

  return (
    <div className="max-w-2xl space-y-5">
      {/* 기본 정보 */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">제목 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 돈 한 푼 안들이고 1K 만들기"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">부제 (선택)</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="페이지 헤드 아래 한 줄 설명"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">소개 (선택, 줄바꿈 유지)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="신청 페이지에 표시되는 자료 설명"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 resize-y"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
              URL slug <span className="text-xs font-normal text-neutral-400">(영문·숫자·하이픈만, 한글 ✕)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="예: 1k-ebook (비우면 자동 생성)"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-mono focus:outline-none focus:border-pink-400"
            />
            {slug && /[^a-z0-9\-_]/.test(slug) && (
              <p className="text-xs text-amber-600 mt-1.5">
                ⚠ 영문 소문자·숫자·하이픈만 사용해주세요. 저장하면 자동 정리됩니다.
              </p>
            )}
            {publicUrl && (
              <p className="text-xs text-neutral-500 mt-1.5 inline-flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                <code>{publicUrl}</code>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">카테고리 (선택)</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="예: ebook, checklist, template"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>
      </section>

      {/* 자료 파일 */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-neutral-800">자료 파일</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingKey === "file"}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-pink-300 hover:text-pink-500 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {uploadingKey === "file" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploadingKey === "file" ? "업로드 중..." : "파일에서 업로드"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,application/epub+zip,application/zip"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f, setFileUrl, "file");
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="hidden"
            />
          </div>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://... 또는 파일에서 업로드"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-neutral-800">썸네일 (선택)</label>
            <button
              type="button"
              onClick={() => thumbRef.current?.click()}
              disabled={uploadingKey === "thumb"}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-pink-300 hover:text-pink-500 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {uploadingKey === "thumb" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploadingKey === "thumb" ? "업로드 중..." : "이미지 업로드"}
            </button>
            <input
              ref={thumbRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f, setThumbnail, "thumb");
                if (thumbRef.current) thumbRef.current.value = "";
              }}
              className="hidden"
            />
          </div>
          <input
            type="url"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="페이지 상단에 표시될 이미지 URL"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
      </section>

      {/* 메일·옵션 */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-3">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">메일 본문 커스터마이즈 (선택, HTML 가능)</label>
          <textarea
            value={customEmailBody}
            onChange={(e) => setCustomEmailBody(e.target.value)}
            rows={4}
            placeholder="비워두면 기본 안내문 — '신청해 주신 OOO 자료를 보내드립니다.'"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-mono focus:outline-none focus:border-pink-400 resize-y"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showLivePromo} onChange={(e) => setShowLivePromo(e.target.checked)} className="w-4 h-4 rounded accent-pink-500" />
            <span className="text-sm text-neutral-700">메일에 무료 라이브 안내 박스 포함 (추천)</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded accent-pink-500" />
            <span className="text-sm text-neutral-700">공개 활성화</span>
          </label>
        </div>
      </section>

      {initial && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl px-5 py-3 text-sm text-pink-700">
          신청 누적 <strong>{initial.submissionCount}건</strong>
        </div>
      )}

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

      <div className="flex justify-between">
        <div>
          {initial && (
            <button onClick={remove} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" /> 삭제
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700">취소</button>
          <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold disabled:opacity-50 inline-flex items-center gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {initial ? "저장" : "만들기"}
          </button>
        </div>
      </div>
    </div>
  );
}
