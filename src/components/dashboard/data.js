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

// ---------- What the calendar shows ("Show calendar" dropdown) ----------
//
// Each scale says which stored values count as an answer and how they are drawn:
//   tone = which tile colour (same keys as the pain tiles: 1 grey, 2 green, 3 yellow, 4 red, 5 dark red)
//   rows = the lines in the numbers under the calendar
// 1–5 scales:  1 = none, 2–5 = light to extreme (like pain)
// Absence:     1 = no, 2 = partly, 3 = all day
// Sleep:       1 = poor, 2 = moderate, 3 = good – only answered when sleep hours were given,
//              because the app saves 1 when the sleep question is turned off
const levelRows = PAIN_LEVELS.map((v) => ({ value: v, tone: v, key: INTENSITY[v].key, face: INTENSITY[v].face }));

export const SCALES = {
  pain: { answered: (v) => v >= 1 && v <= 5, tone: (v) => v, noneKey: "CAL_NO_PAIN", rows: levelRows, sum: true },
  level: { answered: (v) => v >= 1 && v <= 5, tone: (v) => v, noneKey: "LEVEL_NONE", rows: levelRows, sum: true },
  absence: {
    answered: (v) => v >= 1 && v <= 3,
    tone: (v) => ({ 1: 1, 2: 3, 3: 4 })[v],
    noneKey: "LEVEL_NO",
    rows: [
      { value: 2, tone: 3, key: "ABS_PARTIAL", face: "moderate" },
      { value: 3, tone: 4, key: "ABS_ALL_DAY", face: "strong" },
    ],
  },
  sleep: {
    answered: (v, r) => (r?.sleepHours ?? 0) > 0 && v >= 1 && v <= 3,
    tone: (v) => ({ 1: 4, 2: 3, 3: 2 })[v],
    rows: [
      { value: 3, tone: 2, key: "SLEEP_Q_3", face: "mild" },
      { value: 2, tone: 3, key: "SLEEP_Q_2", face: "moderate" },
      { value: 1, tone: 4, key: "SLEEP_Q_1", face: "strong" },
    ],
  },
};

// In the same order as the app's dropdown
export const CALENDAR_VIEWS = [
  { field: "intensity", key: "CAL_VIEW_INTENSITY", scale: "pain" },
  { field: "bowelMovementPain", key: "CAL_VIEW_BOWEL", scale: "level" },
  { field: "urinationPain", key: "CAL_VIEW_URINATION", scale: "level" },
  { field: "endoBelly", key: "CAL_VIEW_ENDO_BELLY", scale: "level" },
  { field: "fatigue", key: "CAL_VIEW_FATIGUE", scale: "level" },
  { field: "stress", key: "CAL_VIEW_STRESS", scale: "level" },
  { field: "sexualPain", key: "CAL_VIEW_SEXUAL_PAIN", scale: "level" },
  { field: "absentWork", key: "CAL_VIEW_ABSENT_WORK", scale: "absence" },
  { field: "absentSocial", key: "CAL_VIEW_ABSENT_SOCIAL", scale: "absence" },
  { field: "sleepQuality", key: "CAL_VIEW_SLEEP", scale: "sleep" },
];

// The day's value for a view: { value, tone, key } or null when the question wasn't answered
export function viewValue(view, r) {
  if (!r) return null;
  const scale = SCALES[view.scale];
  const value = Number(r[view.field]) || 0;
  if (!scale.answered(value, r)) return null;
  const row = scale.rows.find((x) => x.value === value);
  return { value, tone: scale.tone(value), key: row?.key ?? scale.noneKey };
}

