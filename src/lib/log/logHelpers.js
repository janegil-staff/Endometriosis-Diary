export const isoWeekYear = (dateStr) => {
  return dateStr.slice(0, 4);
};

export const combineScore = (r) => {
  if (!r) return 0;
  const fields = [
    r.intensity, r.endoBelly, r.bowelMovementPain,
    r.urinationPain, r.fatigue, r.stress, r.sexualPain,
  ];
  const vals = fields.filter((v) => v > 1);
  if (!vals.length) return 1;
  return Math.min(5, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
};

export const SCORE_COLOR = (score) => {
  if (!score || score <= 1) return { text: "#4a8aa8", bg: "#d6eef8", border: "#a8d8ea" };
  if (score <= 2) return { text: "#0f6a40", bg: "#edfaf6", border: "#a8e6d4" };
  if (score <= 3) return { text: "#a16200", bg: "#fefbe8", border: "#f6df85" };
  if (score <= 4) return { text: "#c05400", bg: "#fff4ed", border: "#fdc99a" };
  return               { text: "#b91c1c", bg: "#fff0f0", border: "#fca5a5" };
};

export const filterRecords = (records, search, patient, t) => {
  if (!search.trim()) return records;
  const q = search.toLowerCase();
  return records.filter((r) => {
    if (r.date.includes(q)) return true;
    if (r.note?.toLowerCase().includes(q)) return true;
    if (r.acuteMedicines?.some((id) => {
      const med = patient.medicines?.find((m) => m.id === id);
      return med?.name?.toLowerCase().includes(q);
    })) return true;
    return false;
  });
};
