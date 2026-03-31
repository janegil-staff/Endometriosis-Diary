"use client";
import { Card } from "@/components/summary/Card";

export function SymptomBreakdownCard({ t, records = [] }) {
  if (!records?.length) return null;

  const SYMPTOMS = [
    { key: "intensity",         label: t.symptomPain       ?? "Pelvic pain",     color: "#c97060" },
    { key: "bowelMovementPain", label: t.symptomBowel      ?? "Bowel pain",      color: "#e07850" },
    { key: "endoBelly",         label: t.symptomEndoBelly  ?? "Endo belly",      color: "#d4885c" },
    { key: "urinationPain",     label: t.symptomUrination  ?? "Urination pain",  color: "#cd7890" },
    { key: "fatigue",           label: t.symptomFatigue    ?? "Fatigue",         color: "#9b7ac9" },
    { key: "stress",            label: t.symptomStress     ?? "Stress",          color: "#7b8ec9" },
    { key: "sexualPain",        label: t.symptomSexualPain ?? "Sexual pain",     color: "#d97fd9" },
    { key: "emotion",           label: t.symptomEmotion    ?? "Mood",            color: "#5ba8c9" },
    { key: "sleepQuality",      label: t.symptomSleep      ?? "Sleep quality",   color: "#4a9e8c" },
  ];

  // Compute avg per symptom, only over records where field > 1 (1 = none)
  const stats = SYMPTOMS.map(({ key, label, color }) => {
    const vals = records
      .map((r) => r[key] ?? 1)
      .filter((v) => v > 1);
    const avg = vals.length
      ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
      : null;
    const pct = vals.length / records.length; // how often this symptom appears
    return { key, label, color, avg, pct, count: vals.length };
  })
    .filter((s) => s.avg !== null)
    .sort((a, b) => b.avg - a.avg);

  if (!stats.length) return null;

  const maxAvg = 5; // scale is always 1–5

  return (
    <Card title={t.symptomProfile ?? "Symptom profile"}>
      <div className="flex flex-col gap-2.5 mt-1">
        {stats.map(({ label, color, avg, count }) => (
          <div key={label} className="flex items-center gap-2">
            {/* Label */}
            <span
              className="flex-shrink-0 text-right"
              style={{ fontSize: 11, color: "#7a5a54", width: 110 }}
            >
              {label}
            </span>

            {/* Bar */}
            <div
              className="flex-1 rounded-full overflow-hidden"
              style={{ height: 8, background: "rgba(201,112,96,0.08)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${((avg - 1) / (maxAvg - 1)) * 100}%`,
                  background: color,
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            {/* Avg value */}
            <span
              className="flex-shrink-0 font-bold tabular-nums"
              style={{ fontSize: 12, color, width: 28, textAlign: "right" }}
            >
              {avg}
            </span>

            {/* Day count */}
            <span
              className="flex-shrink-0"
              style={{ fontSize: 10, color: "#b07a70", width: 32 }}
            >
              ({count}d)
            </span>
          </div>
        ))}
      </div>

      {/* Scale hint */}
      <div className="flex justify-between mt-3 pt-2" style={{ borderTop: "1px solid rgba(201,112,96,0.08)" }}>
        <span style={{ fontSize: 9, color: "#c9a090" }}>2 = {t.mild ?? "mild"}</span>
        <span style={{ fontSize: 9, color: "#c9a090" }}>3 = {t.moderate ?? "moderate"}</span>
        <span style={{ fontSize: 9, color: "#c9a090" }}>4 = {t.serious ?? "heavy"}</span>
        <span style={{ fontSize: 9, color: "#c9a090" }}>5 = {t.veryHigh ?? "extreme"}</span>
      </div>
    </Card>
  );
}
