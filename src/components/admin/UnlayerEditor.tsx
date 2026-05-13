"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";

export interface UnlayerEditorHandle {
  exportHtmlAndDesign: () => Promise<{ html: string; design: object }>;
}

interface Props {
  design?: object | null;
  onReady?: () => void;
}

const UnlayerEditor = forwardRef<UnlayerEditorHandle, Props>(function UnlayerEditor(
  { design, onReady },
  ref
) {
  const editorRef = useRef<EditorRef>(null);

  useImperativeHandle(ref, () => ({
    exportHtmlAndDesign: () =>
      new Promise((resolve) => {
        editorRef.current?.editor?.exportHtml((data: { html: string; design: object }) => {
          resolve({ html: data.html, design: data.design });
        });
      }),
  }));

  const handleReady: EmailEditorProps["onReady"] = (unlayer) => {
    if (design) {
      unlayer.loadDesign(design as Parameters<typeof unlayer.loadDesign>[0]);
    }
    onReady?.();
  };

  return (
    <EmailEditor
      ref={editorRef}
      onReady={handleReady}
      minHeight={600}
      options={{
        locale: "ko-KR",
        features: { imageEditor: false },
        displayMode: "email",
        user: { id: 1 },
      }}
      style={{ border: "none" }}
    />
  );
});

export default UnlayerEditor;
