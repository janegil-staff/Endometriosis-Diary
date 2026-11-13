// src/components/dashboard/DayModal.js
"use client";

import { useLocale } from "@/components/LocaleProvider";
import Modal from "@/components/dashboard/Modal";
import { CARD, SECTION_TITLE } from "@/components/dashboard/ui";
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
  fill,
  hasBleeding,
  painLevel,
} from "@/components/dashboard/data";

// Dot colour per 1–5 level (1 = none)
const LEVEL_COLOR = { 1: "#c9d2dc", 2: COLORS.mild, 3: COLORS.moderate, 4: COLORS.strong, 5: COLORS.extreme };
const ABSENCE_COLOR = { 1: "#c9d2dc", 2: COLORS.moderate, 3: COLORS.strong };
const SLEEP_COLOR = { 1: COLORS.strong, 2: COLORS.moderate, 3: COLORS.mild };
const MOOD_COLOR = { 1: COLORS.mild, 2: COLORS.mild, 3: "#c9d2dc", 4: COLORS.moderate, 5: COLORS.strong };

const parseKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="text-slate-600">{label}</dt>
      <dd className="flex items-center gap-2 text-end font-semibold text-slate-800">
        {color && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
        {value}
      </dd>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className={`${CARD} px-4 py-3 sm:px-5`}>
      <h3 className={SECTION_TITLE}>{title}</h3>
      <dl className="mt-1 divide-y divide-slate-100 text-sm">{children}</dl>
    </section>
  );
}

