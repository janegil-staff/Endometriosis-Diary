"use client";
import { Card } from "./Card";
import { BarChart } from "./Charts";

export function MonthlyScoreTrendCard({ t, scores }) {
  if (!scores || !Object.keys(scores).length) return null;
  const entries    = Object.entries(scores).sort(([a], [b]) => a.localeCompare(b));
  const monthNames = t.monthNames ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const data       = entries.map(([key, value]) => ({ label: monthNames[parseInt(key.slice(5,7))-1], value }));
  const latest     = data[data.length - 1];
  const prev       = data[data.length - 2];
  const trend      = prev ? latest.value - prev.value : 0;
  const scoreColor = (v) => v <= 10 ? "#4CC189" : v <= 20 ? "#FFC659" : v <= 30 ? "#FF7473" : "#BE3830";

  return (
    <Card
      title={t.monthlyTrend ?? "Monthly trend"}
      accent={{ value: latest.value, color: scoreColor(latest.value) }}
      subtitle={latest.label}
    >
      {prev && (
        <p className="text-xs mb-3" style={{ color: trend > 0 ? "#FF7473" : trend < 0 ? "#4CC189" : "#b07a70" }}>
          {trend > 0 ? `▲ +${trend}` : trend < 0 ? `▼ ${trend}` : "→ 0"} {t.fromLastMonth ?? "from last month"}
        </p>
      )}
      <BarChart data={data} colorFn={(d) => scoreColor(d.value)} height={80} />
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}

export function MoodPainCard({ t, records }) {
  const data = records.filter((r) => r.intensity > 1 && r.emotion > 1);
  if (data.length < 3) return null;

  const n   = data.length;
  const am  = data.reduce((s, r) => s + r.emotion, 0) / n;
  const ap  = data.reduce((s, r) => s + r.intensity, 0) / n;
  const cov = data.reduce((s, r) => s + (r.emotion - am) * (r.intensity - ap), 0) / n;
  const sm  = Math.sqrt(data.reduce((s, r) => s + (r.emotion - am) ** 2, 0) / n);
  const sp  = Math.sqrt(data.reduce((s, r) => s + (r.intensity - ap) ** 2, 0) / n);
  const corr = sm && sp ? Math.round((cov / (sm * sp)) * 100) / 100 : 0;

  const corrLabel = corr > 0.4 ? (t.moodPainPositive ?? "Higher pain tends to come with worse mood")
    : corr < -0.4 ? (t.moodPainNegative ?? "Better mood associated with less pain")
    : (t.noCorrelation ?? "No clear mood-pain relationship");
  const corrColor = corr > 0.3 ? "#FF7473" : corr < -0.3 ? "#4CC189" : "#b07a70";

  const byPain = [1,2,3,4,5].map((p) => {
    const subset = records.filter((r) => r.intensity === p && r.emotion > 0);
    return {
      pain: p,
      avgMood: subset.length ? Math.round(subset.reduce((s, r) => s + r.emotion, 0) / subset.length * 10) / 10 : null,
      count: subset.length,
    };
  }).filter((d) => d.count > 0);

  const painBg = (p) => p <= 2 ? "#4CC189" : p <= 3 ? "#FFC659" : p <= 4 ? "#FF7473" : "#BE3830";

  return (
    <Card title={t.moodPainCorrelation ?? "Mood vs pain"}>
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl"
        style={{ background: "rgba(201,112,96,0.05)", border: "1px solid rgba(201,112,96,0.1)" }}>
        <div>
          <p className="text-2xl font-extrabold" style={{ color: "#c97060" }}>{corr > 0 ? "+" : ""}{corr}</p>
          <p className="text-xs" style={{ color: "#b07a70" }}>{t.correlation ?? "correlation"}</p>
        </div>
        <p className="text-xs flex-1 leading-relaxed" style={{ color: corrColor }}>{corrLabel}</p>
      </div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#b07a70" }}>
        {t.avgMoodByPain ?? "Avg mood by pain level"}
      </p>
      <div className="space-y-1.5">
        {byPain.map(({ pain, avgMood, count }) => (
          <div key={pain} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: painBg(pain) }} />
            <span className="text-xs w-16 shrink-0" style={{ color: "#7a5a54" }}>{t.painScore ?? "Pain"} {pain}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(201,112,96,0.1)" }}>
              <div className="h-full rounded-full" style={{ width: `${((avgMood ?? 0) / 5) * 100}%`, background: "#c97060" }} />
            </div>
            <span className="text-xs font-bold w-6 text-right" style={{ color: "#8b4038" }}>{avgMood ?? "–"}</span>
            <span className="text-xs w-8" style={{ color: "#b07a70" }}>({count})</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SymptomRadarCard({ t, records }) {
  const active = records.filter((r) => r.intensity > 1);
  if (!active.length) return null;

  const fields = [
    { key: "intensity",         labelKey: "symptomPain",      fallback: "Pain"       },
    { key: "endoBelly",         labelKey: "symptomEndoBelly", fallback: "Endo belly" },
    { key: "bowelMovementPain", labelKey: "symptomBowel",     fallback: "Bowel"      },
    { key: "fatigue",           labelKey: "symptomFatigue",   fallback: "Fatigue"    },
    { key: "stress",            labelKey: "symptomStress",    fallback: "Stress"     },
    { key: "urinationPain",     labelKey: "symptomUrination", fallback: "Urination"  },
  ];

  const avgs = fields.map(({ key, labelKey, fallback }) => {
    const vals = active.map((r) => r[key] ?? 1).filter((v) => v > 1);
    return {
      label: t[labelKey] ?? fallback,
      value: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 1,
    };
  });

  const n = avgs.length, cx = 100, cy = 100, R = 70;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i, val) => {
    const r = ((val - 1) / 4) * R;
    return { x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) };
  };
  const gridPoints = (level) =>
    avgs.map((_, i) => {
      const r = ((level - 1) / 4) * R;
      return `${cx + r * Math.cos(angle(i))},${cy + r * Math.sin(angle(i))}`;
    }).join(" ");
  const dataPoints = avgs.map((d, i) => point(i, d.value));

  return (
    <Card title={t.symptomProfile ?? "Symptom profile"}>
      <svg viewBox="0 0 200 200" width="100%" style={{ display: "block", maxHeight: 200 }}>
        {[1,2,3,4,5].map((l) => (
          <polygon key={l} points={gridPoints(l)} fill="none" stroke="rgba(201,112,96,0.15)" strokeWidth="0.8" />
        ))}
        {avgs.map((_, i) => {
          const end = point(i, 5);
          return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(201,112,96,0.12)" strokeWidth="0.8" />;
        })}
        <polygon points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(201,112,96,0.2)" stroke="#c97060" strokeWidth="1.5" />
        {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#c97060" />)}
        {avgs.map((d, i) => {
          const p = point(i, 5.8);
          return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#7a5a54">{d.label.slice(0,8)}</text>;
        })}
      </svg>
      <div className="grid grid-cols-2 gap-1 mt-2">
        {avgs.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#c97060" }} />
            <span className="text-xs" style={{ color: "#7a5a54" }}>{label}</span>
            <span className="text-xs font-bold ml-auto" style={{ color: "#8b4038" }}>{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DayOfWeekCard({ t, records }) {
  const active    = records.filter((r) => r.intensity > 1);
  if (!active.length) return null;
  const dayKeys   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const dayLabels = t.days ?? dayKeys;

  const byDow = dayKeys.map((_, i) => {
    const subset = active.filter((r) => (new Date(r.date).getDay() + 6) % 7 === i);
    return {
      label: dayLabels[i] ?? dayKeys[i],
      avg: subset.length ? Math.round(subset.reduce((s, r) => s + r.intensity, 0) / subset.length * 10) / 10 : null,
      count: subset.length,
    };
  });
  const max = Math.max(...byDow.map((d) => d.avg ?? 0), 1);
  const painColor = (v) => !v ? "#e0c0b8" : v <= 2 ? "#4CC189" : v <= 3 ? "#FFC659" : v <= 4 ? "#FF7473" : "#BE3830";

  return (
    <Card title={t.dayOfWeekPattern ?? "Day-of-week patterns"}>
      <div className="space-y-1.5">
        {byDow.map(({ label, avg, count }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs w-8 shrink-0 font-medium" style={{ color: "#7a5a54" }}>{label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(201,112,96,0.1)" }}>
              <div className="h-full rounded-full" style={{ width: avg ? `${(avg/max)*100}%` : "0%", background: painColor(avg) }} />
            </div>
            <span className="text-xs font-bold w-6 text-right" style={{ color: painColor(avg) }}>{avg ?? "–"}</span>
            <span className="text-xs w-8" style={{ color: "#b07a70" }}>({count})</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
