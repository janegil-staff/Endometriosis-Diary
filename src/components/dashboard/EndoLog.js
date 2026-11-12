// src/components/dashboard/EndoLog.js
"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { CARD, Checkbox, CopyButton, SECTION_TITLE } from "@/components/dashboard/ui";
import { AcuteIcon, ChevronIcon, FaceIcon, NoteIcon } from "@/components/dashboard/icons";
import {
  ABSENCE_KEYS,
  COLORS,
  EFFECT_KEYS,
  INTENSITY,
  LEVEL_KEYS,
  MOOD_KEYS,
  PERIOD_BG,
  SLEEP_KEYS,
  SYMPTOMS,
  addDays,
  fill,
  formatDays,
  hasBleeding,
  hasMedication,
  indexRecords,
  keyOf,
  lowMood,
  painLevel,
  rangeStats,
  startOfToday,
} from "@/components/dashboard/data";

const TIMELINE_DAYS = 90;
const LEVEL_COLOR = { 1: "#c9d2dc", 2: COLORS.mild, 3: COLORS.moderate, 4: COLORS.strong, 5: COLORS.extreme };
const NO_REGISTRATION = "#eef0f3";

const parseKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Medicines used that day: [{ name, times }]
function medicinesOf(r, names) {
  return (r.acuteMedicines ?? []).map((id, i) => ({ name: names.get(id) ?? `#${id}`, times: r.acuteMedicinesUsedTimes?.[i] || 1 }));
}

// Short labels shown as chips on the row
function chipsOf(r, t) {
  const chips = [];
  for (const x of SYMPTOMS) {
    const v = r[x.field] ?? 0;
    if (v >= 2) chips.push({ text: `${t[x.key]} · ${t[LEVEL_KEYS[Math.min(v, 5)]]}`, tone: "symptom" });
  }
  if (lowMood(r)) chips.push({ text: t[MOOD_KEYS[r.emotion]], tone: "mood" });
  if ((r.absentWork ?? 0) >= 2) chips.push({ text: `${t.ABS_WORK} · ${t[ABSENCE_KEYS[r.absentWork]]}`, tone: "absence" });
  if ((r.absentSocial ?? 0) >= 2) chips.push({ text: `${t.ABS_SOCIAL} · ${t[ABSENCE_KEYS[r.absentSocial]]}`, tone: "absence" });
  if (r.sexualPrevented === 3) chips.push({ text: t.SEX_PREVENTED, tone: "symptom" });
  return chips;
}

const CHIP = {
  symptom: "bg-[#fdeef0] text-[#b42f3b]",
  mood: "bg-amber-50 text-amber-700",
  absence: "bg-slate-100 text-slate-600",
};

