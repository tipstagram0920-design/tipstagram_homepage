"use client";

import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";

export function FreebieRowActions({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/freebie/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={copy}
      className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-500 inline-flex items-center gap-1.5"
    >
      {copied ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> 복사됨</> : <><Copy className="w-3 h-3" /> URL</>}
    </button>
  );
}
