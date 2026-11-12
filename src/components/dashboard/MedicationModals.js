// src/components/dashboard/MedicationModals.js
"use client";

import { useLocale } from "@/components/LocaleProvider";
import Modal from "@/components/dashboard/Modal";
import { CARD, SECTION_TITLE } from "@/components/dashboard/ui";
import { fill, formatDays } from "@/components/dashboard/data";

// Why the patient stopped a medicine (UserMedicineReason in the API)
const REASON_KEYS = { 0: "MED_REASON_0", 1: "MED_REASON_1", 2: "MED_REASON_2", 3: "MED_REASON_3" };

// "PARACETAMOL_" → "PARACETAMOL"
const cleanIngredients = (list) => (list ?? []).map((s) => String(s).replace(/_+$/, "").trim()).filter(Boolean);

function PillIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fdeef0] text-[#e8434f]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)" />
        <path d="M10.3 7.6l4 5.6" />
      </svg>
    </span>
  );
}

// "2026-10-13" → "13. okt. 2026" (null when there is no date)
function useDateText() {
  const { locale } = useLocale();
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  return (key) => {
    if (!key) return null;
    const [y, m, d] = String(key).slice(0, 10).split("-").map(Number);
    return y && m && d ? fmt.format(new Date(y, m - 1, d)) : null;
  };
}

// Start date (and end date for medicines no longer used) under the name – only the dates that
// exist. The patient data from the endometriosis API has no dates for these lists yet;
// startedUsage / stoppedUsage are shown as soon as the API sends them (the headache API already does).
function Dates({ start, end, startLabel }) {
  const { t } = useLocale();
  const date = useDateText();
  const startText = date(start);
  const endText = date(end);
  if (!startText && !endText) return null;
  return (
    <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">
      {startText && (
        <span>
          {startLabel ?? t.MED_START_DATE}: <span className="font-medium text-slate-700">{startText}</span>
        </span>
      )}
      {endText && (
        <span>
          {t.MED_END_DATE}: <span className="font-medium text-slate-700">{endText}</span>
        </span>
      )}
    </p>
  );
}

function Item({ m, dates, children }) {
  const sub = [cleanIngredients(m.ingredients).join(", "), m.atcCode].filter(Boolean).join(" · ");
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <PillIcon />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-800">{m.name}</p>
        {sub && <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">{sub}</p>}
        {dates}
      </div>
      {children && <div className="shrink-0 text-end text-xs text-slate-500">{children}</div>}
    </li>
  );
}

function Section({ title, items, empty }) {
  return (
    <section className={`${CARD} overflow-hidden`}>
      <h3 className={`${SECTION_TITLE} px-4 pt-4`}>
        {title} <span className="font-normal tracking-normal text-slate-400">· {items.length}</span>
      </h3>
      {items.length ? <ul className="mt-2 divide-y divide-slate-100">{items}</ul> : <p className="px-4 pb-4 pt-2 text-sm italic text-slate-400">{empty}</p>}
    </section>
  );
}

// Acute medicines with how often they were used, from the diary
export function acuteUsage(patient) {
  const use = new Map();
  for (const r of patient?.records ?? []) {
    (r.acuteMedicines ?? []).forEach((id, i) => {
      const u = use.get(id) ?? { times: 0, days: 0, first: null, last: null };
      u.times += r.acuteMedicinesUsedTimes?.[i] || 1;
      u.days += 1;
      if (!u.first || r.date < u.first) u.first = r.date;
      if (!u.last || r.date > u.last) u.last = r.date;
      use.set(id, u);
    });
  }
  return (patient?.medicines ?? [])
    .map((m) => ({ m, u: use.get(m.id) ?? { times: 0, days: 0, first: null, last: null } }))
    .sort((a, b) => (b.u.last ?? "").localeCompare(a.u.last ?? ""));
}

export const medicationCount = (patient) => (patient?.preventiveMedicines?.length ?? 0) + (patient?.medicines?.length ?? 0);

export function MedicationModal({ open, onClose, patient }) {
  const { t, locale } = useLocale();
  if (!open) return null;
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const toDate = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const preventive = (patient?.preventiveMedicines ?? []).map((m, i) => (
    <Item key={i} m={m} dates={<Dates start={m.startedUsage} />}>
      {m.dose ? fill(t.MED_DOSE, { n: m.dose }) : null}
    </Item>
  ));
  const acute = acuteUsage(patient).map(({ m, u }) => (
    // No start date for medicines taken as needed – the first day it was registered in the diary instead
    <Item key={m.id} m={m} dates={<Dates start={m.startedUsage ?? u.first} startLabel={m.startedUsage ? undefined : t.MED_FIRST_USED} />}>
      <span className="block font-semibold text-slate-700">{fill(t.MED_USED_ON, { days: formatDays(t, locale, u.days) })}</span>
      {u.last && <span className="block">{fill(t.MED_LAST_USED, { date: date.format(toDate(u.last.slice(0, 10))) })}</span>}
    </Item>
  ));

  return (
    <Modal open={open} onClose={onClose} title={t.MED_TITLE} maxWidth="max-w-2xl">
      <div className="space-y-4">
        <Section title={t.MED_PREVENTIVE} items={preventive} empty={t.MED_NONE} />
        <Section title={t.MED_ACUTE} items={acute} empty={t.MED_NONE} />
      </div>
    </Modal>
  );
}

export function PreviousMedicationModal({ open, onClose, patient }) {
  const { t } = useLocale();
  if (!open) return null;
  const items = (patient?.previousMedicines ?? []).map((m, i) => (
    <Item key={i} m={m} dates={<Dates start={m.startedUsage} end={m.stoppedUsage} />}>
      {REASON_KEYS[m.reason] && (
        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">{t[REASON_KEYS[m.reason]]}</span>
      )}
    </Item>
  ));
  return (
    <Modal open={open} onClose={onClose} title={t.MED_PREVIOUS} maxWidth="max-w-2xl">
      <Section title={t.MED_PREVIOUS} items={items} empty={t.MED_NONE} />
    </Modal>
  );
}