// Counts per value for the shown month, and the sum (value − 1) for the 1–5 scales
export function viewMonthStats(byDate, year, month, view) {
  const prefix = `${monthKey(year, month)}-`;
  const scale = SCALES[view.scale];
  const s = { answered: 0, sum: 0, counts: Object.fromEntries(scale.rows.map((x) => [x.value, 0])) };
  for (const [key, r] of byDate) {
    if (!key.startsWith(prefix)) continue;
    const v = viewValue(view, r);
    if (!v) continue;
    s.answered += 1;
    if (s.counts[v.value] !== undefined) s.counts[v.value] += 1;
    if (scale.sum) s.sum += v.value - 1;
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

export const fill = (text = "", values = {}) =>
  Object.entries(values).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), text);

// "1 day" / "5 days" from the texts (CAL_DAY_ONE / CAL_DAY_OTHER) and the language's plural rules
export function formatDays(t, locale, n) {
  let rule = "other";
  try {
    rule = new Intl.PluralRules(locale).select(n);
  } catch {}
  return fill(rule === "one" ? t.CAL_DAY_ONE : t.CAL_DAY_OTHER, { n });
}

// ---------- Ranges, symptoms and the log ----------

export const keyOf = (d) => toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const startOfToday = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

// Other symptoms the app asks about. 1 = none (also what the app saves when a question is
// turned off), 2–5 = light to extreme. Counted as a "day with" from 2 and up.
export const SYMPTOMS = [
  { field: "endoBelly", key: "SYM_BLOATING" },
  { field: "bowelMovementPain", key: "SYM_BOWEL" },
  { field: "urinationPain", key: "SYM_URINATION" },
  { field: "sexualPain", key: "SYM_SEXUAL_PAIN" },
  { field: "fatigue", key: "SYM_FATIGUE" },
  { field: "stress", key: "SYM_STRESS" },
];
export const LEVEL_KEYS = { 2: "CAL_LIGHT", 3: "CAL_MEDIUM", 4: "CAL_HEAVY", 5: "CAL_EXTREME" };
export const ABSENCE_KEYS = { 2: "ABS_PARTIAL", 3: "ABS_ALL_DAY" };
export const MOOD_KEYS = { 1: "MOOD_1", 2: "MOOD_2", 3: "MOOD_3", 4: "MOOD_4", 5: "MOOD_5" };
export const SLEEP_KEYS = { 1: "SLEEP_Q_1", 2: "SLEEP_Q_2", 3: "SLEEP_Q_3" };
export const EFFECT_KEYS = { 1: "EFFECT_1", 2: "EFFECT_2", 3: "EFFECT_3" };

export const painLevel = (r) => Number(r?.intensity) || 0; // 0 = no registration
export const isPainDay = (r) => painLevel(r) >= 2;
export const lowMood = (r) => (Number(r?.emotion) || 0) >= 4; // 4 negative, 5 very negative

// Numbers for `days` days from `start` (a Date) – used by the summary, the comparison and the log
export function rangeStats(byDate, start, days) {
  const s = {
    registered: 0,
    pain: 0,
    severe: 0, // heavy or extreme
    levels: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    sum: 0,
    period: 0,
    medication: 0,
    absentWork: 0,
    absentSocial: 0,
    lowMood: 0,
    symptoms: Object.fromEntries(SYMPTOMS.map((x) => [x.field, 0])),
  };
  for (let i = 0; i < days; i++) {
    const r = byDate.get(keyOf(addDays(start, i)));
    if (!r) continue;
    s.registered += 1;
    const level = painLevel(r);
    if (s.levels[level] !== undefined) s.levels[level] += 1;
    if (level >= 1) s.sum += level - 1;
    if (level >= 2) s.pain += 1;
    if (level >= 4) s.severe += 1;
    if (hasBleeding(r)) s.period += 1;
    if (hasMedication(r)) s.medication += 1;
    if ((r.absentWork ?? 0) >= 2) s.absentWork += 1;
    if ((r.absentSocial ?? 0) >= 2) s.absentSocial += 1;
    if (lowMood(r)) s.lowMood += 1;
    for (const x of SYMPTOMS) if ((r[x.field] ?? 0) >= 2) s.symptoms[x.field] += 1;
  }
  return s;
}

// ISO week number (weeks start on Monday)
export function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
}

