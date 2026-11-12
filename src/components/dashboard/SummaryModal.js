// src/components/dashboard/SummaryModal.js
"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import Modal from "@/components/dashboard/Modal";
import { CARD, Checkbox, CopyButton } from "@/components/dashboard/ui";
import { COLORS, SYMPTOMS, addDays, fill, isoWeek, rangeStats, startOfToday } from "@/components/dashboard/data";

export const MONTH_COUNT = 4; // the current month + the three before it
export const WEEK_COUNT = 16; // four lines of four weeks, the last ending with the current week
const OPTIONS_KEY = "endo-summary-options";
const DEFAULT_OPTIONS = { period: "weeks", symptoms: false, absence: false };

// Remembers the doctor's choices in this browser
export function useSummaryOptions() {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(OPTIONS_KEY));
      if (saved) setOptions({ ...DEFAULT_OPTIONS, ...saved });
    } catch {}
  }, []);
  const setOption = (key, value) =>
    setOptions((o) => {
      const next = { ...o, [key]: value };
      try {
        localStorage.setItem(OPTIONS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  return [options, setOption];
}

export const periodLabel = (t, period) =>
  period === "weeks" ? fill(t.SUM_LAST_WEEKS, { n: WEEK_COUNT }) : fill(t.SUM_LAST_MONTHS, { n: MONTH_COUNT });

// Four rows, oldest first: calendar months, or blocks of four weeks (Monday–Sunday)
function summaryRows(byDate, period, locale, t) {
  const today = startOfToday();
  const rows = [];
  if (period === "weeks") {
    const monday = addDays(today, -((today.getDay() + 6) % 7));
    const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
    for (let i = 3; i >= 0; i--) {
      const start = addDays(monday, -7 * (4 * i + 3));
      const end = addDays(start, 27);
      const range = fmt.formatRange ? fmt.formatRange(start, end) : `${fmt.format(start)} – ${fmt.format(end)}`;
      rows.push({
        label: `${fill(t.SUM_WEEK_RANGE, { from: isoWeek(start), to: isoWeek(end) })} (${range})`,
        current: i === 0,
        s: rangeStats(byDate, start, 28),
      });
    }
  } else {
    for (let i = MONTH_COUNT - 1; i >= 0; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const days = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      const name = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(start);
      rows.push({ label: name.charAt(0).toLocaleUpperCase(locale) + name.slice(1), current: i === 0, s: rangeStats(byDate, start, days) });
    }
  }
  return rows;
}

// The columns, in order; options add the other symptoms and absence
function columns(t, options) {
  const cols = [
    { text: t.SUM_PAIN_DAYS, get: (s) => s.pain },
    { text: t.CAL_LIGHT, color: COLORS.mild, get: (s) => s.levels[2] },
    { text: t.CAL_MEDIUM, color: COLORS.moderate, get: (s) => s.levels[3] },
    { text: t.CAL_HEAVY, color: COLORS.strong, get: (s) => s.levels[4] },
    { text: t.CAL_EXTREME, color: COLORS.extreme, get: (s) => s.levels[5] },
    { text: t.CAL_PERIOD, color: "#fdc8cd", get: (s) => s.period },
    { text: t.CAL_MEDICATION, color: COLORS.acute, get: (s) => s.medication },
  ];
  if (options.symptoms) {
    for (const x of SYMPTOMS) cols.push({ text: t[x.key], get: (s) => s.symptoms[x.field] });
    cols.push({ text: t.SYM_MOOD, get: (s) => s.lowMood });
  }
  if (options.absence) {
    cols.push({ text: t.ABS_WORK, get: (s) => s.absentWork }, { text: t.ABS_SOCIAL, get: (s) => s.absentSocial });
  }
  cols.push({ text: t.SUM_SUM, get: (s, row) => (row.current ? null : s.sum) });
  return cols;
}

function PeriodSwitch({ value, onChange, t }) {
  const weeks = value === "weeks";
  const label = (active) => `cursor-pointer transition ${active ? "font-semibold text-slate-800" : "text-slate-500 hover:text-slate-700"}`;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2 text-sm">
      <button type="button" onClick={() => onChange("months")} className={`text-end ${label(!weeks)}`}>
        {periodLabel(t, "months")}
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={weeks}
        aria-label={periodLabel(t, value)}
        onClick={() => onChange(weeks ? "months" : "weeks")}
        className="relative h-6 w-11 shrink-0 rounded-full border border-slate-300 bg-white shadow-inner"
      >
        <span
          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#e8434f] shadow-sm transition-all ${weeks ? "start-[22px]" : "start-[3px]"}`}
        />
      </button>
      <button type="button" onClick={() => onChange("weeks")} className={`text-start ${label(weeks)}`}>
        {periodLabel(t, "weeks")}
      </button>
    </div>
  );
}

// The summary table for the last four months or the last 16 weeks, ready to copy into the patient record
export default function SummaryModal({ open, onClose, byDate, options, setOption }) {
  const { t, locale } = useLocale();
  if (!open) return null;

  const rows = summaryRows(byDate, options.period, locale, t);
  const cols = columns(t, options);
  const total = rows.reduce(
    (a, r) => ({ pain: a.pain + r.s.pain, severe: a.severe + r.s.severe, period: a.period + r.s.period, medication: a.medication + r.s.medication }),
    { pain: 0, severe: 0, period: 0, medication: 0 }
  );
  const intro = fill(t.SUM_INTRO, { range: periodLabel(t, options.period), ...total });
  const head = [t.SUM_DAYS_WITH, ...cols.map((c) => c.text)];
  const body = rows.map((r) => [
    r.current ? `${r.label} (${t.SUM_SO_FAR})` : r.label,
    ...cols.map((c) => {
      const v = c.get(r.s, r);
      return v === null ? "–" : String(v);
    }),
  ]);
  const blocks = () => [{ text: intro }, { head, rows: body }, { text: t.SUM_FOOTNOTE }];

  return (
    <Modal open={open} onClose={onClose} title={t.SUM_TITLE} maxWidth="max-w-6xl">
      <section className={`${CARD} p-4 sm:p-5`}>
        <p className="text-sm leading-relaxed text-slate-700">{intro}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-[13px] tabular-nums text-slate-700">
            <thead>
              <tr>
                {head.map((h, i) => (
                  <th key={i} className={`border border-slate-300 bg-[#fdf3f4] px-2 py-1.5 font-semibold ${i === 0 ? "text-start" : "text-center"}`}>
                    {cols[i - 1]?.color && <span className="me-1 inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: cols[i - 1].color }} />}
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, r) => (
                <tr key={r}>
                  {row.map((v, i) => (
                    <td key={i} className={`whitespace-nowrap border border-slate-300 px-2 py-1.5 ${i === 0 ? "text-start" : "text-center"}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs italic text-slate-500">{t.SUM_FOOTNOTE}</p>
        <div className="mt-3 flex justify-end">
          <CopyButton getBlocks={blocks} />
        </div>
      </section>

      <div className="mt-4 border-t border-white/80 pt-2">
        <PeriodSwitch value={options.period} onChange={(v) => setOption("period", v)} t={t} />
        <Checkbox checked={options.symptoms} onChange={(v) => setOption("symptoms", v)}>
          {t.SUM_SHOW_SYMPTOMS}
        </Checkbox>
        <Checkbox checked={options.absence} onChange={(v) => setOption("absence", v)}>
          {t.SUM_SHOW_ABSENCE}
        </Checkbox>
      </div>
    </Modal>
  );
}
