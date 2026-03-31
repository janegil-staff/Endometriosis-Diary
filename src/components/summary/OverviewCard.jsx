"use client";
import { Card } from "./Card";

export function OverviewCard({ t, records }) {
  if (!records.length) return null;

  const scores = records.map((r) => r.intensity ?? 1);
  const painScores = scores.filter((s) => s > 1);
  const avgPain = painScores.length
    ? Math.round((painScores.reduce((a, b) => a + b, 0) / painScores.length) * 10) / 10
    : null;
  const minPain = scores.length ? Math.min(...scores) : null;
  const maxPain = scores.length ? Math.max(...scores) : null;
  const periodDays        = records.filter((r) => r.period >= 2).length;
  const sleepPoor         = records.filter((r) => (r.sleepQuality ?? 0) === 1 && (r.sleepHours ?? 0) > 0).length;
  const sleepFair         = records.filter((r) => (r.sleepQuality ?? 0) === 2).length;
  const sleepGood         = records.filter((r) => (r.sleepQuality ?? 0) === 3).length;
  const medDays           = records.filter((r) => r.acuteMedicines?.length > 0).length;
  const actDays           = records.filter((r) => r.physicalActivity > 0).length;
  const absentWorkPartial  = records.filter((r) => r.absentWork === 2).length;
  const absentWorkFull     = records.filter((r) => r.absentWork === 3).length;
  const absentSocialPartial = records.filter((r) => r.absentSocial === 2).length;
  const absentSocialFull    = records.filter((r) => r.absentSocial === 3).length;

  const painColor = (s) =>
    !s || s <= 1 ? "#4a8aa8"
    : s <= 2 ? "#4CC189"
    : s <= 3 ? "#FFC659"
    : s <= 4 ? "#FF7473"
    : "#BE3830";

  const stats = [
    { label: t.daysRecorded    ?? "Days recorded", value: records.length,  color: "#c97060" },
    { label: t.avgSymptoms     ?? "Avg pain",       value: avgPain ?? "–", color: painColor(avgPain) },
    { label: "Min",                                  value: minPain ?? "–", color: painColor(minPain) },
    { label: "Max",                                  value: maxPain ?? "–", color: painColor(maxPain) },
    { label: t.symptomPeriod   ?? "Period days",    value: periodDays,     color: "#e05a5a" },
    { label: t.medication      ?? "Medicine days",  value: medDays,        color: "#7b68ee" },
    { label: t.physicalActivity ?? "Active days",   value: actDays,        color: "#5cb85c" },
    ...(sleepGood + sleepFair + sleepPoor > 0 ? [{
      label: t.sleepQualityTitle ?? "Sleep quality",
      value:
        sleepGood >= sleepFair && sleepGood >= sleepPoor ? (t.good     ?? "Good")     :
        sleepFair >= sleepPoor                           ? (t.moderate ?? "Moderate") :
                                                           (t.poor     ?? "Poor"),
      color:
        sleepGood >= sleepFair && sleepGood >= sleepPoor ? "#4CC189" :
        sleepFair >= sleepPoor                           ? "#FFC659" : "#FF7473",
    }] : []),
    {
      label: (t.fieldAbsentWork ?? "Absent work") + ` (${t.partial ?? "part"})`,
      value: absentWorkPartial,
      color: absentWorkPartial > 0 ? "#FFC659" : "#4CC189",
    },
    {
      label: (t.fieldAbsentWork ?? "Absent work") + ` (${t.full ?? "full"})`,
      value: absentWorkFull,
      color: absentWorkFull > 0 ? "#FF7473" : "#4CC189",
    },
    {
      label: (t.fieldAbsentSocial ?? "Absent social") + ` (${t.partial ?? "part"})`,
      value: absentSocialPartial,
      color: absentSocialPartial > 0 ? "#FFC659" : "#4CC189",
    },
    {
      label: (t.fieldAbsentSocial ?? "Absent social") + ` (${t.full ?? "full"})`,
      value: absentSocialFull,
      color: absentSocialFull > 0 ? "#FF7473" : "#4CC189",
    },
  ];

  return (
    <Card title={t.patientSummary ?? "Monthly overview"}>
      <div className="grid grid-cols-2 gap-x-6">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className="flex items-center justify-between py-2"
            style={{ borderBottom: "1px solid rgba(201,112,96,0.06)" }}
          >
            <span className="text-xs" style={{ color: "#7a5a54" }}>{label}</span>
            <span className="text-sm font-bold" style={{ color }}>{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}