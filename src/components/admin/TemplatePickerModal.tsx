"use client";

import { useState } from "react";
import { DESCRIPTION_TEMPLATES } from "./descriptionTemplates";

interface TemplatePickerProps {
  onSelect: (html: string) => void;
  onClose: () => void;
}

export function TemplatePickerModal({ onSelect, onClose }: TemplatePickerProps) {
  const [selected, setSelected] = useState(DESCRIPTION_TEMPLATES[0].id);
  const [confirming, setConfirming] = useState(false);

  const current = DESCRIPTION_TEMPLATES.find((t) => t.id === selected)!;

  return (
    <div className="mt-4 border border-pink-200 rounded-2xl overflow-hidden bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-pink-50 border-b border-pink-100">
        <div>
          <span className="text-sm font-bold text-neutral-900">템플릿 선택</span>
          <span className="text-xs text-neutral-500 ml-2">오른쪽에서 실제 보여지는 모습을 확인하세요.</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700 text-lg leading-none px-2"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="flex" style={{ height: "600px" }}>
        {/* Left: template list */}
        <div className="w-48 flex-shrink-0 border-r border-neutral-100 overflow-y-auto p-3 flex flex-col gap-2">
          {DESCRIPTION_TEMPLATES.map((tpl) => (
            <button
              type="button"
              key={tpl.id}
              onClick={() => { setSelected(tpl.id); setConfirming(false); }}
              className={`w-full text-left px-3 py-3 rounded-xl transition-colors ${
                selected === tpl.id
                  ? "bg-pink-50 border border-pink-300"
                  : "hover:bg-neutral-50 border border-transparent"
              }`}
            >
              <p className={`text-sm font-bold ${selected === tpl.id ? "text-pink-600" : "text-neutral-800"}`}>
                {tpl.name}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{tpl.description}</p>
            </button>
          ))}
        </div>

        {/* Right: full-size preview */}
        <div className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
            강의 소개 — 실제 표시 모습
          </p>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div
              className="tiptap-content text-neutral-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: current.html }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-neutral-100 bg-neutral-50">
        {confirming ? (
          <>
            <span className="text-sm text-neutral-600 mr-2">현재 내용이 지워집니다. 계속할까요?</span>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              아니요
            </button>
            <button
              type="button"
              onClick={() => { onSelect(current.html); onClose(); }}
              className="px-4 py-2 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-600"
            >
              네, 적용
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="px-4 py-2 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90"
            >
              이 템플릿 사용하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
