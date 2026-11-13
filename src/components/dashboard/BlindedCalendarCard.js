// src/components/dashboard/BlindedCalendarCard.js
"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { indexRecords, monthRange, toDateKey, todayKey } from "@/components/dashboard/data";
import { ChevronIcon } from "@/components/dashboard/icons";

// One flat colour for every registered day – no pain colours, period, medication or notes
const BLIND_BG = "#f8d7da";
const BLIND_TEXT = "#5c1a20";

// Calendar only, read-only: month navigation and the blinded grid.
// No month numbers, day details or summary – they would show what the blinded grid hides.
export default function BlindedCalendarCard({ patient }) {
  const { t, locale } = useLocale();
  const byDate = useMemo(() => indexRecords(patient?.records), [patient]);
  const range = useMemo(() => monthRange(byDate), [byDate]);

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

  return (
    <section className="rounded-3xl border border-white/70 bg-[#fdf1f2]/90 p-3 shadow-[0_10px_30px_-18px_rgba(160,40,50,0.45)] backdrop-blur sm:p-4">
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
            const registered = byDate.has(key);
            const isFuture = key > today;
            const isToday = key === today;

            // Nothing but registered / not registered – also in the screen-reader label
            const label = `${longDate.format(new Date(year, month, day))}, ${
              registered ? t.CAL_REGISTERED : t.CAL_NO_REGISTRATION
            }`;

            return (
              <div key={key} role="gridcell" aria-label={label} title={label} className="h-12 rounded-xl p-[5px] sm:h-[3.4rem]">
                <div
                  className={`flex h-full w-full items-center justify-center rounded-[0.9rem] text-[17px] font-bold tabular-nums ${
                    registered
                      ? ""
                      : isFuture
                        ? "text-slate-300"
                        : "border-[1.5px] border-[#eadfe0] bg-white text-slate-400"
                  } ${isToday ? "ring-2 ring-[#e8434f] ring-offset-1" : ""}`}
                  style={registered ? { backgroundColor: BLIND_BG, color: BLIND_TEXT } : undefined}
                >
                  {day}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
