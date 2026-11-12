#!/usr/bin/env bash
# add-calendar.sh – the calendar and the month's numbers on the left of the patient page,
# like the app's Calendar screen. Run from the root of the EndometriosisDiary project:
#   bash add-calendar.sh
set -euo pipefail
[ -f src/components/dashboard/DashboardHeader.js ] || { echo "Run this from the EndometriosisDiary project root"; exit 1; }
mkdir -p src/components/dashboard

echo "Writing src/components/dashboard/data.js"
cat > "src/components/dashboard/data.js" <<'CAL_EOF'
// src/components/dashboard/data.js
// Pure helpers for the patient data returned by /api/patients/details/json
//
// How the app stores a day (checked against the app's January 2026 screen for the sample user):
//   intensity 1 = no pain, 2 = light, 3 = medium, 4 = heavy, 5 = extreme
//   period    1 = no bleeding, 2–5 = bleeding from light to heavy
//   "Month sum" in the app = the sum of (intensity − 1) for the month

export const INTENSITY = {
  1: { key: "CAL_NO_PAIN", face: "none" },
  2: { key: "CAL_LIGHT", face: "mild" },
  3: { key: "CAL_MEDIUM", face: "moderate" },
  4: { key: "CAL_HEAVY", face: "strong" },
  5: { key: "CAL_EXTREME", face: "extreme" },
};
export const PAIN_LEVELS = [2, 3, 4, 5];

// Same colours as the app
export const COLORS = {
  none: "#aab4c0",
  mild: "#4cc38a", // light
  moderate: "#ffc75a", // medium
  strong: "#ff6b6b", // heavy
  strongRing: "#f2434e",
  extreme: "#c0392b",
  today: "#e8434f",
  acute: "#e5484d",
  note: "#5b8fd9",
  monthSum: "#a83226",
};

// Pink behind the date on bleeding days, darker for heavier bleeding (period 2–5)
export const PERIOD_BG = { 2: "#fde2e5", 3: "#fdd5d9", 4: "#fcc1c7", 5: "#faa9b1" };

