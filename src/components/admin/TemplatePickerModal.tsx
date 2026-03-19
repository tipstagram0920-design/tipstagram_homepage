"use client";

import { useState } from "react";
import { DESCRIPTION_TEMPLATES } from "./descriptionTemplates";

interface TemplatePickerModalProps {
  onSelect: (html: string) => void;
  onClose: () => void;
}

export function TemplatePickerModal({ onSelect, onClose }: TemplatePickerModalProps) {
  const [selected, setSelected] = useState(DESCRIPTION_TEMPLATES[0].id);

  const current = DESCRIPTION_TEMPLATES.find((t) => t.id === selected)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">템플릿 선택</h2>
            <p className="text-sm text-neutral-500 mt-0.5">오른쪽에서 실제 보여지는 모습을 확인하세요.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: template list */}
          <div className="w-56 flex-shrink-0 border-r border-neutral-100 overflow-y-auto p-3 flex flex-col gap-2">
            {DESCRIPTION_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelected(tpl.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
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
          <div className="flex-1 overflow-y-auto bg-neutral-50">
            {/* Simulated product page context */}
            <div className="px-8 py-8">
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            onClick={() => {
              if (confirm(`"${current.name}" 템플릿을 불러오면 현재 내용이 지워집니다. 계속할까요?`)) {
                onSelect(current.html);
                onClose();
              }
            }}
            className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90"
          >
            이 템플릿 사용하기
          </button>
        </div>
      </div>
    </div>
  );
}
