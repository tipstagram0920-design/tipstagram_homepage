"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2, Upload } from "lucide-react";

interface Props {
  initial: {
    kakaoChatUrl: string;
    ebookUrl: string;
    ebook1Url: string;
    ebook2Url: string;
    ebook2VerifyTag: string;
    webinarSummaryUrl: string;
    webinarFaqUrl: string;
  };
}

export function LiveSettingsClient({ initial }: Props) {
  const router = useRouter();
  const [chatUrl, setChatUrl] = useState(initial.kakaoChatUrl);
  const [ebookUrl, setEbookUrl] = useState(initial.ebookUrl);
  const [ebook1Url, setEbook1Url] = useState(initial.ebook1Url);
  const [ebook2Url, setEbook2Url] = useState(initial.ebook2Url);
  const [verifyTag, setVerifyTag] = useState(initial.ebook2VerifyTag);
  const [summaryUrl, setSummaryUrl] = useState(initial.webinarSummaryUrl);
  const [faqUrl, setFaqUrl] = useState(initial.webinarFaqUrl);
  const [loading, setLoading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileLiveRef = useRef<HTMLInputElement>(null);
  const file1Ref = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);
  const fileSummaryRef = useRef<HTMLInputElement>(null);
  const fileFaqRef = useRef<HTMLInputElement>(null);

  const validateUrl = (v: string) => !v || /^https?:\/\//.test(v);

  const saveOne = async (key: string, value: string) => {
    if (!validateUrl(value)) {
      setError("URL은 http:// 또는 https:// 로 시작해야 합니다.");
      return;
    }
    setError("");
    setSavedKey(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: value.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "저장 실패");
        return;
      }
      setSavedKey(key);
      router.refresh();
      setTimeout(() => setSavedKey(null), 2500);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  const upload = async (
    file: File,
    onUrl: (url: string) => void,
    key: string
  ) => {
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
    } catch {
      setError("업로드 중 오류");
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* 카카오 오픈채팅 URL */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            카카오 오픈채팅 URL
          </label>
          <input
            type="url"
            value={chatUrl}
            onChange={(e) => setChatUrl(e.target.value)}
            placeholder="https://open.kakao.com/o/..."
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
          <p className="text-xs text-neutral-500 mt-1.5">
            라이브 신청자 메일의 <strong>대기방 입장하기</strong> 버튼 링크.
          </p>
        </div>
        {chatUrl && (
          <a href={chatUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-medium">
            <ExternalLink className="w-3 h-3" /> 현재 URL 열어보기
          </a>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={() => saveOne("kakao_open_chat_url", chatUrl)}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            저장
          </button>
          {savedKey === "kakao_open_chat_url" && (
            <span className="text-sm text-green-600 inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> 저장되었습니다.
            </span>
          )}
        </div>
      </section>

      {/* 라이브 e-Book URL (라이브 참여자용) */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <FileUrlField
          label="라이브 참여자 e-Book URL"
          desc="라이브 신청 메일의 '10가지 질문 다운로드' 버튼 링크."
          value={ebookUrl}
          onChange={setEbookUrl}
          onUpload={(f) => upload(f, setEbookUrl, "live_ebook_url")}
          uploading={uploadingKey === "live_ebook_url"}
          inputRef={fileLiveRef}
          accept="application/pdf,application/epub+zip,image/*"
        />
        <SaveRow
          onSave={() => saveOne("live_ebook_url", ebookUrl)}
          loading={loading}
          saved={savedKey === "live_ebook_url"}
        />
      </section>

      <div className="pt-2 pb-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs font-bold text-neutral-500 tracking-[2px]">전자책 2단계 자동화</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>
      </div>

      {/* 1차 전자책 URL */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <FileUrlField
          label="1차 전자책 URL"
          desc="/ebook 에서 신청한 사람에게 발송되는 1차 전자책 다운로드 링크."
          value={ebook1Url}
          onChange={setEbook1Url}
          onUpload={(f) => upload(f, setEbook1Url, "ebook1_url")}
          uploading={uploadingKey === "ebook1_url"}
          inputRef={file1Ref}
          accept="application/pdf,application/epub+zip"
        />
        <SaveRow
          onSave={() => saveOne("ebook1_url", ebook1Url)}
          loading={loading}
          saved={savedKey === "ebook1_url"}
        />
      </section>

      {/* 2차 전자책 URL */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <FileUrlField
          label="2차 전자책 URL"
          desc="/ebook/step2 인증 완료 후 발송되는 2차 전자책 다운로드 링크."
          value={ebook2Url}
          onChange={setEbook2Url}
          onUpload={(f) => upload(f, setEbook2Url, "ebook2_url")}
          uploading={uploadingKey === "ebook2_url"}
          inputRef={file2Ref}
          accept="application/pdf,application/epub+zip"
        />
        <SaveRow
          onSave={() => saveOne("ebook2_url", ebook2Url)}
          loading={loading}
          saved={savedKey === "ebook2_url"}
        />
      </section>

      {/* 인스타 인증 태그 */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            인스타 인증 태그
          </label>
          <input
            type="text"
            value={verifyTag}
            onChange={(e) => setVerifyTag(e.target.value)}
            placeholder="@tipstagram2023"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
          <p className="text-xs text-neutral-500 mt-1.5">
            2차 신청 페이지에서 사용자가 인스타 스토리에 태그할 핸들. 변경 시 즉시 반영.
          </p>
        </div>
        <SaveRow
          onSave={() => saveOne("ebook2_verify_tag", verifyTag)}
          loading={loading}
          saved={savedKey === "ebook2_verify_tag"}
        />
      </section>

      {/* 강의 요약본 (스토리 인증 후 발송) */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <FileUrlField
          label="강의 요약본 파일 URL"
          desc="/live/summary 페이지에서 스토리 인증 완료 시 이메일로 발송되는 파일 링크."
          value={summaryUrl}
          onChange={setSummaryUrl}
          onUpload={(f) => upload(f, setSummaryUrl, "webinar_summary_url")}
          uploading={uploadingKey === "webinar_summary_url"}
          inputRef={fileSummaryRef}
          accept="application/pdf,application/epub+zip,application/zip"
        />
        <SaveRow
          onSave={() => saveOne("webinar_summary_url", summaryUrl)}
          loading={loading}
          saved={savedKey === "webinar_summary_url"}
        />
      </section>

      {/* 인스타그램 자주 묻는 질문 10 (요약본과 함께 발송) */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <FileUrlField
          label="인스타그램 자주 묻는 질문 10 URL"
          desc="/live/summary 스토리 인증 시 강의 요약본과 함께 두 번째 버튼으로 첨부되는 파일 링크."
          value={faqUrl}
          onChange={setFaqUrl}
          onUpload={(f) => upload(f, setFaqUrl, "webinar_faq_url")}
          uploading={uploadingKey === "webinar_faq_url"}
          inputRef={fileFaqRef}
          accept="application/pdf,application/epub+zip,application/zip"
        />
        <SaveRow
          onSave={() => saveOne("webinar_faq_url", faqUrl)}
          loading={loading}
          saved={savedKey === "webinar_faq_url"}
        />
      </section>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}
    </div>
  );
}

function FileUrlField({
  label,
  desc,
  value,
  onChange,
  onUpload,
  uploading,
  inputRef,
  accept,
}: {
  label: string;
  desc: string;
  value: string;
  onChange: (v: string) => void;
  onUpload: (f: File) => void;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-semibold text-neutral-800">{label}</label>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs px-2.5 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
            >
              지우기
            </button>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-pink-300 hover:text-pink-500 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? "업로드 중..." : "파일에서 업로드"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="hidden"
          />
        </div>
      </div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... 또는 파일에서 업로드"
        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
      />
      <p className="text-xs text-neutral-500 mt-1.5">{desc}</p>
      {value && (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-medium mt-2">
          <ExternalLink className="w-3 h-3" /> 현재 파일 열어보기
        </a>
      )}
    </div>
  );
}

function SaveRow({
  onSave,
  loading,
  saved,
}: {
  onSave: () => void;
  loading: boolean;
  saved: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onSave}
        disabled={loading}
        className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        저장
      </button>
      {saved && (
        <span className="text-sm text-green-600 inline-flex items-center gap-1.5">
          <Check className="w-4 h-4" /> 저장되었습니다.
        </span>
      )}
    </div>
  );
}
