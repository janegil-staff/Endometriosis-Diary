// src/components/dashboard/ui.js
"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { copyTables } from "@/lib/copyTables";

export const CARD = "rounded-2xl bg-white shadow-[0_6px_18px_-8px_rgba(160,40,50,0.35)]";
export const SECTION_TITLE = "text-xs font-bold uppercase tracking-[0.14em] text-[#c8323f]";
export const TH = "px-2 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500";

// "Copy text" – copies the blocks from getBlocks() and shows "Copied" for a moment
export function CopyButton({ getBlocks }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyTables(getBlocks())) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }}
      className="shrink-0 rounded-full bg-[#e8434f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c8323f]"
    >
      {copied ? t.COPIED : t.COPY_TEXT}
    </button>
  );
}

export function Checkbox({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#e8434f]"
      />
      {children}
    </label>
  );
}

// Coloured dot above a column heading, like the headache site's tables
export const Dot = ({ color }) => <span className="mx-auto mb-1 block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />;
