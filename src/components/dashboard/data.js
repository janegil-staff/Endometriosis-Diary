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
