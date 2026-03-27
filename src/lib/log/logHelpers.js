export const isoWeekYear = (dateStr) => {
  return dateStr.slice(0, 4);
};

export const combineScore = (r) => {
  if (!r) return 0;
  return r.intensity ?? 1;
};

export const SCORE_COLOR = (score) => {
  if (!score || score <= 1)
    return { text: "#4a8aa8", bg: "#d6eef8", border: "#a8d8ea" };
  if (score <= 2) return { text: "#fff", bg: "#4CC189", border: "#2e9e68" };
  if (score <= 3) return { text: "#7a5200", bg: "#FFC659", border: "#c99500" };
  if (score <= 4) return { text: "#fff", bg: "#FF7473", border: "#cc4040" };
  return { text: "#fff", bg: "#BE3830", border: "#8a2020" };
};

export const filterRecords = (records, search, patient, t) => {
  if (!search.trim()) return records;
  const q = search.toLowerCase();
  return records.filter((r) => {
    if (r.date.includes(q)) return true;
    if (r.note?.toLowerCase().includes(q)) return true;
    if (
      r.acuteMedicines?.some((id) => {
        const med = patient.medicines?.find((m) => m.id === id);
        return med?.name?.toLowerCase().includes(q);
      })
    )
      return true;
    return false;
  });
};
