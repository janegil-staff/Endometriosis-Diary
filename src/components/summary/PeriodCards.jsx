"use client";
import { Card } from "./Card";
import { BarChart } from "./Charts";

export function PeriodCard({ t, periodData, months, vm, vy }) {
  if (!periodData.length) return null;
  return (
    <Card title={t.symptomPeriod ?? "Menstrual flow"} subtitle={months[vm] + " " + vy}>
      <BarChart data={periodData} colorFn={() => "#e05a5a"} height={80} />
      <div className="flex justify-between mt-1">
        {periodData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}

export function CyclePredictionCard({ t, records }) {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  const hadPeriodRecently = (dateStr, days = 5) => {
    const d = new Date(dateStr);
    for (let i = 1; i <= days; i++) {
      const prev = new Date(d);
      prev.setDate(d.getDate() - i);
      const key = prev.toISOString().slice(0, 10);
      const rec = sorted.find((r) => r.date === key);
      if (rec && rec.period >= 2) return true;
    }
    return false;
  };

  const periodStarts = sorted
    .filter((r) => r.period >= 2 && !hadPeriodRecently(r.date))
    .map((r) => r.date);

  if (periodStarts.length < 2) return null;

  const msPerDay  = 86400000;
  const gaps      = periodStarts.slice(1).map((d, i) =>
    Math.round((new Date(d) - new Date(periodStarts[i])) / msPerDay),
  );
  const avgCycle  = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  const lastStart = new Date(periodStarts[periodStarts.length - 1]);
  const nextDate  = new Date(lastStart.getTime() + avgCycle * msPerDay);
  const fmt       = (d) => `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
  const daysUntil = Math.round((nextDate - new Date()) / msPerDay);

  return (
    <Card title={t.cycleLength ?? "Cycle prediction"}>
      <div className="flex gap-3 mb-4">
        {[
          { label: t.avgCycle ?? "Avg cycle",     value: `${avgCycle}d`,      color: "#e05a5a" },
          { label: t.cycles   ?? "Cycles logged", value: periodStarts.length, color: "#c97060" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 rounded-xl p-3 text-center"
            style={{ background: "rgba(224,90,90,0.04)", border: "1px solid rgba(224,90,90,0.1)" }}>
            <p className="text-xs mb-1" style={{ color: "#b07a70" }}>{label}</p>
            <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-3 mb-3"
        style={{ background: "rgba(224,90,90,0.05)", border: "1px solid rgba(224,90,90,0.12)" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: "#b07a70" }}>{t.lastPeriod ?? "Last period"}</span>
          <span className="text-xs font-bold" style={{ color: "#e05a5a" }}>{fmt(lastStart)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#b07a70" }}>{t.nextPeriod ?? "Next predicted"}</span>
          <span className="text-xs font-bold" style={{ color: "#e05a5a" }}>
            {fmt(nextDate)}
            {daysUntil >= 0
              ? ` (${daysUntil === 0 ? (t.today ?? "today") : `${daysUntil}d`})`
              : ` (${Math.abs(daysUntil)}d ${t.ago ?? "ago"})`}
          </span>
        </div>
      </div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#b07a70" }}>
        {t.cycleHistory ?? "Cycle history"}
      </p>
      <div className="flex gap-1 flex-wrap">
        {gaps.map((g, i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(224,90,90,0.08)", color: "#e05a5a", border: "1px solid rgba(224,90,90,0.15)" }}>
            {g}d
          </span>
        ))}
      </div>
    </Card>
  );
}