// Everything registered on one day. dateKey = "YYYY-MM-DD"; onStep(-1 | 1) moves to the day before/after.
export default function DayModal({ dateKey, record: r, patient, onClose, onStep, canPrev, canNext }) {
  const { t, locale } = useLocale();
  if (!dateKey) return null;

  const date = parseKey(dateKey);
  const title = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
  const names = new Map((patient?.medicines ?? []).map((m) => [m.id, m.name]));
  const showNotes = !!patient?.shareNotes;

  const level = painLevel(r);
  const meds = (r?.acuteMedicines ?? []).map((id, i) => ({
    name: names.get(id) ?? `#${id}`,
    times: r.acuteMedicinesUsedTimes?.[i] || 1,
    dose: r.acuteMedicinesDoses?.[i] || 0,
  }));
  const levelText = (v) => ((v ?? 0) >= 2 ? t[LEVEL_KEYS[Math.min(v, 5)]] : t.LEVEL_NONE);
  const sleep = (r?.sleepHours ?? 0) > 0;
  const activity = (r?.physicalActivity ?? 0) > 0;
  const note = showNotes && r?.note ? r.note : "";

  return (
    <Modal open onClose={onClose} title={title} maxWidth="max-w-xl">
      {/* Day before / after */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={!canPrev}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-[#c8323f] transition hover:bg-white disabled:opacity-30"
        >
          <span className="rtl:rotate-180">
            <ChevronIcon dir="left" size={16} />
          </span>
          {t.DAY_PREV}
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={!canNext}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-[#c8323f] transition hover:bg-white disabled:opacity-30"
        >
          {t.DAY_NEXT}
          <span className="rtl:rotate-180">
            <ChevronIcon dir="right" size={16} />
          </span>
        </button>
      </div>

      {!r ? (
        <p className={`${CARD} px-4 py-8 text-center text-sm italic text-slate-500`}>{t.DAY_NOTHING}</p>
      ) : (
        <div className="space-y-3">
          {/* Pain and period at the top, like the calendar tile */}
          <section className={`${CARD} flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5`}>
            <FaceIcon face={INTENSITY[level]?.face ?? "none"} size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{t.CAL_VIEW_INTENSITY}</div>
              <div className="text-lg font-semibold text-slate-800">{t[INTENSITY[level]?.key] ?? "–"}</div>
            </div>
            <span
              className="rounded-full px-3 py-1 text-sm font-semibold text-[#b42f3b]"
              style={{ backgroundColor: hasBleeding(r) ? PERIOD_BG[Math.min(r.period, 5)] : "#f1f3f6" }}
            >
              {t.CAL_PERIOD} · {hasBleeding(r) ? t[LEVEL_KEYS[Math.min(r.period, 5)]] : t.LEVEL_NONE}
            </span>
          </section>

          <Section title={t.LOG_SYMPTOMS}>
            {SYMPTOMS.map((x) => (
              <Row key={x.field} label={t[x.key]} value={levelText(r[x.field])} color={LEVEL_COLOR[Math.min(r[x.field] || 1, 5)]} />
            ))}
            {(r.sexualPrevented === 2 || r.sexualPrevented === 3) && (
              <Row label={t.SEX_PREVENTED} value={r.sexualPrevented === 3 ? t.LEVEL_YES : t.LEVEL_NO} color={r.sexualPrevented === 3 ? COLORS.strong : LEVEL_COLOR[1]} />
            )}
          </Section>

          <Section title={t.DAY_DAILY_LIFE}>
            <Row label={t.LOG_MOOD} value={t[MOOD_KEYS[r.emotion]] ?? "–"} color={MOOD_COLOR[r.emotion]} />
            <Row label={t.ABS_WORK} value={t[ABSENCE_KEYS[r.absentWork]] ?? t.LEVEL_NO} color={ABSENCE_COLOR[r.absentWork] ?? ABSENCE_COLOR[1]} />
            <Row label={t.ABS_SOCIAL} value={t[ABSENCE_KEYS[r.absentSocial]] ?? t.LEVEL_NO} color={ABSENCE_COLOR[r.absentSocial] ?? ABSENCE_COLOR[1]} />
            <Row
              label={t.LOG_SLEEP}
              value={
                sleep
                  ? `${fill(t.LOG_HOURS, { n: r.sleepHours })}${SLEEP_KEYS[r.sleepQuality] ? ` · ${t[SLEEP_KEYS[r.sleepQuality]]}` : ""}`
                  : t.CAL_NOT_ANSWERED
              }
              color={sleep ? SLEEP_COLOR[r.sleepQuality] : undefined}
            />
            <Row label={t.LOG_ACTIVITY} value={activity ? fill(t.LOG_MINUTES, { n: r.physicalActivity }) : t.CAL_NOT_ANSWERED} />
          </Section>

          <section className={`${CARD} px-4 py-3 sm:px-5`}>
            <h3 className={SECTION_TITLE}>{t.CAL_MEDICATION}</h3>
            {meds.length === 0 ? (
              <p className="mt-1 py-1.5 text-sm text-slate-500">{t.MED_NONE}</p>
            ) : (
              <ul className="mt-1 divide-y divide-slate-100 text-sm">
                {meds.map((m, i) => (
                  <li key={i} className="flex items-center gap-3 py-1.5">
                    <AcuteIcon size={18} />
                    <span className="min-w-0 flex-1 font-semibold text-slate-800">{m.name}</span>
                    {m.dose > 0 && <span className="text-slate-500">{fill(t.MED_DOSE, { n: m.dose })}</span>}
                    <span className="tabular-nums text-slate-700">× {m.times}</span>
                  </li>
                ))}
              </ul>
            )}
            {meds.length > 0 && EFFECT_KEYS[r.effect] && (
              <p className="mt-2 text-sm text-slate-600">
                {t.LOG_EFFECT}: <span className="font-semibold text-slate-800">{t[EFFECT_KEYS[r.effect]]}</span>
              </p>
            )}
            {r.hasAdverseEvent && <p className="mt-2 text-sm font-semibold text-[#c8323f]">{t.DAY_ADVERSE_EVENT}</p>}
          </section>

          {note && (
            <section className={`${CARD} px-4 py-3 sm:px-5`}>
              <h3 className={`${SECTION_TITLE} flex items-center gap-2`}>
                <NoteIcon size={18} />
                {t.CAL_NOTE}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm italic text-slate-700">“{note}”</p>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
