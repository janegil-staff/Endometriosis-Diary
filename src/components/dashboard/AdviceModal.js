// src/components/dashboard/AdviceModal.js
"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import Modal from "@/components/dashboard/Modal";
import { CARD } from "@/components/dashboard/ui";
import { ChevronIcon } from "@/components/dashboard/icons";

// The advice the patient marked as relevant in the app.
// Expects the same shape as the API's /users/me/advice items:
//   { id, title, shortDescription, description, image, category: { title }, isRelevant, referenceName, referenceUrl }
// If an item has no isRelevant field, it is taken as relevant (the list is then assumed to be pre-filtered).
export function relevantAdvice(patient) {
  const list = Array.isArray(patient?.advice) ? patient.advice : [];
  return list.filter((a) => a && (a.isRelevant === undefined || a.isRelevant === true));
}

// Advice texts may come as HTML from the admin: shown as plain text with the paragraphs kept
function toText(value = "") {
  return String(value)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const isWebUrl = (u) => /^https?:\/\//i.test(u ?? "");

function AdviceItem({ advice: a, t }) {
  const [open, setOpen] = useState(false);
  const short = toText(a.shortDescription);
  const long = toText(a.description);
  const hasMore = !!long && long !== short;

  return (
    <li className={`${CARD} overflow-hidden`}>
      <div className="flex gap-4 p-4 sm:p-5">
        {isWebUrl(a.image) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" loading="lazy" />
        )}
        <div className="min-w-0 flex-1">
          {a.category?.title && (
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b5655c]">{a.category.title}</div>
          )}
          <h3 className="mt-0.5 font-semibold text-slate-800">{toText(a.title) || "–"}</h3>
          {short && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{short}</p>}
          {open && hasMore && <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{long}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {hasMore && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="inline-flex items-center gap-1 font-semibold text-[#c8323f] hover:underline"
              >
                {open ? t.ADV_SHOW_LESS : t.ADV_READ_MORE}
                <span className={`transition ${open ? "-rotate-90" : "rotate-90"}`}>
                  <ChevronIcon dir="right" size={14} />
                </span>
              </button>
            )}
            {isWebUrl(a.referenceUrl) && (
              <a href={a.referenceUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 underline hover:text-[#c8323f]">
                {t.ADV_SOURCE}: {a.referenceName || new URL(a.referenceUrl).hostname}
              </a>
            )}
            {!isWebUrl(a.referenceUrl) && a.referenceName && (
              <span className="text-slate-500">
                {t.ADV_SOURCE}: {a.referenceName}
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function AdviceModal({ open, onClose, patient }) {
  const { t } = useLocale();
  const list = relevantAdvice(patient);

  return (
    <Modal open={open} onClose={onClose} title={t.ADV_TITLE} maxWidth="max-w-2xl">
      {list.length === 0 ? (
        <p className={`${CARD} px-4 py-8 text-center text-sm italic text-slate-500`}>{t.ADV_NONE}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((a, i) => (
            <AdviceItem key={a.id ?? i} advice={a} t={t} />
          ))}
        </ul>
      )}
    </Modal>
  );
}