export const pad = (n) => String(n).padStart(2, "0");
export const toDateKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`; // m is 0-based
export const monthKey = (y, m) => `${y}-${pad(m + 1)}`;

export function todayKey() {
  const now = new Date();
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export const indexRecords = (records = []) => new Map(records.map((r) => [String(r.date).slice(0, 10), r]));

export const hasMedication = (r) => (r?.acuteMedicines?.length ?? 0) > 0;
export const hasBleeding = (r) => (r?.period ?? 0) >= 2;

// The numbers under the calendar, like the app
export function monthStats(byDate, year, month) {
  const prefix = `${monthKey(year, month)}-`;
  const s = { registered: 0, sum: 0, period: 0, medication: 0, notes: 0, levels: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  for (const [key, r] of byDate) {
    if (!key.startsWith(prefix)) continue;
    s.registered += 1;
    const level = Number(r.intensity) || 0;
    if (s.levels[level] !== undefined) s.levels[level] += 1;
    if (level >= 1) s.sum += level - 1;
    if (hasBleeding(r)) s.period += 1;
    if (hasMedication(r)) s.medication += 1;
    if (r.note) s.notes += 1;
  }
  return s;
}

// First and last month with registrations, so the arrows stop there
export function monthRange(byDate) {
  const keys = [...byDate.keys()].sort();
  if (!keys.length) return null;
  const [fy, fm] = keys[0].split("-").map(Number);
  const [ly, lm] = keys.at(-1).split("-").map(Number);
  return { first: { year: fy, month: fm - 1 }, last: { year: ly, month: lm - 1 } };
}

const fill = (text = "", values = {}) =>
  Object.entries(values).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), text);

// "1 day" / "5 days" from the texts (CAL_DAY_ONE / CAL_DAY_OTHER) and the language's plural rules
export function formatDays(t, locale, n) {
  let rule = "other";
  try {
    rule = new Intl.PluralRules(locale).select(n);
  } catch {}
  return fill(rule === "one" ? t.CAL_DAY_ONE : t.CAL_DAY_OTHER, { n });
}
CAL_EOF

echo "Writing src/components/dashboard/icons.js"
cat > "src/components/dashboard/icons.js" <<'CAL_EOF'
// src/components/dashboard/icons.js
import { COLORS } from "@/components/dashboard/data";

// Smiley in a coloured circle, like the app's pain icons
export function FaceIcon({ face, size = 28 }) {
  const fill = COLORS[face] ?? COLORS.none;
  const eyes =
    face === "extreme" ? (
      <>
        <path d="M8.5 9.5l2.5 1.2M15.5 9.5L13 10.7" />
        <circle cx="9.8" cy="11.3" r="0.9" fill="#fff" stroke="none" />
        <circle cx="14.2" cy="11.3" r="0.9" fill="#fff" stroke="none" />
      </>
    ) : face === "strong" ? (
      <>
        <path d="M8.6 9.4l2.2 1M15.4 9.4l-2.2 1" />
        <circle cx="9.8" cy="11" r="0.9" fill="#fff" stroke="none" />
        <circle cx="14.2" cy="11" r="0.9" fill="#fff" stroke="none" />
      </>
    ) : face === "moderate" ? (
      <path d="M8.3 10.2q1.2 1 2.4 0M13.3 10.2q1.2 1 2.4 0" />
    ) : (
      <>
        <circle cx="9.5" cy="10" r="1" fill="#fff" stroke="none" />
        <circle cx="14.5" cy="10" r="1" fill="#fff" stroke="none" />
      </>
    );
  const mouth = {
    none: "M8.8 14.2q3.2 2.6 6.4 0",
    mild: "M9.2 15h5.6",
    moderate: "M9 15.8q3-2 6 0",
    strong: "M9 16.2q3-2.6 6 0",
    extreme: "M9 16.4q3-3 6 0",
  }[face] ?? "M9.2 15h5.6";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill={fill} />
      <g fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round">
        {eyes}
        <path d={mouth} />
      </g>
    </svg>
  );
}

// Thick dark-red ring – the month sum
export function MonthSumIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" fill="none" stroke={COLORS.monthSum} strokeWidth="3.6" />
    </svg>
  );
}

// Pink dot – days with bleeding
export function PeriodIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fdc8cd" />
    </svg>
  );
}

// Red cross in a ring – acute medication
export function AcuteIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fff" stroke={COLORS.acute} strokeWidth="1.6" />
      <path d="M10 6.5h4v3.5h3.5v4H14v3.5h-4V14H6.5v-4H10z" fill={COLORS.acute} />
    </svg>
  );
}

// Note sheet in a blue ring – the day has a written note
export function NoteIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fff" stroke={COLORS.note} strokeWidth="1.6" />
      <path d="M8 5.8h5.6l2.6 2.6v9.8H8z" fill={COLORS.note} />
      <path d="M13.6 5.8v2.6h2.6" fill="#cfe0f7" />
      <path d="M9.8 11.3h4.6M9.8 13.6h4.6M9.8 15.9h3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronIcon({ dir = "left", size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
CAL_EOF

echo "Writing src/components/dashboard/CalendarCard.js"
cat > "src/components/dashboard/CalendarCard.js" <<'CAL_EOF'
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
CAL_EOF

echo "Writing src/app/dashboard/page.js"
cat > "src/app/dashboard/page.js" <<'CAL_EOF'
// src/app/dashboard/page.js
"use client";

import CalendarCard from "@/components/dashboard/CalendarCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { usePatient } from "@/components/dashboard/usePatient";
import { useLocale } from "@/components/LocaleProvider";

export default function DashboardPage() {
  const { patient, close } = usePatient();
  const { t } = useLocale();

  if (!patient) return null;

  return (
    <div className="min-h-screen pb-12">
      <DashboardHeader patient={patient} onClose={close} />

      {/* Calendar on the left, the rest on the right (stacked on small screens), like the other sites */}
      <main className="mx-auto mt-6 grid max-w-md gap-6 px-4 lg:max-w-[62rem] lg:grid-cols-2 lg:items-start">
        <CalendarCard patient={patient} />
        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_10px_30px_-18px_rgba(160,40,50,0.45)] backdrop-blur">
            <p className="text-slate-600">{t.DASH_COMING_SOON}</p>
          </section>
        </aside>
      </main>
    </div>
  );
}
CAL_EOF

echo "Adding the calendar texts to src/locales/*.json"
node - <<'CAL_EOF'
const fs = require("fs");
const TEXTS = {"en-US": {"CAL_MONTH_SUM": "Month sum", "CAL_PERIOD": "Period", "CAL_NO_PAIN": "No pain", "CAL_LIGHT": "Light", "CAL_MEDIUM": "Medium", "CAL_HEAVY": "Heavy", "CAL_EXTREME": "Extreme", "CAL_MEDICATION": "Medication", "CAL_NOTE": "Note", "CAL_NO_REGISTRATION": "Not registered", "CAL_PREV_MONTH": "Previous month", "CAL_NEXT_MONTH": "Next month", "CAL_DAY_ONE": "{n} day", "CAL_DAY_OTHER": "{n} days"}, "nb-NO": {"CAL_MONTH_SUM": "Månedssum", "CAL_PERIOD": "Menstruasjon", "CAL_NO_PAIN": "Ingen smerte", "CAL_LIGHT": "Lett", "CAL_MEDIUM": "Middels", "CAL_HEAVY": "Kraftig", "CAL_EXTREME": "Ekstrem", "CAL_MEDICATION": "Medisiner", "CAL_NOTE": "Notat", "CAL_NO_REGISTRATION": "Ikke registrert", "CAL_PREV_MONTH": "Forrige måned", "CAL_NEXT_MONTH": "Neste måned", "CAL_DAY_ONE": "{n} dag", "CAL_DAY_OTHER": "{n} dager"}, "nl-NL": {"CAL_MONTH_SUM": "Maandtotaal", "CAL_PERIOD": "Menstruatie", "CAL_NO_PAIN": "Geen pijn", "CAL_LIGHT": "Licht", "CAL_MEDIUM": "Gemiddeld", "CAL_HEAVY": "Hevig", "CAL_EXTREME": "Extreem", "CAL_MEDICATION": "Medicatie", "CAL_NOTE": "Notitie", "CAL_NO_REGISTRATION": "Niet geregistreerd", "CAL_PREV_MONTH": "Vorige maand", "CAL_NEXT_MONTH": "Volgende maand", "CAL_DAY_ONE": "{n} dag", "CAL_DAY_OTHER": "{n} dagen"}, "fr-FR": {"CAL_MONTH_SUM": "Somme du mois", "CAL_PERIOD": "Règles", "CAL_NO_PAIN": "Pas de douleur", "CAL_LIGHT": "Légère", "CAL_MEDIUM": "Moyenne", "CAL_HEAVY": "Forte", "CAL_EXTREME": "Extrême", "CAL_MEDICATION": "Médicaments", "CAL_NOTE": "Note", "CAL_NO_REGISTRATION": "Non enregistré", "CAL_PREV_MONTH": "Mois précédent", "CAL_NEXT_MONTH": "Mois suivant", "CAL_DAY_ONE": "{n} jour", "CAL_DAY_OTHER": "{n} jours"}, "da-DK": {"CAL_MONTH_SUM": "Månedssum", "CAL_PERIOD": "Menstruation", "CAL_NO_PAIN": "Ingen smerter", "CAL_LIGHT": "Let", "CAL_MEDIUM": "Middel", "CAL_HEAVY": "Kraftig", "CAL_EXTREME": "Ekstrem", "CAL_MEDICATION": "Medicin", "CAL_NOTE": "Note", "CAL_NO_REGISTRATION": "Ikke registreret", "CAL_PREV_MONTH": "Forrige måned", "CAL_NEXT_MONTH": "Næste måned", "CAL_DAY_ONE": "{n} dag", "CAL_DAY_OTHER": "{n} dage"}, "pl-PL": {"CAL_MONTH_SUM": "Suma miesiąca", "CAL_PERIOD": "Miesiączka", "CAL_NO_PAIN": "Brak bólu", "CAL_LIGHT": "Lekki", "CAL_MEDIUM": "Średni", "CAL_HEAVY": "Silny", "CAL_EXTREME": "Ekstremalny", "CAL_MEDICATION": "Leki", "CAL_NOTE": "Notatka", "CAL_NO_REGISTRATION": "Nie zarejestrowano", "CAL_PREV_MONTH": "Poprzedni miesiąc", "CAL_NEXT_MONTH": "Następny miesiąc", "CAL_DAY_ONE": "{n} dzień", "CAL_DAY_OTHER": "{n} dni"}, "pt-PT": {"CAL_MONTH_SUM": "Soma do mês", "CAL_PERIOD": "Menstruação", "CAL_NO_PAIN": "Sem dor", "CAL_LIGHT": "Ligeira", "CAL_MEDIUM": "Média", "CAL_HEAVY": "Forte", "CAL_EXTREME": "Extrema", "CAL_MEDICATION": "Medicação", "CAL_NOTE": "Nota", "CAL_NO_REGISTRATION": "Não registado", "CAL_PREV_MONTH": "Mês anterior", "CAL_NEXT_MONTH": "Mês seguinte", "CAL_DAY_ONE": "{n} dia", "CAL_DAY_OTHER": "{n} dias"}, "fi-FI": {"CAL_MONTH_SUM": "Kuukauden summa", "CAL_PERIOD": "Kuukautiset", "CAL_NO_PAIN": "Ei kipua", "CAL_LIGHT": "Lievä", "CAL_MEDIUM": "Keskivaikea", "CAL_HEAVY": "Voimakas", "CAL_EXTREME": "Äärimmäinen", "CAL_MEDICATION": "Lääkkeet", "CAL_NOTE": "Muistiinpano", "CAL_NO_REGISTRATION": "Ei kirjattu", "CAL_PREV_MONTH": "Edellinen kuukausi", "CAL_NEXT_MONTH": "Seuraava kuukausi", "CAL_DAY_ONE": "{n} päivä", "CAL_DAY_OTHER": "{n} päivää"}, "de-DE": {"CAL_MONTH_SUM": "Monatssumme", "CAL_PERIOD": "Periode", "CAL_NO_PAIN": "Keine Schmerzen", "CAL_LIGHT": "Leicht", "CAL_MEDIUM": "Mittel", "CAL_HEAVY": "Stark", "CAL_EXTREME": "Extrem", "CAL_MEDICATION": "Medikamente", "CAL_NOTE": "Notiz", "CAL_NO_REGISTRATION": "Nicht erfasst", "CAL_PREV_MONTH": "Vorheriger Monat", "CAL_NEXT_MONTH": "Nächster Monat", "CAL_DAY_ONE": "{n} Tag", "CAL_DAY_OTHER": "{n} Tage"}, "es-ES": {"CAL_MONTH_SUM": "Suma del mes", "CAL_PERIOD": "Menstruación", "CAL_NO_PAIN": "Sin dolor", "CAL_LIGHT": "Leve", "CAL_MEDIUM": "Media", "CAL_HEAVY": "Fuerte", "CAL_EXTREME": "Extrema", "CAL_MEDICATION": "Medicación", "CAL_NOTE": "Nota", "CAL_NO_REGISTRATION": "Sin registrar", "CAL_PREV_MONTH": "Mes anterior", "CAL_NEXT_MONTH": "Mes siguiente", "CAL_DAY_ONE": "{n} día", "CAL_DAY_OTHER": "{n} días"}, "sv-SE": {"CAL_MONTH_SUM": "Månadssumma", "CAL_PERIOD": "Mens", "CAL_NO_PAIN": "Ingen smärta", "CAL_LIGHT": "Lätt", "CAL_MEDIUM": "Medel", "CAL_HEAVY": "Kraftig", "CAL_EXTREME": "Extrem", "CAL_MEDICATION": "Läkemedel", "CAL_NOTE": "Anteckning", "CAL_NO_REGISTRATION": "Inte registrerad", "CAL_PREV_MONTH": "Föregående månad", "CAL_NEXT_MONTH": "Nästa månad", "CAL_DAY_ONE": "{n} dag", "CAL_DAY_OTHER": "{n} dagar"}, "it-IT": {"CAL_MONTH_SUM": "Somma del mese", "CAL_PERIOD": "Mestruazioni", "CAL_NO_PAIN": "Nessun dolore", "CAL_LIGHT": "Lieve", "CAL_MEDIUM": "Media", "CAL_HEAVY": "Forte", "CAL_EXTREME": "Estrema", "CAL_MEDICATION": "Farmaci", "CAL_NOTE": "Nota", "CAL_NO_REGISTRATION": "Non registrato", "CAL_PREV_MONTH": "Mese precedente", "CAL_NEXT_MONTH": "Mese successivo", "CAL_DAY_ONE": "{n} giorno", "CAL_DAY_OTHER": "{n} giorni"}};
let n = 0;
for (const [code, keys] of Object.entries(TEXTS)) {
  const p = `src/locales/${code}.json`;
  if (!fs.existsSync(p)) continue;
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  let changed = false;
  for (const [k, v] of Object.entries(keys)) if (!(k in data)) { data[k] = v; changed = true; }
  if (changed) { fs.writeFileSync(p, JSON.stringify(data, null, "\t") + "\n"); n++; }
}
console.log(`  updated ${n} language files`);
CAL_EOF
echo "Done – open a patient to see the calendar."
