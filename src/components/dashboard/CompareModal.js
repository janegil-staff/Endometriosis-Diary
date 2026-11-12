// src/components/dashboard/CompareModal.js
"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import Modal from "@/components/dashboard/Modal";
import { CARD, CopyButton, Dot, SECTION_TITLE, TH } from "@/components/dashboard/ui";
import { COLORS, addDays, fill, keyOf, rangeStats, startOfToday } from "@/components/dashboard/data";

const PERIOD_DAYS = 30;

// The values compared, in column order. Lower is better for all of them.
const metrics = (t) => [
  { text: t.CAL_LIGHT, color: COLORS.mild, get: (s) => s.levels[2] },
  { text: t.CAL_MEDIUM, color: COLORS.moderate, get: (s) => s.levels[3] },
  { text: t.CAL_HEAVY, color: COLORS.strong, get: (s) => s.levels[4] },
  { text: t.CAL_EXTREME, color: COLORS.extreme, get: (s) => s.levels[5] },
  { text: t.SUM_PAIN_DAYS, bold: true, get: (s) => s.pain },
  { text: t.CMP_HEAVY_EXTREME, bold: true, get: (s) => s.severe },
  { text: t.CAL_PERIOD, color: "#fdc8cd", get: (s) => s.period },
  { text: t.CAL_MEDICATION, color: COLORS.acute, get: (s) => s.medication },
  { text: t.ABS_WORK, get: (s) => s.absentWork },
];

const round1 = (n) => Math.round(n * 10) / 10;
const average = (list, get) => (list.length ? round1(list.reduce((a, p) => a + get(p.s), 0) / list.length) : null);

function changeText(after, before) {
  if (before === null || after === null) return "–";
  if (before === 0) return after === 0 ? "0%" : "–";
  const pct = Math.round(((after - before) / before) * 100);
  return `${pct > 0 ? "+" : ""}${pct}%`;
}
const changeClass = (text) => (text.startsWith("+") ? "text-red-600" : text.startsWith("-") ? "text-emerald-700" : "text-slate-700");

const signed = (n) => (n < 0 ? `−${-n}` : String(n)); // "−90", "0", "30"

// Six 30-day periods around the reference date: three before and three after
function periods(byDate, ref, today, locale, t) {
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  return [-3, -2, -1, 0, 1, 2].map((n) => {
    const start = addDays(ref, n * PERIOD_DAYS);
    const end = addDays(start, PERIOD_DAYS - 1);
    const ended = end < today;
    const s = rangeStats(byDate, start, PERIOD_DAYS);
    const from = n * PERIOD_DAYS;
    return {
      n,
      s,
      ended,
      label: fill(t.CMP_DAY_RANGE, { from: signed(from), to: signed(from + PERIOD_DAYS) }),
      dates: fmt.formatRange ? fmt.formatRange(start, end) : `${fmt.format(start)} – ${fmt.format(end)}`,
    };
  });
}

