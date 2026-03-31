"use client";
import { Card } from "./Card";
import { StatRow } from "./StatRow";
import { BarChart, LineChart } from "./Charts";
import { PAIN_COLOR } from "../../lib/summary/scoreHelpers";

export function PainOverviewCard({ t, avgPain, recordsCount, light, medium, heavy, extreme }) {
  const dayLabel = (n) => `${n} ${n === 1 ? "day" : "days"}`;
  return (
    <Card
      title={t.monthlySummary ?? "Month summary"}
      accent={avgPain != null ? { value: avgPain, color: PAIN_COLOR(avgPain) } : undefined}
      subtitle={t.avgSymptoms ?? "Avg. pain"}
    >
      <StatRow label={t.daysRecorded ?? "Month sum"} value={recordsCount}     color="#c97060" />
      <StatRow label={t.mild    ?? "Light"}           value={dayLabel(light)}   color="#4CC189" />
      <StatRow label={t.moderate ?? "Medium"}         value={dayLabel(medium)}  color="#d4a017" />
      <StatRow label={t.serious  ?? "Heavy"}          value={dayLabel(heavy)}   color="#FF7473" />
      <StatRow label={t.veryHigh ?? "Extreme"}        value={dayLabel(extreme)} color="#BE3830" />
    </Card>
  );
}

export function PainTrendCard({ t, painTrend, months, vm, vy, recordsCount = 0 }) {
  if (!painTrend.length) return null;
  const thin = recordsCount > 31;
  return (
    <Card title={t.painScore ?? "Pain score"} subtitle={months[vm] + " " + vy}>
      <LineChart data={painTrend} color="#c97060" min={1} max={5} height={90} thin={thin} />
      <div className="flex justify-between mt-1">
        {painTrend.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: thin ? 8 : 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}

export function FlareUpCard({ t, flareData, months, vm, vy, recordsCount = 0 }) {
  if (!flareData.length) return null;
  const thin = recordsCount > 31;
  return (
    <Card title={t.exacerbation ?? "Flare-ups"} subtitle={months[vm] + " " + vy}>
      <BarChart data={flareData} colorFn={() => "#f5a623"} height={80} thin={thin} />
      <div className="flex justify-between mt-1">
        {flareData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: thin ? 8 : 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}