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

function EffectDots({ value, max = 3 }) {
  const color =
    value < 1 ? "#e0c0b8" :
    value < 2 ? "#FFC659" :
    value < 2.7 ? "#4CC189" : "#268E86";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: s <= Math.round(value) ? color : "rgba(201,112,96,0.12)" }}
        />
      ))}
      <span className="text-xs ml-1 font-bold" style={{ color }}>{value.toFixed(1)}</span>
    </div>
  );
}

export function MedicineEffectivenessCard({ t, records = [], medicines = [] }) {
  const withMed    = (records ?? []).filter((r) => r.acuteMedicines?.length > 0);
  const withoutMed = (records ?? []).filter((r) => !r.acuteMedicines?.length);
  if (!withMed.length) return null;

  const avg = (arr) =>
    arr.length
      ? Math.round((arr.reduce((s, r) => s + (r.intensity ?? 1), 0) / arr.length) * 10) / 10
      : null;

  const avgWith    = avg(withMed);
  const avgWithout = avg(withoutMed);

  const effectDist = [1, 2, 3].map((e) => ({
    label:
      e === 1 ? (t.noEffect  ?? "None") :
      e === 2 ? (t.mild      ?? "Some") :
                (t.serious   ?? "Good"),
    count: withMed.filter((r) => (r.effect ?? 0) === e).length,
    color:
      e === 0 ? "#e0c0b8" :
      e === 1 ? "#FFC659" :
      e === 2 ? "#4CC189" : "#268E86",
  }));
  const maxCount = Math.max(...effectDist.map((d) => d.count), 1);

  // Per-medicine average effect (only records where effect > 0 = reported)
  const allMedIds = [...new Set(withMed.flatMap((r) => r.acuteMedicines ?? []))];
  const perMed = allMedIds.map((id) => {
    const med  = medicines.find((m) => m.id === id || m._id === id);
    const name = med?.name ?? `Medicine ${id}`;
    const recs = withMed.filter((r) => r.acuteMedicines?.includes(id) && (r.effect ?? 0) > 0);
    const avgEffect = recs.length
      ? recs.reduce((s, r) => s + (r.effect ?? 0), 0) / recs.length
      : null;
    const usedCount  = withMed.filter((r) => r.acuteMedicines?.includes(id)).length;
    const totalDoses = withMed
      .filter((r) => r.acuteMedicines?.includes(id))
      .reduce((s, r) => {
        const idx = r.acuteMedicines.indexOf(id);
        return s + (r.acuteMedicinesUsedTimes?.[idx] ?? 1);
      }, 0);
    return { id, name, avgEffect, usedCount, reportedCount: recs.length, totalDoses };
  }).filter((m) => m.avgEffect !== null);

  return (
    <Card title={t.medicineSatisfaction ?? "Medicine effectiveness"}>
      {/* Avg pain with/without */}
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

      {/* Effect distribution */}
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#b07a70" }}>
        {t.effect ?? "Effect reported"}
      </p>
      <div className="space-y-1.5 mb-4">
        {effectDist.map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs w-16 flex-shrink-0" style={{ color: "#b07a70" }}>{label}</span>
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "rgba(201,112,96,0.08)" }}>
              <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, background: color }} />
            </div>
            <span className="text-xs w-4 text-right" style={{ color: "#b07a70" }}>{count}</span>
          </div>
        ))}
      </div>

      {/* Per-medicine avg satisfaction */}
      {perMed.length > 0 && (
        <>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#b07a70" }}>
            {t.medicineSatisfaction ?? "Avg. satisfaction per medicine"}
          </p>
          <div className="space-y-2">
            {perMed.map(({ id, name, avgEffect, usedCount, reportedCount, totalDoses }) => (
              <div key={id} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{ background: "rgba(123,104,238,0.05)", border: "1px solid rgba(123,104,238,0.12)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: "#5a3a54" }}>{name}</p>
                  <p className="text-xs" style={{ color: "#b07a70" }}>
                    {usedCount} {(t.daysRecorded ?? "days").toLowerCase()} · {totalDoses} {t.timesUsed ?? "× used"}
                  </p>
                </div>
                <EffectDots value={avgEffect} />
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}