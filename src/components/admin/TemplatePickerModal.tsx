"use client";

import { DESCRIPTION_TEMPLATES } from "./descriptionTemplates";

interface TemplatePickerModalProps {
  onSelect: (html: string) => void;
  onClose: () => void;
}

export function TemplatePickerModal({ onSelect, onClose }: TemplatePickerModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">템플릿 선택</h2>
            <p className="text-sm text-neutral-500 mt-0.5">원하는 템플릿을 선택하면 현재 내용이 교체됩니다.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Template list */}
        <div className="overflow-y-auto p-6 flex flex-col gap-4">
          {DESCRIPTION_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="border border-neutral-200 rounded-2xl overflow-hidden hover:border-pink-400 transition-colors cursor-pointer group"
              onClick={() => {
                if (confirm(`"${tpl.name}" 템플릿을 불러오면 현재 내용이 지워집니다. 계속할까요?`)) {
                  onSelect(tpl.html);
                  onClose();
                }
              }}
            >
              {/* Template info */}
              <div className="flex items-center justify-between px-5 py-4 bg-neutral-50 group-hover:bg-pink-50 transition-colors">
                <div>
                  <p className="font-bold text-neutral-900 text-sm">{tpl.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{tpl.description}</p>
                </div>
                <button className="px-4 py-1.5 rounded-lg bg-pink-500 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  이 템플릿 사용
                </button>
              </div>

              {/* Mini preview */}
              <div className="h-40 overflow-hidden relative">
                <div
                  className="absolute inset-0 p-4 origin-top-left pointer-events-none"
                  style={{ transform: "scale(0.45)", width: "222%", height: "222%" }}
                  dangerouslySetInnerHTML={{ __html: tpl.html }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
