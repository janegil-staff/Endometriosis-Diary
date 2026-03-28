"use client";
import { Card } from "./Card";
import { BarChart, LineChart } from "./Charts";

export function ActivityCard({ t, activityData }) {
  if (!activityData.length) return null;
  const avg = Math.round(activityData.reduce((s, d) => s + d.value, 0) / activityData.length);
  return (
    <Card
      title={t.physicalActivity ?? "Physical activity"}
      accent={{ value: `${avg} min`, color: "#5cb85c" }}
      subtitle={t.avgSymptoms ?? "Average"}
    >
      <BarChart data={activityData} colorFn={() => "#5cb85c"} height={80} />
      <div className="flex justify-between mt-1">
        {activityData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}

export function SleepCard({ t, sleepData }) {
  if (!sleepData.length) return null;
  const avg = (sleepData.reduce((s, d) => s + d.value, 0) / sleepData.length).toFixed(1);
  return (
    <Card
      title={t.symptomSleep ?? "Sleep"}
      accent={{ value: `${avg}h`, color: "#7b68ee" }}
      subtitle={t.avgSymptoms ?? "Average"}
    >
      <LineChart data={sleepData} color="#7b68ee" min={0} height={80} />
      <div className="flex justify-between mt-1">
        {sleepData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}

export function SleepQualityCard({ t, records }) {
  const data = records.filter((r) => r.sleepQuality > 1);
  if (!data.length) return null;

  const trendData = data.map((r) => ({ label: r.date.slice(8), value: r.sleepQuality }));
  const avg       = Math.round(data.reduce((s, r) => s + r.sleepQuality, 0) / data.length * 10) / 10;

  const dist = [1,2,3,4,5].map((q) => ({
    label: q === 1 ? (t.veryPoor ?? "Very poor")
         : q === 2 ? (t.poor    ?? "Poor")
         : q === 3 ? (t.fair    ?? "Fair")
         : q === 4 ? (t.good    ?? "Good")
         :           (t.veryGood ?? "Very good"),
    count: data.filter((r) => r.sleepQuality === q).length,
    color: q <= 2 ? "#FF7473" : q === 3 ? "#FFC659" : "#4CC189",
  })).filter((d) => d.count > 0);

  const maxCount = Math.max(...dist.map((d) => d.count), 1);

  return (
    <Card
      title={t.sleepQualityTitle ?? "Sleep quality"}
      accent={{ value: avg, color: avg >= 3 ? "#4CC189" : avg >= 2 ? "#FFC659" : "#FF7473" }}
      subtitle={t.avgSymptoms ?? "Average"}
    >
      <LineChart data={trendData} color="#7b68ee" min={1} max={5} height={70} />
      <div className="flex justify-between mt-1 mb-3">
        {trendData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>{d.label}</span>
        ))}
      </div>
      <div className="space-y-1.5">
        {dist.map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs w-16 shrink-0" style={{ color: "#7a5a54" }}>{label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(201,112,96,0.1)" }}>
              <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, background: color }} />
            </div>
            <span className="text-xs font-bold w-4 text-right" style={{ color }}>{count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SleepPainCard({ t, records }) {
  const data = records.filter((r) => r.sleepHours > 0 && r.intensity > 1);
  if (data.length < 3) return null;

  const n    = data.length;
  const avgS = data.reduce((s, r) => s + r.sleepHours, 0) / n;
  const avgP = data.reduce((s, r) => s + r.intensity, 0) / n;
  const cov  = data.reduce((s, r) => s + (r.sleepHours - avgS) * (r.intensity - avgP), 0) / n;
  const stdS = Math.sqrt(data.reduce((s, r) => s + (r.sleepHours - avgS) ** 2, 0) / n);
  const stdP = Math.sqrt(data.reduce((s, r) => s + (r.intensity - avgP) ** 2, 0) / n);
  const corr = stdS && stdP ? Math.round((cov / (stdS * stdP)) * 100) / 100 : 0;

  const corrLabel = corr < -0.5 ? (t.strongNegative ?? "Strong: more sleep = less pain")
    : corr < -0.2 ? (t.weakNegative  ?? "Mild: more sleep tends to help")
    : corr >  0.3 ? (t.positive      ?? "More sleep associated with more pain")
    :                (t.noCorrelation ?? "No clear correlation");
  const corrColor = corr < -0.3 ? "#4CC189" : corr > 0.3 ? "#FF7473" : "#b07a70";

  const buckets = [
    { label: "<4h",  filter: (r) => r.sleepHours < 4 },
    { label: "4–6h", filter: (r) => r.sleepHours >= 4 && r.sleepHours < 6 },
    { label: "6–8h", filter: (r) => r.sleepHours >= 6 && r.sleepHours < 8 },
    { label: "8h+",  filter: (r) => r.sleepHours >= 8 },
  ].map(({ label, filter }) => {
    const subset = data.filter(filter);
    return {
      label,
      avg: subset.length ? Math.round(subset.reduce((s, r) => s + r.intensity, 0) / subset.length * 10) / 10 : null,
      count: subset.length,
    };
  }).filter((b) => b.count > 0);

  return (
    <Card title={t.sleepPainCorrelation ?? "Sleep vs pain"}>
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl"
        style={{ background: "rgba(123,104,238,0.05)", border: "1px solid rgba(123,104,238,0.12)" }}>
        <div>
          <p className="text-2xl font-extrabold" style={{ color: "#7b68ee" }}>{corr > 0 ? "+" : ""}{corr}</p>
          <p className="text-xs" style={{ color: "#b07a70" }}>{t.correlation ?? "correlation"}</p>
        </div>
        <p className="text-xs flex-1 leading-relaxed" style={{ color: corrColor }}>{corrLabel}</p>
      </div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#b07a70" }}>
        {t.avgPainBySleep ?? "Avg pain by sleep duration"}
      </p>
      <div className="space-y-1.5">
        {buckets.map(({ label, avg, count }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs w-10 shrink-0" style={{ color: "#7a5a54" }}>{label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(201,112,96,0.1)" }}>
              <div className="h-full rounded-full"
                style={{ width: `${((avg ?? 0) / 5) * 100}%`, background: avg >= 4 ? "#FF7473" : avg >= 3 ? "#FFC659" : "#4CC189" }} />
            </div>
            <span className="text-xs font-bold w-6 text-right" style={{ color: "#8b4038" }}>{avg ?? "–"}</span>
            <span className="text-xs w-8" style={{ color: "#b07a70" }}>({count})</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
