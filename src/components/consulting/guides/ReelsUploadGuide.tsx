"use client";

import { useState } from "react";
import { useGuideSave, FeedbackButton, FeedbackBox, FIELD, FLABEL } from "./common";
import { Film, ExternalLink } from "lucide-react";

interface UploadItem {
  url?: string;
  note?: string;
}
interface Data {
  uploads?: UploadItem[];
}

const EMPTY: UploadItem = { url: "", note: "" };

export function ReelsUploadGuide({ taskId, initialData }: { taskId: string; initialData: Data | null }) {
  const init =
    initialData?.uploads && initialData.uploads.length === 5
      ? initialData.uploads
      : Array.from({ length: 5 }, () => ({ ...EMPTY }));
  const [uploads, setUploads] = useState<UploadItem[]>(init);
  const { saving, saved, save } = useGuideSave(taskId);
  const [show, setShow] = useState(Boolean(initialData?.uploads?.some((u) => (u.url || "").trim())));

  const update = (i: number, patch: Partial<UploadItem>) =>
    setUploads((prev) => prev.map((u, idx) => (idx === i ? { ...u, ...patch } : u)));

  const done = uploads.filter((u) => (u.url || "").trim()).length;
  const getFeedback = () => {
    save({ uploads });
    setShow(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500 leading-relaxed">
        릴스를 <strong>매일 하나씩 업로드</strong>할 때마다, 그 릴스 URL을 여기에 붙여넣고 저장하세요. 5개를 다 채우면 이번 회차 업로드 완료예요. (관리자가 확인합니다)
      </p>

      <div className="space-y-2">
        {uploads.map((u, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="shrink-0 w-6 h-6 rounded-lg ig-gradient text-white text-[11px] font-black flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex-1">
                <label className={FLABEL}>업로드한 릴스 URL</label>
                <input
                  value={u.url ?? ""}
                  onChange={(e) => update(i, { url: e.target.value })}
                  className={FIELD}
                  placeholder="https://www.instagram.com/reel/..."
                />
              </div>
            </div>
            <input
              value={u.note ?? ""}
              onChange={(e) => update(i, { note: e.target.value })}
              className={FIELD}
              placeholder="메모 (선택) — 주제·후킹 등"
            />
          </div>
        ))}
      </div>

      <FeedbackButton onClick={getFeedback} saving={saving} saved={saved} label="업로드 저장" />

      {show && (
        <FeedbackBox>
          <p className="text-[13px] text-neutral-800 mb-2 inline-flex items-center gap-1.5">
            <Film className="w-4 h-4 text-neutral-500" /> 업로드 <strong>{done}/5</strong> 완료
          </p>
          <div className="space-y-1.5">
            {uploads.map((u, i) =>
              (u.url || "").trim() ? (
                <a
                  key={i}
                  href={u.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:border-pink-400"
                >
                  <span className="text-[11px] font-bold text-neutral-400">{i + 1}</span>
                  <span className="flex-1 min-w-0 text-[12px] text-pink-600 truncate">{u.url}</span>
                  {u.note && <span className="text-[11px] text-neutral-400 truncate max-w-[30%]">{u.note}</span>}
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                </a>
              ) : null
            )}
            {done === 0 && <p className="text-xs text-neutral-400">아직 업로드한 URL이 없어요.</p>}
          </div>
        </FeedbackBox>
      )}
    </div>
  );
}