function PeriodTable({ title, rows, avgLabel, avgs, cols, t }) {
  return (
    <section className={`${CARD} p-4`}>
      <h3 className={SECTION_TITLE}>{title}</h3>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[46rem] text-sm tabular-nums">
          <thead>
            <tr className="border-b border-slate-100">
              <th className={`${TH} text-start`}>{t.CMP_PERIOD}</th>
              {cols.map((c, i) => (
                <th key={i} className={`${TH} text-center align-bottom`}>
                  {c.color && <Dot color={c.color} />}
                  {c.text}
                </th>
              ))}
              <th className={`${TH} text-center align-bottom`}>{t.CMP_REGISTERED}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => (
              <tr key={p.n}>
                <td className="px-2 py-2">
                  <div className="text-slate-800">
                    {p.label}
                    {!p.ended && <span className="text-xs text-slate-400"> ({t.SUM_SO_FAR})</span>}
                  </div>
                  <div className="text-[11px] text-slate-400">{p.dates}</div>
                </td>
                {cols.map((c, i) => (
                  <td key={i} className={`px-2 py-2 text-center text-slate-700 ${c.bold ? "font-bold text-slate-900" : ""}`}>
                    {p.s.registered ? c.get(p.s) : "–"}
                  </td>
                ))}
                <td className="px-2 py-2 text-center text-slate-500">
                  {p.s.registered}/{PERIOD_DAYS}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-200 bg-[#fdf3f4] font-semibold">
              <td className="px-2 py-2 text-slate-900">{avgLabel}</td>
              {avgs.map((v, i) => (
                <td key={i} className="px-2 py-2 text-center text-slate-900">
                  {v ?? "–"}
                </td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

// "Compare before and after a date", e.g. the start of a treatment – like the headache site
export default function CompareModal({ open, onClose, byDate }) {
  const { t, locale } = useLocale();
  const today = startOfToday();
  const [refKey, setRefKey] = useState(() => keyOf(addDays(startOfToday(), -90)));
  if (!open) return null;

  const [y, m, d] = refKey.split("-").map(Number);
  const ref = y ? new Date(y, m - 1, d) : addDays(today, -90);
  const cols = metrics(t);
  const all = periods(byDate, ref, today, locale, t);
  const before = all.filter((p) => p.n < 0);
  const after = all.filter((p) => p.n >= 0);
  const beforeUsed = before.filter((p) => p.s.registered);
  const afterUsed = after.filter((p) => p.ended && p.s.registered);
  const avgBefore = cols.map((c) => average(beforeUsed, c.get));
  const avgAfter = cols.map((c) => average(afterUsed, c.get));
  const changeRows = afterUsed.map((p) => ({ p, cells: cols.map((c, i) => changeText(c.get(p.s), avgBefore[i])) }));

  const blocks = () => {
    const head = [t.CMP_PERIOD, ...cols.map((c) => c.text), t.CMP_REGISTERED];
    const rowsOf = (list) => list.map((p) => [`${p.label} (${p.dates})`, ...cols.map((c) => (p.s.registered ? String(c.get(p.s)) : "–")), `${p.s.registered}/${PERIOD_DAYS}`]);
    return [
      { text: `${t.CMP_DATE}: ${new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(ref)}` },
      { title: t.CMP_BEFORE, head, rows: [...rowsOf(before), [t.CMP_AVG_BEFORE, ...avgBefore.map((v) => String(v ?? "–")), ""]] },
      { title: t.CMP_AFTER, head, rows: [...rowsOf(after), [t.CMP_AVG_AFTER, ...avgAfter.map((v) => String(v ?? "–")), ""]] },
      ...(changeRows.length
        ? [{ title: t.CMP_CHANGE, head: [t.CMP_PERIOD, ...cols.map((c) => c.text)], rows: changeRows.map(({ p, cells }) => [p.label, ...cells]) }]
        : []),
      { text: t.CMP_NOTE },
    ];
  };

  return (
    <Modal open={open} onClose={onClose} title={t.CMP_TITLE} maxWidth="max-w-6xl" fullHeight>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="block">
          <span className={SECTION_TITLE}>{t.CMP_DATE}</span>
          <input
            type="date"
            value={refKey}
            max={keyOf(today)}
            onChange={(e) => e.target.value && setRefKey(e.target.value)}
            className="mt-1.5 block rounded-lg border border-[#f3c6cb] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e8434f]/30"
          />
          <span className="mt-1 block text-xs text-slate-500">{t.CMP_HINT}</span>
        </label>
        <CopyButton getBlocks={blocks} />
      </div>

      <div className="mt-4 space-y-4">
        <PeriodTable title={t.CMP_BEFORE} rows={before} avgLabel={t.CMP_AVG_BEFORE} avgs={avgBefore} cols={cols} t={t} />
        <PeriodTable title={t.CMP_AFTER} rows={after} avgLabel={t.CMP_AVG_AFTER} avgs={avgAfter} cols={cols} t={t} />

        {changeRows.length > 0 && (
          <section className={`${CARD} p-4`}>
            <h3 className={SECTION_TITLE}>{t.CMP_CHANGE}</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[40rem] text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className={`${TH} text-start`}>{t.CMP_PERIOD}</th>
                    {cols.map((c, i) => (
                      <th key={i} className={`${TH} text-center align-bottom`}>
                        {c.color && <Dot color={c.color} />}
                        {c.text}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {changeRows.map(({ p, cells }) => (
                    <tr key={p.n}>
                      <td className="px-2 py-2 text-slate-800">{p.label}</td>
                      {cells.map((c, i) => (
                        <td key={i} className={`px-2 py-2 text-center font-semibold ${changeClass(c)}`}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        <p className="text-xs italic text-slate-500">{t.CMP_NOTE}</p>
      </div>
    </Modal>
  );
}
