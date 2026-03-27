"use client";
import { Card } from "./Card";
import { StatRow } from "./StatRow";
import { BarChart, LineChart } from "./Charts";
import { PAIN_COLOR } from "../../lib/summary/scoreHelpers";

// ── Pain Overview Card — matches dashboard monthly summary exactly ──────────
export function PainOverviewCard({
  t,
  avgPain,
  minPain,
  maxPain,
  flareUps,
  periodDays,
  recordsCount,
  light,
  medium,
  heavy,
  extreme,
  medicineDays,
}) {
  const dayLabel = (n) => `${n} ${n === 1 ? "day" : "days"}`;
  return (
    <Card
      title={t.monthlySummary ?? "Month summary"}
      accent={
        avgPain != null
          ? { value: avgPain, color: PAIN_COLOR(avgPain) }
          : undefined
      }
      subtitle={t.avgSymptoms ?? "Avg. pain"}
    >
      <StatRow
        label={t.daysRecorded ?? "Month sum"}
        value={recordsCount}
        color="#c97060"
      />
      <StatRow
        label={t.mild ?? "Light"}
        value={dayLabel(light)}
        color="#4CC189"
      />
      <StatRow
        label={t.moderate ?? "Medium"}
        value={dayLabel(medium)}
        color="#d4a017"
      />
      <StatRow
        label={t.serious ?? "Heavy"}
        value={dayLabel(heavy)}
        color="#FF7473"
      />
      <StatRow
        label={t.veryHigh ?? "Extreme"}
        value={dayLabel(extreme)}
        color="#BE3830"
      />
    </Card>
  );
}

// ── Pain Trend Card (replaces CatTrendCard) ────────────────────────────────
export function PainTrendCard({ t, painTrend, months, vm, vy }) {
  if (!painTrend.length) return null;
  return (
    <Card title={t.painScore ?? "Pain score"} subtitle={months[vm] + " " + vy}>
      <LineChart data={painTrend} color="#c97060" min={1} max={5} height={90} />
      <div className="flex justify-between mt-1">
        {painTrend.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>
            {d.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

// ── Flare-up Card (replaces ExacerbationCard) ──────────────────────────────
export function FlareUpCard({ t, flareData, months, vm, vy }) {
  if (!flareData.length) return null;
  return (
    <Card
      title={t.exacerbation ?? "Flare-ups"}
      subtitle={months[vm] + " " + vy}
    >
      <BarChart data={flareData} colorFn={() => "#f5a623"} height={80} />
      <div className="flex justify-between mt-1">
        {flareData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>
            {d.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

// ── Period Card ────────────────────────────────────────────────────────────
export function PeriodCard({ t, periodData, months, vm, vy }) {
  if (!periodData.length) return null;
  return (
    <Card
      title={t.symptomPeriod ?? "Menstrual flow"}
      subtitle={months[vm] + " " + vy}
    >
      <BarChart data={periodData} colorFn={() => "#e05a5a"} height={80} />
      <div className="flex justify-between mt-1">
        {periodData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>
            {d.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

// ── Activity Card ──────────────────────────────────────────────────────────
export function ActivityCard({ t, activityData }) {
  if (!activityData.length) return null;
  const avg = Math.round(
    activityData.reduce((s, d) => s + d.value, 0) / activityData.length,
  );
  return (
    <Card
      title={t.physicalActivity ?? "Physical activity"}
      accent={{ value: `${avg} min`, color: "#5cb85c" }}
      subtitle={t.avgSymptoms ?? "Average"}
    >
      <BarChart data={activityData} colorFn={() => "#5cb85c"} height={80} />
      <div className="flex justify-between mt-1">
        {activityData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>
            {d.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

// ── Sleep Card ─────────────────────────────────────────────────────────────
export function SleepCard({ t, sleepData }) {
  if (!sleepData.length) return null;
  const avg = (
    sleepData.reduce((s, d) => s + d.value, 0) / sleepData.length
  ).toFixed(1);
  return (
    <Card
      title={t.symptomSleep ?? "Sleep"}
      accent={{ value: `${avg}h`, color: "#7b68ee" }}
      subtitle={t.avgSymptoms ?? "Average"}
    >
      <LineChart data={sleepData} color="#7b68ee" min={0} height={80} />
      <div className="flex justify-between mt-1">
        {sleepData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>
            {d.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

// ── Medicine Card ──────────────────────────────────────────────────────────
export function MedicineCard({ t, medList, recordsCount }) {
  if (!medList.length) return null;
  return (
    <Card title={t.medicines ?? "Medicines"}>
      <div className="space-y-2 mt-1">
        {medList.map(([name, stats]) => (
          <div
            key={name}
            className="flex items-center gap-3 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(201,112,96,0.05)",
              border: "1px solid rgba(201,112,96,0.12)",
            }}
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "#5a3a34" }}
              >
                {name}
              </p>
              <p className="text-xs" style={{ color: "#b07a70" }}>
                {stats.count} {(t.daysRecorded ?? "days")?.toLowerCase()} ·{" "}
                {stats.times} {t.timesUsed ?? "× used"}
              </p>
            </div>
            <div
              className="w-16 h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(201,112,96,0.1)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((stats.count / Math.max(recordsCount, 1)) * 100, 100)}%`,
                  background: "#c97060",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
