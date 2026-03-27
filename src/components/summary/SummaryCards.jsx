"use client";
import { Card } from "./Card";
import { StatRow } from "./StatRow";
import { BarChart, LineChart } from "./Charts";
import { PAIN_COLOR } from "../../lib/summary/scoreHelpers";

// ── Pain Overview Card — matches dashboard monthly summary exactly ──────────
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

// ── Pain Trend Card (replaces CatTrendCard) ────────────────────────────────
export function PainTrendCard({ t, painTrend, months, vm, vy }) {
  if (!painTrend.length) return null;
  return (
    <Card
      title={t.painScore ?? "Pain score"}
      subtitle={months[vm] + " " + vy}
    >
      <LineChart data={painTrend} color="#c97060" min={1} max={5} height={90} />
      <div className="flex justify-between mt-1">
        {painTrend.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}

// ── Flare-up Card (replaces ExacerbationCard) ──────────────────────────────
export function FlareUpCard({ t, flareData, months, vm, vy }) {
  if (!flareData.length) return null;
  return (
    <Card title={t.exacerbation ?? "Flare-ups"} subtitle={months[vm] + " " + vy}>
      <BarChart data={flareData} colorFn={() => "#f5a623"} height={80} />
      <div className="flex justify-between mt-1">
        {flareData.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}

// ── Period Card ────────────────────────────────────────────────────────────
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
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}

// ── Sleep Card ─────────────────────────────────────────────────────────────
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
              <p className="text-sm font-semibold truncate" style={{ color: "#5a3a34" }}>
                {name}
              </p>
              <p className="text-xs" style={{ color: "#b07a70" }}>
                {stats.count} {(t.daysRecorded ?? "days")?.toLowerCase()} · {stats.times} {t.timesUsed ?? "× used"}
              </p>
            </div>
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(201,112,96,0.1)" }}>
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

// ── Medicine Effectiveness Card ────────────────────────────────────────────
export function MedicineEffectivenessCard({ t, records }) {
  const withMed    = records.filter((r) => r.acuteMedicines?.length > 0);
  const withoutMed = records.filter((r) => !r.acuteMedicines?.length);
  if (!withMed.length) return null;

  const avg = (arr) => arr.length
    ? Math.round((arr.reduce((s, r) => s + (r.intensity ?? 1), 0) / arr.length) * 10) / 10
    : null;

  const avgWith    = avg(withMed);
  const avgWithout = avg(withoutMed);

  // Effect score distribution (0=none 1=low 2=med 3=good)
  const effectDist = [0, 1, 2, 3].map((e) => ({
    label: e === 0 ? (t.noEffect ?? "None")
         : e === 1 ? (t.mild     ?? "Low")
         : e === 2 ? (t.moderate ?? "Medium")
         :           (t.serious  ?? "Good"),
    count: withMed.filter((r) => (r.effect ?? 0) === e).length,
    color: e === 0 ? "#e0c0b8" : e === 1 ? "#FFC659" : e === 2 ? "#4CC189" : "#268E86",
  }));
  const maxCount = Math.max(...effectDist.map((d) => d.count), 1);

  return (
    <Card title={t.medicineSatisfaction ?? "Medicine effectiveness"}>
      <div className="flex gap-3 mb-4">
        {[
          { label: t.withMedicine    ?? "With medicine",    value: avgWith,    color: "#7b68ee" },
          { label: t.withoutMedicine ?? "Without medicine", value: avgWithout, color: "#c97060" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 rounded-xl p-3 text-center"
            style={{ background: "rgba(201,112,96,0.04)", border: "1px solid rgba(201,112,96,0.1)" }}>
            <p className="text-xs mb-1" style={{ color: "#b07a70" }}>{label}</p>
            <p className="text-xl font-extrabold" style={{ color }}>{value ?? "–"}</p>
            <p className="text-xs" style={{ color: "#b07a70" }}>{t.avgSymptoms ?? "avg pain"}</p>
          </div>
        ))}
      </div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#b07a70" }}>
        {t.effect ?? "Effect reported"}
      </p>
      <div className="space-y-1.5">
        {effectDist.map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs w-14 shrink-0" style={{ color: "#7a5a54" }}>{label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(201,112,96,0.1)" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${(count / maxCount) * 100}%`, background: color }} />
            </div>
            <span className="text-xs font-bold w-4 text-right" style={{ color }}>{count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Cycle Prediction Card ──────────────────────────────────────────────────
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

  const msPerDay = 86400000;
  const gaps = periodStarts.slice(1).map((d, i) =>
    Math.round((new Date(d) - new Date(periodStarts[i])) / msPerDay)
  );
  const avgCycle = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  const lastStart = new Date(periodStarts[periodStarts.length - 1]);
  const nextDate = new Date(lastStart.getTime() + avgCycle * msPerDay);
  const nextStr = `${String(nextDate.getDate()).padStart(2,"0")}.${String(nextDate.getMonth()+1).padStart(2,"0")}.${nextDate.getFullYear()}`;
  const lastStr = `${String(lastStart.getDate()).padStart(2,"0")}.${String(lastStart.getMonth()+1).padStart(2,"0")}.${lastStart.getFullYear()}`;

  const daysUntil = Math.round((nextDate - new Date()) / msPerDay);

  return (
    <Card title={t.cycleLength ?? "Cycle prediction"}>
      <div className="flex gap-3 mb-4">
        {[
          { label: t.avgCycle ?? "Avg cycle",    value: `${avgCycle}d`,  color: "#e05a5a" },
          { label: t.cycles   ?? "Cycles logged", value: periodStarts.length, color: "#c97060" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 rounded-xl p-3 text-center"
            style={{ background: "rgba(224,90,90,0.04)", border: "1px solid rgba(224,90,90,0.1)" }}>
            <p className="text-xs mb-1" style={{ color: "#b07a70" }}>{label}</p>
            <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-3" style={{ background: "rgba(224,90,90,0.05)", border: "1px solid rgba(224,90,90,0.12)" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: "#b07a70" }}>{t.lastPeriod ?? "Last period"}</span>
          <span className="text-xs font-bold" style={{ color: "#e05a5a" }}>{lastStr}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#b07a70" }}>{t.nextPeriod ?? "Next predicted"}</span>
          <span className="text-xs font-bold" style={{ color: "#e05a5a" }}>
            {nextStr}
            {daysUntil >= 0
              ? ` (${daysUntil === 0 ? (t.today ?? "today") : `${daysUntil}d`})`
              : ` (${Math.abs(daysUntil)}d ${t.ago ?? "ago"})`}
          </span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#b07a70" }}>
          {t.cycleHistory ?? "Cycle history"}
        </p>
        <div className="flex gap-1 flex-wrap mt-1">
          {gaps.map((g, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(224,90,90,0.08)", color: "#e05a5a", border: "1px solid rgba(224,90,90,0.15)" }}>
              {g}d
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── Sleep vs Pain Correlation Card ─────────────────────────────────────────
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

  // Sleep buckets: <4h, 4-6h, 6-8h, 8h+
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

// ── Absence Card ───────────────────────────────────────────────────────────
export function AbsenceCard({ t, records }) {
  const withAbsence = records.filter((r) => r.absentWork >= 2 || r.absentSocial >= 2);
  if (!withAbsence.length) return null;

  const workDays   = records.filter((r) => r.absentWork >= 2).length;
  const socialDays = records.filter((r) => r.absentSocial >= 2).length;
  const fullWork   = records.filter((r) => r.absentWork === 3).length;
  const fullSocial = records.filter((r) => r.absentSocial === 3).length;

  // By month
  const byMonth = {};
  records.forEach((r) => {
    const m = r.date.slice(0, 7);
    if (!byMonth[m]) byMonth[m] = { work: 0, social: 0 };
    if (r.absentWork   >= 2) byMonth[m].work++;
    if (r.absentSocial >= 2) byMonth[m].social++;
  });
  const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
  const maxVal = Math.max(...months.map(([, v]) => Math.max(v.work, v.social)), 1);

  return (
    <Card title={t.absence ?? "Absence & impact"}>
      <div className="flex gap-3 mb-4">
        {[
          { label: t.absentWork   ?? "Work days lost",   value: workDays,   sub: `${fullWork} full`,   color: "#e05a5a" },
          { label: t.absentSocial ?? "Social days lost", value: socialDays, sub: `${fullSocial} full`, color: "#f5a623" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="flex-1 rounded-xl p-3 text-center"
            style={{ background: "rgba(201,112,96,0.04)", border: "1px solid rgba(201,112,96,0.1)" }}>
            <p className="text-xs mb-1" style={{ color: "#b07a70" }}>{label}</p>
            <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: "#b07a70" }}>{sub}</p>
          </div>
        ))}
      </div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#b07a70" }}>
        {t.absenceByMonth ?? "By month"}
      </p>
      <div className="space-y-2">
        {months.map(([month, { work, social }]) => {
          const [y, m] = month.split("-");
          const monthNames = t.monthNames ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          const label = `${monthNames[parseInt(m)-1]} ${y}`;
          return (
            <div key={month}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs" style={{ color: "#7a5a54" }}>{label}</span>
                <span className="text-xs" style={{ color: "#b07a70" }}>
                  {work > 0 && `🏢 ${work}`} {social > 0 && `👥 ${social}`}
                </span>
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(224,90,90,0.1)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(work/maxVal)*100}%`, background: "#e05a5a" }} />
                </div>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(245,166,35,0.1)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(social/maxVal)*100}%`, background: "#f5a623" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#e05a5a" }} />
          <span className="text-xs" style={{ color: "#b07a70" }}>{t.absentWork ?? "Work"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#f5a623" }} />
          <span className="text-xs" style={{ color: "#b07a70" }}>{t.absentSocial ?? "Social"}</span>
        </div>
      </div>
    </Card>
  );
}

// ── Monthly Score Trend Card ───────────────────────────────────────────────
export function MonthlyScoreTrendCard({ t, scores }) {
  if (!scores || !Object.keys(scores).length) return null;
  const entries = Object.entries(scores).sort(([a], [b]) => a.localeCompare(b));
  const monthNames = t.monthNames ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const data = entries.map(([key, value]) => ({
    label: monthNames[parseInt(key.slice(5, 7)) - 1],
    value,
  }));
  const max   = Math.max(...data.map((d) => d.value), 1);
  const latest = data[data.length - 1];
  const prev   = data[data.length - 2];
  const trend  = prev ? latest.value - prev.value : 0;

  return (
    <Card
      title={t.monthlyTrend ?? "Monthly trend"}
      accent={{ value: latest.value, color: latest.value <= 10 ? "#4CC189" : latest.value <= 20 ? "#FFC659" : latest.value <= 30 ? "#FF7473" : "#BE3830" }}
      subtitle={latest.label}
    >
      {prev && (
        <p className="text-xs mb-3" style={{ color: trend > 0 ? "#FF7473" : trend < 0 ? "#4CC189" : "#b07a70" }}>
          {trend > 0 ? `▲ +${trend}` : trend < 0 ? `▼ ${trend}` : "→ 0"} {t.fromLastMonth ?? "from last month"}
        </p>
      )}
      <BarChart
        data={data}
        colorFn={(d) =>
          d.value <= 10 ? "#4CC189"
          : d.value <= 20 ? "#FFC659"
          : d.value <= 30 ? "#FF7473"
          : "#BE3830"
        }
        height={80}
      />
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span key={i} style={{ color: "#b07a70", fontSize: 10 }}>{d.label}</span>
        ))}
      </div>
    </Card>
  );
}

// ── Mood vs Pain Card ──────────────────────────────────────────────────────
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

  // Avg mood per pain level
  const byPain = [1,2,3,4,5].map((p) => {
    const subset = records.filter((r) => r.intensity === p && r.emotion > 0);
    return {
      pain: p,
      avgMood: subset.length ? Math.round(subset.reduce((s, r) => s + r.emotion, 0) / subset.length * 10) / 10 : null,
      count: subset.length,
    };
  }).filter((d) => d.count > 0);

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
        {byPain.map(({ pain, avgMood, count }) => {
          const bg = pain <= 2 ? "#4CC189" : pain <= 3 ? "#FFC659" : pain <= 4 ? "#FF7473" : "#BE3830";
          return (
            <div key={pain} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: bg }} />
              <span className="text-xs w-16 shrink-0" style={{ color: "#7a5a54" }}>
                {t.painScore ?? "Pain"} {pain}
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(201,112,96,0.1)" }}>
                <div className="h-full rounded-full" style={{ width: `${((avgMood ?? 0) / 5) * 100}%`, background: "#c97060" }} />
              </div>
              <span className="text-xs font-bold w-6 text-right" style={{ color: "#8b4038" }}>{avgMood ?? "–"}</span>
              <span className="text-xs w-8" style={{ color: "#b07a70" }}>({count})</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Symptom Radar Card ─────────────────────────────────────────────────────
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

  const n      = avgs.length;
  const cx     = 100;
  const cy     = 100;
  const R      = 70;
  const levels = [1, 2, 3, 4, 5];

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
  const polygon    = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <Card title={t.symptomProfile ?? "Symptom profile"}>
      <svg viewBox="0 0 200 200" width="100%" style={{ display: "block", maxHeight: 200 }}>
        {/* Grid rings */}
        {levels.map((l) => (
          <polygon key={l} points={gridPoints(l)} fill="none"
            stroke="rgba(201,112,96,0.15)" strokeWidth="0.8" />
        ))}
        {/* Axis lines */}
        {avgs.map((_, i) => {
          const end = point(i, 5);
          return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
            stroke="rgba(201,112,96,0.12)" strokeWidth="0.8" />;
        })}
        {/* Data polygon */}
        <polygon points={polygon} fill="rgba(201,112,96,0.2)" stroke="#c97060" strokeWidth="1.5" />
        {/* Dots */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#c97060" />
        ))}
        {/* Labels */}
        {avgs.map((d, i) => {
          const p = point(i, 5.8);
          return (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fill="#7a5a54">
              {d.label.slice(0, 8)}
            </text>
          );
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

// ── Day of Week Card ───────────────────────────────────────────────────────
export function DayOfWeekCard({ t, records }) {
  const active = records.filter((r) => r.intensity > 1);
  if (!active.length) return null;

  const dayKeys = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const dayLabels = t.days ?? dayKeys;

  const byDow = dayKeys.map((_, i) => {
    const subset = active.filter((r) => {
      const d = new Date(r.date);
      return (d.getDay() + 6) % 7 === i;
    });
    return {
      label: dayLabels[i] ?? dayKeys[i],
      avg: subset.length ? Math.round(subset.reduce((s, r) => s + r.intensity, 0) / subset.length * 10) / 10 : null,
      count: subset.length,
    };
  });

  const max = Math.max(...byDow.map((d) => d.avg ?? 0), 1);

  return (
    <Card title={t.dayOfWeekPattern ?? "Day-of-week patterns"}>
      <div className="space-y-1.5">
        {byDow.map(({ label, avg, count }) => {
          const color = !avg ? "#e0c0b8"
            : avg <= 2 ? "#4CC189"
            : avg <= 3 ? "#FFC659"
            : avg <= 4 ? "#FF7473"
            : "#BE3830";
          return (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs w-8 shrink-0 font-medium" style={{ color: "#7a5a54" }}>{label}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(201,112,96,0.1)" }}>
                <div className="h-full rounded-full" style={{ width: avg ? `${(avg / max) * 100}%` : "0%", background: color }} />
              </div>
              <span className="text-xs font-bold w-6 text-right" style={{ color }}>{avg ?? "–"}</span>
              <span className="text-xs w-8" style={{ color: "#b07a70" }}>({count})</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Sleep Quality Card ─────────────────────────────────────────────────────
export function SleepQualityCard({ t, records }) {
  const data = records.filter((r) => r.sleepQuality > 1);
  if (!data.length) return null;

  const trendData = data.map((r) => ({ label: r.date.slice(8), value: r.sleepQuality }));
  const avg = Math.round(data.reduce((s, r) => s + r.sleepQuality, 0) / data.length * 10) / 10;

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

// ── Sexual Health Impact Card ──────────────────────────────────────────────
export function SexualHealthCard({ t, records }) {
  const total     = records.length;
  const prevented = records.filter((r) => r.sexualPrevented >= 2).length;
  const partial   = records.filter((r) => r.sexualPrevented === 2).length;
  const full      = records.filter((r) => r.sexualPrevented === 3).length;
  const pct       = total ? Math.round((prevented / total) * 100) : 0;

  if (!prevented) return null;

  // By pain level — how often is sex prevented at each pain level?
  const byPain = [2,3,4,5].map((p) => {
    const subset  = records.filter((r) => r.intensity === p);
    const prevSub = subset.filter((r) => r.sexualPrevented >= 2).length;
    return {
      pain: p,
      pct: subset.length ? Math.round((prevSub / subset.length) * 100) : 0,
      count: subset.length,
    };
  }).filter((d) => d.count > 0);

  const painColor = (p) => p <= 2 ? "#4CC189" : p <= 3 ? "#FFC659" : p <= 4 ? "#FF7473" : "#BE3830";

  return (
    <Card title={t.sexualHealthImpact ?? "Sexual health impact"}>
      <div className="flex gap-3 mb-4">
        {[
          { label: t.daysAffected  ?? "Days affected", value: prevented, color: "#e05a5a" },
          { label: t.percentOfDays ?? "% of days",     value: `${pct}%`, color: "#c97060" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 rounded-xl p-3 text-center"
            style={{ background: "rgba(201,112,96,0.04)", border: "1px solid rgba(201,112,96,0.1)" }}>
            <p className="text-xs mb-1" style={{ color: "#b07a70" }}>{label}</p>
            <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
          </div>
        ))}
        {[
          { label: t.partial ?? "Partial", value: partial, color: "#FFC659" },
          { label: t.full    ?? "Full",    value: full,    color: "#FF7473" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 rounded-xl p-3 text-center"
            style={{ background: "rgba(201,112,96,0.04)", border: "1px solid rgba(201,112,96,0.1)" }}>
            <p className="text-xs mb-1" style={{ color: "#b07a70" }}>{label}</p>
            <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      {byPain.length > 0 && (
        <>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#b07a70" }}>
            {t.preventedByPainLevel ?? "Prevented by pain level"}
          </p>
          <div className="space-y-1.5">
            {byPain.map(({ pain, pct, count }) => (
              <div key={pain} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: painColor(pain) }} />
                <span className="text-xs w-14 shrink-0" style={{ color: "#7a5a54" }}>
                  {t.painScore ?? "Pain"} {pain}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(201,112,96,0.1)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: painColor(pain) }} />
                </div>
                <span className="text-xs font-bold w-8 text-right" style={{ color: "#8b4038" }}>{pct}%</span>
                <span className="text-xs w-8" style={{ color: "#b07a70" }}>({count})</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}