function Stat({ label, value, accent }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${accent ? "text-[#c8323f]" : "text-slate-800"}`}>{value}</div>
    </div>
  );
}

function Legend({ color, children, dot }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={dot ? "h-1.5 w-1.5 rounded-full" : "h-2.5 w-2.5 rounded-sm"} style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

// One line per day (expands to show everything registered that day)
function DayRow({ dateKey, r, t, locale, names, showNotes }) {
  const [open, setOpen] = useState(false);
  const date = parseKey(dateKey);
  const level = painLevel(r);
  const meds = medicinesOf(r, names);
  const chips = chipsOf(r, t);
  const note = showNotes && r.note ? r.note : "";
  const sleep = (r.sleepHours ?? 0) > 0;
  const activity = (r.physicalActivity ?? 0) > 0;

  const details = [
    [t.LOG_PAIN, t[INTENSITY[level]?.key] ?? "–"],
    [t.CAL_PERIOD, hasBleeding(r) ? t[LEVEL_KEYS[Math.min(r.period, 5)]] : t.LEVEL_NONE],
    ...SYMPTOMS.map((x) => [t[x.key], (r[x.field] ?? 0) >= 2 ? t[LEVEL_KEYS[Math.min(r[x.field], 5)]] : t.LEVEL_NONE]),
    [t.LOG_MOOD, t[MOOD_KEYS[r.emotion]] ?? "–"],
    [t.ABS_WORK, t[ABSENCE_KEYS[r.absentWork]] ?? t.LEVEL_NO],
    [t.ABS_SOCIAL, t[ABSENCE_KEYS[r.absentSocial]] ?? t.LEVEL_NO],
    ...(r.sexualPrevented === 2 || r.sexualPrevented === 3 ? [[t.SEX_PREVENTED, r.sexualPrevented === 3 ? t.LEVEL_YES : t.LEVEL_NO]] : []),
    ...(sleep ? [[t.LOG_SLEEP, `${fill(t.LOG_HOURS, { n: r.sleepHours })}${SLEEP_KEYS[r.sleepQuality] ? ` · ${t[SLEEP_KEYS[r.sleepQuality]]}` : ""}`]] : []),
    ...(activity ? [[t.LOG_ACTIVITY, fill(t.LOG_MINUTES, { n: r.physicalActivity })]] : []),
  ];

  return (
    <li className={`${CARD} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-stretch gap-3 px-3 py-3 text-start sm:px-4"
      >
        <span className="w-1 shrink-0 rounded-full" style={{ backgroundColor: LEVEL_COLOR[level] ?? NO_REGISTRATION }} />
        <span className="grid min-w-0 flex-1 grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[8.5rem_8.5rem_minmax(0,1fr)] sm:items-center">
          <span>
            <span className="block font-semibold text-[#c8323f]">{new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(date)}</span>
            <span className="block text-xs capitalize text-slate-500">{new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date)}</span>
          </span>
          <span className="flex items-center gap-2 font-semibold text-slate-800">
            <FaceIcon face={INTENSITY[level]?.face ?? "none"} size={20} />
            {t[INTENSITY[level]?.key]}
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            {hasBleeding(r) && (
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-[#b42f3b]" style={{ backgroundColor: PERIOD_BG[Math.min(r.period, 5)] }}>
                {t.CAL_PERIOD} · {t[LEVEL_KEYS[Math.min(r.period, 5)]]}
              </span>
            )}
            {chips.map((c, i) => (
              <span key={i} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CHIP[c.tone]}`}>
                {c.text}
              </span>
            ))}
            {meds.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600" title={meds.map((m) => m.name).join(", ")}>
                <AcuteIcon size={14} />
                {meds.reduce((n, m) => n + m.times, 0)}
              </span>
            )}
            {note && <NoteIcon size={18} />}
          </span>
          {note && !open && <span className="truncate text-sm italic text-slate-500 sm:col-span-3">“{note}”</span>}
        </span>
        <span className={`self-center text-slate-400 transition ${open ? "rotate-90" : ""}`}>
          <ChevronIcon dir="right" size={16} />
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 bg-[#fffafa] px-4 py-3 text-sm sm:ps-8">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {details.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-end font-medium text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
          {meds.length > 0 && (
            <div className="mt-3">
              <div className={SECTION_TITLE}>{t.CAL_MEDICATION}</div>
              <ul className="mt-1 space-y-0.5">
                {meds.map((m, i) => (
                  <li key={i} className="text-slate-700">
                    {m.name} × {m.times}
                  </li>
                ))}
              </ul>
              {EFFECT_KEYS[r.effect] && (
                <p className="mt-1 text-slate-600">
                  {t.LOG_EFFECT}: <span className="font-medium text-slate-800">{t[EFFECT_KEYS[r.effect]]}</span>
                </p>
              )}
            </div>
          )}
          {note && <p className="mt-3 whitespace-pre-wrap italic text-slate-600">“{note}”</p>}
        </div>
      )}
    </li>
  );
}

// The log: key numbers, a 90-day timeline and every registered day, newest first
export default function EndoLog({ patient }) {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const byDate = useMemo(() => indexRecords(patient?.records), [patient]);
  const names = useMemo(() => new Map((patient?.medicines ?? []).map((m) => [m.id, m.name])), [patient]);
  const showNotes = !!patient?.shareNotes;
  const today = startOfToday();

  const keys = useMemo(() => [...byDate.keys()].sort().reverse(), [byDate]);
  const painKeys = keys.filter((k) => painLevel(byDate.get(k)) >= 2);
  const noPainCount = keys.length - painKeys.length;

  // Key numbers
  const lastPain = painKeys[0] ? parseKey(painKeys[0]) : null;
  const daysSince = lastPain ? Math.round((today - lastPain) / 86400000) : null;
  const last30 = rangeStats(byDate, addDays(today, -29), 30);

  // Search in notes (when shared) and medicine names
  const q = query.trim().toLocaleLowerCase(locale);
  const visible = (showAll ? keys : painKeys).filter((k) => {
    if (!q) return true;
    const r = byDate.get(k);
    const text = [showNotes ? r.note : "", ...medicinesOf(r, names).map((m) => m.name)].join(" ").toLocaleLowerCase(locale);
    return text.includes(q);
  });

  // Grouped by month
  const groups = [];
  for (const k of visible) {
    const mk = k.slice(0, 7);
    if (groups.at(-1)?.key !== mk) groups.push({ key: mk, days: [] });
    groups.at(-1).days.push(k);
  }
  const monthName = (mk) => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(parseKey(`${mk}-01`));
  const shortDate = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  const blocks = () => [
    {
      head: [t.LOG_DATE, t.LOG_PAIN, t.CAL_PERIOD, t.LOG_SYMPTOMS, t.CAL_MEDICATION, ...(showNotes ? [t.CAL_NOTE] : [])],
      rows: visible.map((k) => {
        const r = byDate.get(k);
        return [
          new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(parseKey(k)),
          t[INTENSITY[painLevel(r)]?.key] ?? "",
          hasBleeding(r) ? t[LEVEL_KEYS[Math.min(r.period, 5)]] : "",
          chipsOf(r, t).map((c) => c.text).join(", "),
          medicinesOf(r, names).map((m) => `${m.name} × ${m.times}`).join(", "),
          ...(showNotes ? [r.note ?? ""] : []),
        ];
      }),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Key numbers */}
      <section className={`${CARD} grid grid-cols-2 gap-4 p-4 sm:grid-cols-5 sm:p-5`}>
        <Stat
          label={t.LOG_SINCE_LAST}
          value={daysSince === null ? "–" : daysSince === 0 ? t.LOG_TODAY : formatDays(t, locale, daysSince)}
        />
        <Stat label={t.LOG_LAST} value={lastPain ? shortDate.format(lastPain) : "–"} accent />
        <Stat label={t.LOG_PAIN_30} value={last30.pain} />
        <Stat label={t.LOG_MED_30} value={last30.medication} />
        <Stat label={t.LOG_TOTAL} value={keys.length} />
      </section>

      {/* 90-day timeline */}
      <section className={`${CARD} p-4 sm:p-5`}>
        <h3 className={SECTION_TITLE}>{fill(t.LOG_TIMELINE, { n: TIMELINE_DAYS })}</h3>
        <div className="mt-3 flex gap-[2px]" dir="ltr">
          {Array.from({ length: TIMELINE_DAYS }, (_, i) => {
            const d = addDays(today, i - TIMELINE_DAYS + 1);
            const r = byDate.get(keyOf(d));
            const level = painLevel(r);
            return (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-[3px]" title={`${shortDate.format(d)}${r ? ` · ${t[INTENSITY[level]?.key] ?? ""}` : ""}`}>
                <span className="h-7 w-full rounded-[2px]" style={{ backgroundColor: r ? LEVEL_COLOR[level] ?? NO_REGISTRATION : NO_REGISTRATION }} />
                <span className="h-1 w-full rounded-full" style={{ backgroundColor: hasBleeding(r) ? "#f7a8b0" : "transparent" }} />
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: hasMedication(r) ? COLORS.acute : "transparent" }} />
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          <Legend color={LEVEL_COLOR[1]}>{t.CAL_NO_PAIN}</Legend>
          <Legend color={COLORS.mild}>{t.CAL_LIGHT}</Legend>
          <Legend color={COLORS.moderate}>{t.CAL_MEDIUM}</Legend>
          <Legend color={COLORS.strong}>{t.CAL_HEAVY}</Legend>
          <Legend color={COLORS.extreme}>{t.CAL_EXTREME}</Legend>
          <Legend color={NO_REGISTRATION}>{t.CAL_NO_REGISTRATION}</Legend>
          <Legend color="#f7a8b0">{t.CAL_PERIOD}</Legend>
          <Legend color={COLORS.acute} dot>
            {t.CAL_MEDICATION}
          </Legend>
        </div>
      </section>

      {/* Search, copy, days without pain */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={showNotes ? t.LOG_SEARCH : t.LOG_SEARCH_MEDICINES}
            aria-label={showNotes ? t.LOG_SEARCH : t.LOG_SEARCH_MEDICINES}
            className="w-full rounded-xl border border-[#f3c6cb] bg-white py-2.5 pe-3 ps-9 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e8434f]/30"
          />
        </div>
        <CopyButton getBlocks={blocks} />
      </div>
      <Checkbox checked={showAll} onChange={setShowAll}>
        {t.LOG_SHOW_NO_PAIN} <span className="text-xs text-slate-400">({noPainCount})</span>
      </Checkbox>

      {/* Days, grouped by month */}
      {groups.length === 0 && <p className="py-8 text-center text-sm italic text-slate-500">{t.LOG_EMPTY}</p>}
      {groups.map((g) => (
        <section key={g.key}>
          <h3 className="mb-2 ms-1 text-sm font-bold uppercase tracking-[0.12em] text-[#c8323f]">
            {monthName(g.key)} <span className="font-normal tracking-normal text-slate-400">· {g.days.length}</span>
          </h3>
          <ul className="space-y-2">
            {g.days.map((k) => (
              <DayRow key={k} dateKey={k} r={byDate.get(k)} t={t} locale={locale} names={names} showNotes={showNotes} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
