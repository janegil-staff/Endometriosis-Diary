"use client";
import { Card } from "@/components/summary/Card";
import { BarChart, LineChart } from "@/components/summary/Charts";

export function ActivityCard({ t, activityData = [], recordsCount = 0 }) {
  if (!activityData?.length) return null;
  const thin = recordsCount > 31;
  const avg = Math.round(
    activityData.reduce((s, d) => s + d.value, 0) / activityData.length,
  );
  return (
    <Card
      title={t.physicalActivity ?? "Physical activity"}
      accent={{ value: `${avg} min`, color: "#5cb85c" }}
      subtitle={t.avgSymptoms ?? "Average"}
    >
      <BarChart data={activityData} colorFn={() => "#5cb85c"} height={80} thin={thin} />
      <div className="flex justify-between mt-1">
        {activityData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: thin ? 8 : 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}

export function SleepCard({ t, sleepData = [], recordsCount = 0 }) {
  if (!sleepData?.length) return null;
  const thin = recordsCount > 31;
  const avg = (
    sleepData.reduce((s, d) => s + d.value, 0) / sleepData.length
  ).toFixed(1);
  return (
    <Card
      title={t.sleepHours ?? "Sleep hours"}
      accent={{ value: `${avg}h`, color: "#7b68ee" }}
      subtitle={t.avgSymptoms ?? "Average"}
    >
      <LineChart data={sleepData} color="#7b68ee" min={0} max={12} height={80} thin={thin} />
      <div className="flex justify-between mt-1">
        {sleepData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: thin ? 8 : 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}

export function SleepPainCard({ t, records = [] }) {
  const data = (records ?? []).filter((r) => r.sleepHours > 0 && r.intensity > 1);
  if (data.length < 3) return null;

  const n    = data.length;
  const avgS = data.reduce((s, r) => s + r.sleepHours, 0) / n;
  const avgP = data.reduce((s, r) => s + r.intensity, 0) / n;
  const cov  = data.reduce((s, r) => s + (r.sleepHours - avgS) * (r.intensity - avgP), 0) / n;
  const stdS = Math.sqrt(data.reduce((s, r) => s + (r.sleepHours - avgS) ** 2, 0) / n);
  const stdP = Math.sqrt(data.reduce((s, r) => s + (r.intensity - avgP) ** 2, 0) / n);
  const corr = stdS && stdP ? Math.round((cov / (stdS * stdP)) * 100) / 100 : 0;

  const corrLabel =
    corr < -0.5 ? (t.strongNegative ?? "Strong: more sleep = less pain") :
    corr < -0.2 ? (t.weakNegative   ?? "Mild: more sleep tends to help") :
    corr >  0.2 ? (t.positive       ?? "More sleep associated with more pain") :
                  (t.noCorrelation  ?? "No clear correlation");

  const corrColor =
    corr < -0.5 ? "#4CC189" :
    corr < -0.2 ? "#81c784" :
    corr >  0.2 ? "#FF7473" : "#b07a70";

  return (
    <Card title={t.sleepPainCorrelation ?? "Sleep vs pain"}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-extrabold" style={{ color: corrColor }}>
          {corr > 0 ? "+" : ""}{corr}
        </span>
        <span className="text-xs" style={{ color: "#b07a70" }}>
          {t.correlation ?? "correlation"}
        </span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: corrColor }}>{corrLabel}</p>
    </Card>
  );
}