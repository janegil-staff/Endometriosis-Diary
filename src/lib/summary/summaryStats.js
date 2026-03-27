// Combine symptom fields into a score 1-5
export function combineScore(r) {
  if (!r) return 0;
  const fields = [
    r.intensity, r.endoBelly, r.bowelMovementPain,
    r.urinationPain, r.fatigue, r.stress, r.sexualPain,
  ];
  const vals = fields.filter((v) => v > 1);
  if (!vals.length) return 1;
  return Math.min(5, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
}

// Pain trend per day
export const buildPainTrend = (records, t) =>
  records
    .map((r) => ({
      label: r.date.slice(8), // day number
      value: combineScore(r),
    }))
    .filter((d) => d.value > 1);

// Flare-up days per day
export const buildFlareData = (records, t) =>
  records
    .filter((r) => r.intensity >= 4 || r.bowelMovementPain >= 4 || r.endoBelly >= 4)
    .map((r) => ({
      label: r.date.slice(8),
      value: combineScore(r),
    }));

// Activity per day
export const buildActivityData = (records, t) =>
  records
    .filter((r) => r.physicalActivity > 0)
    .map((r) => ({
      label: r.date.slice(8),
      value: r.physicalActivity,
    }));

// Medicine usage
export const buildMedUsage = (records, patient) => {
  const medUsage = {};
  records.forEach((r) => {
    (r.acuteMedicines ?? []).forEach((id, i) => {
      const name =
        (patient.medicines ?? []).find((m) => m.id === id)?.name ?? `ID ${id}`;
      if (!medUsage[name]) medUsage[name] = { count: 0, times: 0 };
      medUsage[name].count++;
      medUsage[name].times += r.acuteMedicinesUsedTimes?.[i] ?? 1;
    });
  });
  return Object.entries(medUsage).sort((a, b) => b[1].count - a[1].count);
};

// Period days
export const buildPeriodData = (records) =>
  records
    .filter((r) => r.period >= 2)
    .map((r) => ({
      label: r.date.slice(8),
      value: r.period,
    }));

// Sleep data
export const buildSleepData = (records) =>
  records
    .filter((r) => r.sleepHours > 0)
    .map((r) => ({
      label: r.date.slice(8),
      value: r.sleepHours,
    }));

// Overview stats
export const buildPainStats = (records) => {
  const scores = records.map(combineScore).filter((v) => v > 1);
  return {
    avgPain:  scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
    minPain:  scores.length ? Math.min(...scores) : null,
    maxPain:  scores.length ? Math.max(...scores) : null,
    flareUps: records.filter((r) => r.intensity >= 4 || r.bowelMovementPain >= 4 || r.endoBelly >= 4).length,
    periodDays: records.filter((r) => r.period >= 2).length,
  };
};
