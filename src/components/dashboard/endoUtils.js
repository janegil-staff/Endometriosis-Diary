export function scoreColor(score) {
  if (!score || score <= 1) return { bg: "#d6eef8",              text: "#4a8aa8", border: "#a8d8ea" };
  if (score <= 2)           return { bg: "#4CC189",              text: "#fff",    border: "#2e9e68" };
  if (score <= 3)           return { bg: "#FFC659",              text: "#7a5200", border: "#c99500" };
  if (score <= 4)           return { bg: "#FF7473",              text: "#fff",    border: "#cc4040" };
  return                           { bg: "#BE3830",              text: "#fff",    border: "#8a2020" };
}

export function combineScore(r) {
  if (!r) return 0;
  return r.intensity ?? 1;
}

export function resolveMedicines(record, medicines) {
  if (!record?.acuteMedicines?.length) return [];
  return record.acuteMedicines.map((id, i) => {
    const med = (medicines || []).find((m) => m.id === id);
    return {
      name:  med?.name ?? `Medicine ${id}`,
      dose:  record.acuteMedicinesDoses?.[i] ?? null,
      times: record.acuteMedicinesUsedTimes?.[i] ?? null,
      atc:   record.acuteMedicinesAtc?.[i] ?? null,
    };
  });
}

export function labelForScale(value, labels) {
  if (!labels || value == null) return value;
  return labels[value - 1] ?? value;
}