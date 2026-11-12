// src/components/dashboard/DashboardHeader.js
"use client";

import { useLocale } from "@/components/LocaleProvider";

const fill = (text = "", values = {}) =>
  Object.entries(values).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), text);

// Top bar: patient, title, close – the red version of the headache site's header
export default function DashboardHeader({ patient, onClose }) {
  const { t, locale } = useLocale();
  const age = patient.age
    ? new Intl.NumberFormat(locale, { style: "unit", unit: "year", unitDisplay: "long" }).format(patient.age)
    : "";

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f39aa1] text-white" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" strokeLinecap="round" />
            </svg>
          </span>
          <div className="min-w-0">
            {age && <p className="truncate text-sm font-semibold text-slate-700">{age}</p>}
            <p className="truncate text-xs text-slate-500">{fill(t.DASH_REGISTRATIONS, { n: patient.records?.length ?? 0 })}</p>
          </div>
        </div>
        <h1 className="hidden font-serif text-2xl font-bold text-[#c8323f] sm:block">{t.ENDOMETRIOSIS_DIARY}</h1>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 justify-self-end whitespace-nowrap rounded-full bg-[#e8434f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c8323f]"
        >
          {t.DASHBOARD_CLOSE}
        </button>
      </div>
    </header>
  );
}
