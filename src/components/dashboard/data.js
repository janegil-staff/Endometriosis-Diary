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

