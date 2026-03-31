"use client";
import { Card } from "@/components/summary/Card";

const SYMPTOMS = [
  { key: "intensity",         labelKey: "symptomPain",       fallback: "Pain"         },
  { key: "bowelMovementPain", labelKey: "symptomBowel",      fallback: "Bowel"        },
  { key: "endoBelly",         labelKey: "symptomEndoBelly",  fallback: "Endo belly"   },
  { key: "fatigue",           labelKey: "symptomFatigue",    fallback: "Fatigue"      },
  { key: "stress",            labelKey: "symptomStress",     fallback: "Stress"       },
  { key: "urinationPain",     labelKey: "symptomUrination",  fallback: "Urination"    },
  { key: "sexualPain",        labelKey: "symptomSexualPain", fallback: "Sexual pain"  },
  { key: "emotion",           labelKey: "symptomEmotion",    fallback: "Mood"         },
];

function heatColor(avg, count) {
  if (!count) return "rgba(201,112,96,0.06)";
  // avg is 1-5, map to colour
  if (avg < 1.5) return "#d6eef8";
  if (avg < 2.5) return "#4CC189";
  if (avg < 3.5) return "#FFC659";
  if (avg < 4.5) return "#FF7473";
  return "#BE3830";
}

function textColor(avg, count) {
  if (!count) return "#c0a0a0";
  if (avg < 1.5) return "#4a8aa8";
  if (avg < 2.5) return "#fff";
  if (avg < 3.5) return "#7a5200";
  return "#fff";
}

export function SymptomHeatmapCard({ t, records = [] }) {
  if (!records.length) return null;

  const stats = SYMPTOMS.map(({ key, labelKey, fallback }) => {
    const active = records.filter((r) => (r[key] ?? 0) >= 2);
    const avg    = active.length
      ? active.reduce((s, r) => s + (r[key] ?? 0), 0) / active.length
      : 0;
    const freq   = (active.length / records.length) * 100;
    return {
      key,
      label: t[labelKey] ?? fallback,
      avg:   Math.round(avg * 10) / 10,
      count: active.length,
      freq:  Math.round(freq),
    };
  }).sort((a, b) => b.freq - a.freq || b.avg - a.avg);

  return (
    <Card title={t.symptomProfile ?? "Symptom heatmap"}>
      <div className="grid grid-cols-4 gap-1.5 mt-1">
        {stats.map(({ key, label, avg, count, freq }) => (
          <div
            key={key}
            className="rounded-xl flex flex-col items-center justify-center text-center"
            style={{
              background: heatColor(avg, count),
              padding: "10px 4px",
              minHeight: 64,
              transition: "background 0.3s",
            }}
            title={`${label}: avg ${avg}, ${count} days (${freq}%)`}
          >
            <span
              className="text-xs font-bold leading-tight mb-1"
              style={{ color: textColor(avg, count), fontSize: 10 }}
            >
              {label}
            </span>
            {count > 0 ? (
              <>
                <span
                  className="font-extrabold"
                  style={{ color: textColor(avg, count), fontSize: 16, lineHeight: 1 }}
                >
                  {avg}
                </span>
                <span
                  style={{ color: textColor(avg, count), fontSize: 9, opacity: 0.8 }}
                >
                  {freq}%
                </span>
              </>
            ) : (
              <span style={{ color: "#c0a0a0", fontSize: 11 }}>–</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 justify-center flex-wrap">
        {[
          { color: "#d6eef8", label: t.painNone ?? "None"     },
          { color: "#4CC189", label: t.mild     ?? "Mild"     },
          { color: "#FFC659", label: t.moderate ?? "Moderate" },
          { color: "#FF7473", label: t.serious  ?? "Strong"   },
          { color: "#BE3830", label: t.veryHigh ?? "Extreme"  },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
            <span style={{ fontSize: 9, color: "#b07a70" }}>{label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-center mt-1" style={{ color: "#c0a0a0" }}>
        avg score · % of days
      </p>
    </Card>
  );
}
