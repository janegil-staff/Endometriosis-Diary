// src/components/dashboard/CalendarCard.js
"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  COLORS,
  INTENSITY,
  PAIN_LEVELS,
  PERIOD_BG,
  formatDays,
  hasBleeding,
  hasMedication,
  indexRecords,
  monthRange,
  monthStats,
  toDateKey,
  todayKey,
} from "@/components/dashboard/data";
import { AcuteIcon, ChevronIcon, FaceIcon, MonthSumIcon, NoteIcon, PeriodIcon } from "@/components/dashboard/icons";

// Tile colours per pain level, like the app (heavy has a darker ring inside)
const TILE_STYLE = {
  1: { backgroundColor: "#eef0f3", color: "#7b8794" },
  2: { backgroundColor: COLORS.mild, color: "#fff" },
  3: { backgroundColor: COLORS.moderate, color: "#fff" },
  4: { backgroundColor: COLORS.strong, color: "#fff", boxShadow: `inset 0 0 0 3px ${COLORS.strongRing}` },
  5: { backgroundColor: COLORS.extreme, color: "#fff" },
};

const VALUE = "text-[#c0392b]";
const LABEL = "text-[#b5655c]";

function SummaryRow({ icon, label, value }) {
  return (
    <li className="flex items-center gap-4 py-[7px]">
      <span className="flex w-8 shrink-0 justify-center">{icon}</span>
      <span className={`min-w-0 flex-1 text-[17px] font-semibold leading-tight ${LABEL}`}>{label}</span>
      <span className={`whitespace-nowrap text-[17px] font-semibold tabular-nums ${VALUE}`}>{value}</span>
    </li>
  );
}

// The calendar and the month's numbers, laid out like the app's "Calendar" screen
export default function CalendarCard({ patient }) {
  const { t, locale } = useLocale();
  const byDate = useMemo(() => indexRecords(patient?.records), [patient]);
  const range = useMemo(() => monthRange(byDate), [byDate]);
  const showNotes = !!patient?.shareNotes;

  const now = new Date();
  const [{ year, month }, setShown] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const index = year * 12 + month;
  const firstIndex = range ? Math.min(range.first.year * 12 + range.first.month, index) : index;
  const lastIndex = now.getFullYear() * 12 + now.getMonth(); // never past the current month
  const go = (step) => {
    const next = Math.min(Math.max(index + step, firstIndex), lastIndex);
    setShown({ year: Math.floor(next / 12), month: next % 12 });
  };

  const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(year, month, 1));
  const weekdays = useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 0, 1 + i))); // 1 Jan 2024 was a Monday
  }, [locale]);
  const longDate = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
  const today = todayKey();
  const s = monthStats(byDate, year, month);

  return (
    <section className="rounded-3xl border border-white/70 bg-[#fdf1f2]/90 p-3 shadow-[0_10px_30px_-18px_rgba(160,40,50,0.45)] backdrop-blur sm:p-4">
      {/* Month and arrows, above the calendar like in the app */}
      <div className="mb-3 flex items-center justify-between px-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index <= firstIndex}
          aria-label={t.CAL_PREV_MONTH}
          className="rounded-full p-1.5 text-[#e8434f] transition hover:bg-white/70 disabled:opacity-25 rtl:rotate-180"
        >
          <ChevronIcon dir="left" />
        </button>
        <h2 className="text-xl font-bold uppercase tracking-wide text-slate-800" aria-live="polite">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={index >= lastIndex}
          aria-label={t.CAL_NEXT_MONTH}
          className="rounded-full p-1.5 text-[#e8434f] transition hover:bg-white/70 disabled:opacity-25 rtl:rotate-180"
        >
          <ChevronIcon dir="right" />
        </button>
      </div>

      {/* Calendar */}
      <div className="rounded-[1.6rem] bg-white px-2 pb-3 pt-3 shadow-[0_6px_18px_-8px_rgba(160,40,50,0.35)]">
        <div className="grid grid-cols-7 pb-2 text-center text-[15px] font-bold uppercase text-slate-900">
          {weekdays.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1" role="grid">
          {Array.from({ length: offset }, (_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const key = toDateKey(year, month, day);
            const r = byDate.get(key);
            const level = Number(r?.intensity) || 0;
            const isFuture = key > today;
            const isToday = key === today;
            const bleeding = hasBleeding(r);
            const medication = hasMedication(r);
            const note = showNotes && !!r?.note;

            let tileClass = "";
            let tileStyle = TILE_STYLE[level];
            if (!tileStyle) {
              tileStyle = undefined;
              tileClass = isToday
                ? "bg-[#e8434f] text-white"
                : isFuture
                  ? "text-slate-300"
                  : "border-[1.5px] border-[#eadfe0] bg-white text-slate-400";
            }

            const label = [
              longDate.format(new Date(year, month, day)),
              r ? t[INTENSITY[level]?.key] : t.CAL_NO_REGISTRATION,
              bleeding && t.CAL_PERIOD,
              medication && t.CAL_MEDICATION,
              note && t.CAL_NOTE,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <div
                key={key}
                role="gridcell"
                aria-label={label}
                title={label}
                className="relative h-12 rounded-xl p-[5px] sm:h-[3.4rem]"
                style={bleeding ? { backgroundColor: PERIOD_BG[Math.min(r.period, 5)] } : undefined}
              >
                <div
                  className={`flex h-full w-full items-center justify-center rounded-[0.9rem] text-[17px] font-bold tabular-nums ${tileClass} ${
                    isToday && r ? "ring-2 ring-[#e8434f] ring-offset-1" : ""
                  }`}
                  style={tileStyle}
                >
                  {day}
                </div>
                {medication && (
                  <span className="pointer-events-none absolute -end-0.5 -top-0.5">
                    <AcuteIcon size={17} />
                  </span>
                )}
                {note && (
                  <span className="pointer-events-none absolute -bottom-1 -end-0.5">
                    <NoteIcon size={17} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* The month's numbers, like the app */}
      <div className="mt-4 rounded-[1.6rem] bg-white px-5 py-3 shadow-[0_6px_18px_-8px_rgba(160,40,50,0.35)]">
        <ul>
          <SummaryRow icon={<MonthSumIcon />} label={t.CAL_MONTH_SUM} value={s.registered ? s.sum : "–"} />
          <SummaryRow icon={<PeriodIcon />} label={t.CAL_PERIOD} value={formatDays(t, locale, s.period)} />
          {PAIN_LEVELS.map((level) => (
            <SummaryRow
              key={level}
              icon={<FaceIcon face={INTENSITY[level].face} />}
              label={t[INTENSITY[level].key]}
              value={formatDays(t, locale, s.levels[level])}
            />
          ))}
          <SummaryRow icon={<AcuteIcon size={28} />} label={t.CAL_MEDICATION} value={formatDays(t, locale, s.medication)} />
        </ul>
      </div>
    </section>
  );
}
