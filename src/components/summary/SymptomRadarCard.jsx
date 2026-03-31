"use client";
import { Card } from "@/components/summary/Card";

const AXES = [
  { key: "intensity",         labelKey: "symptomPain",       fallback: "Pelvic pain"  },
  { key: "endoBelly",         labelKey: "symptomEndoBelly",  fallback: "Endo belly"   },
  { key: "bowelMovementPain", labelKey: "symptomBowel",      fallback: "Bowel pain"   },
  { key: "urinationPain",     labelKey: "symptomUrination",  fallback: "Urination"    },
  { key: "fatigue",           labelKey: "symptomFatigue",    fallback: "Fatigue"      },
  { key: "stress",            labelKey: "symptomStress",     fallback: "Stress"       },
  { key: "sexualPain",        labelKey: "symptomSexualPain", fallback: "Sexual pain"  },
  { key: "emotion",           labelKey: "symptomEmotion",    fallback: "Mood"         },
];

const CX = 200;
const CY = 200;
const R  = 120;
const N  = AXES.length;

function polarPoint(angle, radius) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

function pointsStr(pts) {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

export function SymptomRadarCard({ t, records = [] }) {
  if (!records.length) return null;

  // Compute avg per axis (1–5 scale, only days recorded)
  const avgs = AXES.map(({ key }) => {
    const vals = records.map((r) => r[key] ?? 1);
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  });

  // Check if there's meaningful data (at least one avg > 1.5)
  if (avgs.every((a) => a <= 1.2)) return null;

  // Map avg (1–5) → radius (0–R)
  const toR = (avg) => ((avg - 1) / 4) * R;

  const angleStep = 360 / N;

  // Grid rings at 1,2,3,4,5
  const gridLevels = [1, 2, 3, 4, 5];

  // Data polygon points
  const dataPoints = avgs.map((avg, i) => polarPoint(i * angleStep, toR(avg)));

  // Label positions (slightly outside R)
  const labelPad = 20;
  const labelPoints = AXES.map((_, i) => polarPoint(i * angleStep, R + labelPad));

  return (
    <Card title={t.symptomProfile ?? "Symptom profile"}>
      <svg
        width="100%"
        viewBox={`0 0 400 400`}
        style={{ display: "block", margin: "0 auto" }}
      >
        {/* Grid rings */}
        {gridLevels.map((level) => {
          const r = toR(level);
          const pts = AXES.map((_, i) => polarPoint(i * angleStep, r));
          return (
            <polygon
              key={level}
              points={pointsStr(pts)}
              fill="none"
              stroke="rgba(201,112,96,0.15)"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Axis spokes */}
        {AXES.map((_, i) => {
          const end = polarPoint(i * angleStep, R);
          return (
            <line
              key={i}
              x1={CX} y1={CY}
              x2={end.x.toFixed(1)} y2={end.y.toFixed(1)}
              stroke="rgba(201,112,96,0.12)"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Scale labels on first axis (top) */}
        {[1, 2, 3, 4, 5].map((level) => {
          const pt = polarPoint(0, toR(level));
          return (
            <text
              key={level}
              x={pt.x + 4}
              y={pt.y + 4}
              fontSize="9"
              fill="rgba(201,112,96,0.5)"
              fontFamily="sans-serif"
            >
              {level}
            </text>
          );
        })}

        {/* Data polygon */}
        <polygon
          points={pointsStr(dataPoints)}
          fill="rgba(201,112,96,0.18)"
          stroke="#c97060"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Data dots */}
        {dataPoints.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x.toFixed(1)}
            cy={pt.y.toFixed(1)}
            r="3.5"
            fill="#c97060"
          />
        ))}

        {/* Axis labels */}
        {AXES.map(({ labelKey, fallback }, i) => {
          const pt   = labelPoints[i];
          const angle = i * angleStep;
          const anchor =
            angle === 0   ? "middle" :
            angle < 180   ? "start"  :
            angle === 180 ? "middle" : "end";
          const label = t[labelKey] ?? fallback;
          const avg   = avgs[i].toFixed(1);
          return (
            <g key={i}>
              <text
                x={pt.x.toFixed(1)}
                y={pt.y.toFixed(1)}
                textAnchor={anchor}
                fontSize="11"
                fontWeight="500"
                fill="#5a3a34"
                fontFamily="sans-serif"
              >
                {label}
              </text>
              <text
                x={pt.x.toFixed(1)}
                y={(pt.y + 13).toFixed(1)}
                textAnchor={anchor}
                fontSize="10"
                fill="#b07a70"
                fontFamily="sans-serif"
              >
                avg {avg}
              </text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
}
