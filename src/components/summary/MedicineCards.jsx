"use client";
import { Card } from "@/components/summary/Card";

export function MedicineCard({ t, medList = [], recordsCount }) {
  if (!medList?.length) return null;
  return (
    <Card title={t.medicines ?? "Medicines"}>
      <div className="space-y-2 mt-1">
        {medList.map(([name, stats]) => (
          <div key={name} className="flex items-center gap-3 px-3 py-2 rounded-xl"
            style={{ background: "rgba(201,112,96,0.05)", border: "1px solid rgba(201,112,96,0.12)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "#5a3a34" }}>{name}</p>
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

export function MedicineEffectivenessCard({ t, records = [] }) {
  const withMed    = (records ?? []).filter((r) => r.acuteMedicines?.length > 0);
  const withoutMed = (records ?? []).filter((r) => !r.acuteMedicines?.length);
  if (!withMed.length) return null;

  const avg = (arr) =>
    arr.length
      ? Math.round((arr.reduce((s, r) => s + (r.intensity ?? 1), 0) / arr.length) * 10) / 10
      : null;

  const avgWith    = avg(withMed);
  const avgWithout = avg(withoutMed);

  const effectDist = [0, 1, 2, 3].map((e) => ({
    label:
      e === 0 ? (t.noEffect ?? "None") :
      e === 1 ? (t.mild     ?? "Low") :
      e === 2 ? (t.moderate ?? "Medium") :
                (t.serious  ?? "Good"),
    count: withMed.filter((r) => (r.effect ?? 0) === e).length,
    color:
      e === 0 ? "#e0c0b8" :
      e === 1 ? "#FFC659" :
      e === 2 ? "#4CC189" : "#268E86",
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
            <span className="text-xs w-16 flex-shrink-0" style={{ color: "#b07a70" }}>{label}</span>
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "rgba(201,112,96,0.08)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(count / maxCount) * 100}%`, background: color }}
              />
            </div>
            <span className="text-xs w-4 text-right" style={{ color: "#b07a70" }}>{count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}