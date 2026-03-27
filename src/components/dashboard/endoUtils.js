export function scoreColor(score) {
  if (!score || score <= 1) return { bg: "rgba(201,112,96,0.06)", text: "#b07a70", border: "rgba(201,112,96,0.15)" };
  if (score <= 2) return { bg: "#f5e8e4", text: "#7a3a2e", border: "#e8b5a8" };
  if (score <= 3) return { bg: "#e8b5a8", text: "#5a2a20", border: "#d98878" };
  if (score <= 4) return { bg: "#c97060", text: "#fff",    border: "#a85848" };
  return               { bg: "#8b4038", text: "#fff",    border: "#6a2828" };
}

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
