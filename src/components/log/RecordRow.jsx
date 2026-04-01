"use client";
import { combineScore, SCORE_COLOR } from "@/lib/log/logHelpers";
import { FIELDS } from "@/components/dashboard/CalendarPanel";

const SYMPTOM_FIELDS = [
  { key: "intensity",         labelKey: "symptomPain",       fallback: "Pelvic pain" },
  { key: "period",            labelKey: "symptomPeriod",     fallback: "Menstrual flow" },
  { key: "endoBelly",         labelKey: "symptomEndoBelly",  fallback: "Endo belly" },
  { key: "bowelMovementPain", labelKey: "symptomBowel",      fallback: "Bowel pain" },
  { key: "urinationPain",     labelKey: "symptomUrination",  fallback: "Urination pain" },
  { key: "fatigue",           labelKey: "symptomFatigue",    fallback: "Fatigue" },
  { key: "stress",            labelKey: "symptomStress",     fallback: "Stress" },
  { key: "emotion",           labelKey: "symptomEmotion",    fallback: "Mood" },
  { key: "sexualPain",        labelKey: "symptomSexualPain", fallback: "Sexual pain" },
];

const BAR_COLOR = (v) =>
  v <= 1 ? "#d6eef8"
  : v <= 2 ? "#4CC189"
  : v <= 3 ? "#FFC659"
  : v <= 4 ? "#FF7473"
  : "#BE3830";

function getFieldScore(rec, fieldKey) {
  if (!rec) return 0;
  const val = rec[fieldKey] ?? 0;
  if (typeof val === "boolean") return val ? 3 : 0;
  if (fieldKey === "absentWork" || fieldKey === "absentSocial") {
    if (val === 0) return 0;
    if (val === 1) return 1;
    if (val === 2) return 3;
    return 4;
  }
  if (fieldKey === "sleepQuality") {
    if (val === 0) return 0;
    if (val === 3) return 2;
    if (val === 2) return 3;
    if (val === 1 && (rec.sleepHours ?? 0) > 0) return 4;
    if (val === 1) return 1;
    return 0;
  }
  return val;
}

function ScoreBar({ value, max = 5 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(201,112,96,0.12)", minWidth: 48 }}>
        <div className="h-full rounded-full" style={{ width: `${((value - 1) / (max - 1)) * 100}%`, background: BAR_COLOR(value) }} />
      </div>
      <span className="text-xs font-semibold w-3 text-right tabular-nums" style={{ color: BAR_COLOR(value) }}>{value}</span>
    </div>
  );
}

function EffectLabel({ value, t }) {
  if (!value || value <= 0) return null;
  const label = value === 1 ? (t.effectNone ?? "No effect") : value === 2 ? (t.effectMild ?? "Mild effect") : (t.effectStrong ?? "Strong effect");
  const color = value === 3 ? "#4CC189" : value === 2 ? "#FFC659" : "#FF7473";
  return (
    <span className="text-xs font-semibold" style={{ color }}>{label}</span>
  );
}

function formatActivity(mins, t) {
  if (!mins || mins <= 0) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hLabel = h === 1 ? (t.hourSingular ?? "hour") : (t.hours ?? "hours");
  const mLabel = t.minutes ?? "minutes";
  if (h > 0 && m > 0) return `${h} ${hLabel} ${m} ${mLabel}`;
  if (h > 0)           return `${h} ${hLabel}`;
  return `${m} ${mLabel}`;
}

function formatSleep(hours, t) {
  if (!hours || hours <= 0) return "";
  return hours === 1 ? `1 ${t.hourSingular ?? "hour"}` : `${hours} ${t.hours ?? "hours"}`;
}

export function RecordRow({ record, medicines, t, expanded, onToggle, isFirst, selectedField = "intensity" }) {
  // ── Badge ─────────────────────────────────────────────────────────────────
  const fieldDef    = FIELDS.find((f) => f.key === selectedField) ?? FIELDS[0];
  const fieldScore  = getFieldScore(record, selectedField);
  const fieldLabel  = t[fieldDef.tKey] ?? fieldDef.fallback;
  const badgeScore  = fieldScore > 0 ? fieldScore : combineScore(record);
  const badgeColors = SCORE_COLOR(badgeScore);

  const SEVERITY_LABELS = [
    t.severityNone     ?? "None",
    t.severityMild     ?? "Mild",
    t.severityModerate ?? "Moderate",
    t.severityStrong   ?? "Strong",
    t.severityExtreme  ?? "Extreme",
  ];

  const isAbsenceField = selectedField === "absentWork" || selectedField === "absentSocial";
  const rawAbsenceVal  = record[selectedField] ?? 0;

  let badgeLabel;
  if (isAbsenceField) {
    badgeLabel = rawAbsenceVal === 3
      ? (t.fullDay    ?? "Full day")
      : rawAbsenceVal === 2
      ? (t.partialDay ?? "Partial")
      : null; // val 0 or 1 = not absent, hide badge
  } else {
    badgeLabel = SEVERITY_LABELS[(badgeScore ?? 1) - 1] ?? SEVERITY_LABELS[0];
  }

  // ── Medicines ─────────────────────────────────────────────────────────────
  const usedMeds = (record.acuteMedicines ?? []).map((id, i) => {
    const med = medicines?.find((m) => m.id === id);
    return {
      id,
      name:  med?.name ?? `${t.medication ?? "Medicine"} ${id}`,
      dose:  record.acuteMedicinesDoses?.[i] ?? null,
      times: record.acuteMedicinesUsedTimes?.[i] ?? null,
    };
  });

  const hasActivity = record.physicalActivity > 0;
  const hasSleep    = record.sleepHours > 0;
  const noteText    = record.note?.trim();

  const rd  = new Date(record.date.slice(0, 4), record.date.slice(5, 7) - 1, record.date.slice(8, 10));
  const dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][rd.getDay()];
  const fmt = `${String(rd.getDate()).padStart(2, "0")}.${String(rd.getMonth() + 1).padStart(2, "0")}`;

  const actLabel   = formatActivity(record.physicalActivity, t);
  const sleepLabel = formatSleep(record.sleepHours, t);

  return (
    <div
      className="overflow-hidden transition-all"
      style={{
        background: expanded ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        borderTop: isFirst ? "none" : "1px solid rgba(201,112,96,0.12)",
        boxShadow: expanded ? "0 2px 12px rgba(201,112,96,0.08)" : "none",
      }}
    >
      {/* Compact row */}
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 text-left transition-all hover:bg-black/[0.015]">

        {/* Left: date + subtitles */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-3">
          <div className="flex items-center gap-2">
            <span className="font-bold tabular-nums shrink-0" style={{ color: "#b07a70", fontSize: 10, minWidth: 28 }}>{dow}</span>
            <span className="text-sm font-semibold shrink-0" style={{ color: "#7a5a54" }}>{fmt}</span>
            {record.period >= 2 && (
              <span className="text-xs font-semibold" style={{ color: "#e05a5a" }}>
                {t.symptomPeriod ?? "Period"}
              </span>
            )}
          </div>
          {usedMeds.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap" style={{ paddingLeft: 36 }}>
              <span className="text-xs" style={{ color: "#7b68ee" }}>
                {usedMeds.map((m) => m.name).join(", ")}
              </span>
              {record.effect > 0 && <EffectLabel value={record.effect} t={t} />}
            </div>
          )}
          {noteText && (
            <p
              className="text-xs"
              style={{
                color: "#7a9aaa",
                paddingLeft: 36,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              {noteText}
            </p>
          )}
        </div>

        {/* Right: activity + score badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActivity && (
            <span className="text-xs hidden sm:inline" style={{ color: "#b07a70" }}>🏃 {actLabel}</span>
          )}
          {badgeScore >= 1 && badgeLabel && (
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{
                background: badgeColors.bg,
                color: badgeColors.text,
                border: `1px solid ${badgeColors.border}`,
              }}
            >
              {badgeLabel}
            </span>
          )}
          <span
            className="transition-transform text-xs"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", color: "#b07a70", display: "inline-block" }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4" style={{ borderTop: "1px solid rgba(201,112,96,0.1)", paddingTop: 14 }}>

          {/* Symptom bars — selected field floated to top */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2.5" style={{ color: "#b07a70" }}>
              {t.symptomLog ?? "Symptoms"}
            </p>
            <div className="space-y-2">
              {[
                ...(selectedField !== "intensity"
                  ? SYMPTOM_FIELDS.filter((f) => f.key === selectedField)
                  : []),
                ...SYMPTOM_FIELDS.filter((f) =>
                  selectedField !== "intensity" ? f.key !== selectedField : true
                ),
              ].map(({ key, labelKey, fallback }) => {
                const val = record[key];
                if (!val || val < 2) return null;
                if (key === "sleepQuality" && !record.sleepHours) return null;

                const isHighlighted = key === selectedField && selectedField !== "intensity";

                if (key === "sleepQuality") {
                  const sqLabel = val === 1 ? (t.poor ?? "Poor") : val === 2 ? (t.fair ?? "Fair") : (t.good ?? "Good");
                  const sqColor = val === 1 ? "#FF7473" : val === 2 ? "#FFC659" : "#4CC189";
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2"
                      style={isHighlighted ? { background: "rgba(201,112,96,0.06)", borderRadius: 8, padding: "4px 6px", margin: "0 -6px" } : {}}
                    >
                      <span className="text-xs shrink-0" style={{ color: isHighlighted ? "#c97060" : "#7a5a54", width: 130, fontWeight: isHighlighted ? 600 : 400 }}>
                        {t[labelKey] ?? fallback}
                      </span>
                      <span className="text-xs font-bold" style={{ color: sqColor }}>{sqLabel}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={key}
                    className="flex items-center gap-2"
                    style={isHighlighted ? { background: "rgba(201,112,96,0.06)", borderRadius: 8, padding: "4px 6px", margin: "0 -6px" } : {}}
                  >
                    <span className="text-xs shrink-0" style={{ color: isHighlighted ? "#c97060" : "#7a5a54", width: 130, fontWeight: isHighlighted ? 600 : 400 }}>
                      {t[labelKey] ?? fallback}
                    </span>
                    <ScoreBar value={val} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity & sleep */}
          {(hasActivity || hasSleep) && (
            <div className="flex gap-2">
              {hasActivity && (
                <div className="flex-1 px-3 py-2 rounded-xl text-center" style={{ background: "rgba(92,184,92,0.06)", border: "1px solid rgba(92,184,92,0.2)" }}>
                  <p className="text-xs" style={{ color: "#3a8a3a" }}>{t.physicalActivity ?? "Activity"}</p>
                  <p className="text-sm font-bold" style={{ color: "#3a8a3a" }}>{actLabel}</p>
                </div>
              )}
              {hasSleep && (
                <div className="flex-1 px-3 py-2 rounded-xl text-center" style={{ background: "rgba(123,104,238,0.06)", border: "1px solid rgba(123,104,238,0.15)" }}>
                  <p className="text-xs" style={{ color: "#7b68ee" }}>{t.sleepHours ?? "Sleep hours"}</p>
                  <p className="text-sm font-bold" style={{ color: "#7b68ee" }}>{sleepLabel}</p>
                  {record.sleepHours > 0 && (() => {
                    const sqLabel = record.sleepQuality === 1 ? (t.poor ?? "Poor") : record.sleepQuality === 2 ? (t.fair ?? "Fair") : (t.good ?? "Good");
                    const sqColor = record.sleepQuality === 1 ? "#FF7473" : record.sleepQuality === 2 ? "#FFC659" : "#4CC189";
                    return <p className="text-xs font-semibold mt-1" style={{ color: sqColor }}>{sqLabel}</p>;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Absence */}
          {(record.absentWork >= 1 || record.absentSocial >= 1) && (
            <div className="space-y-1.5">
              {record.absentWork >= 1 && (() => {
                const val = record.absentWork;
                const label = val === 3 ? (t.fullDay ?? "Full day") : val === 2 ? (t.partialDay ?? "Partial") : (t.noAbsence ?? "None");
                const color = val === 3 ? "#c05400" : val === 2 ? "#d97706" : "#7a5a54";
                const bg    = val === 3 ? "#fff4ed" : val === 2 ? "#fffbeb" : "rgba(201,112,96,0.04)";
                const border = val === 3 ? "#fdc99a" : val === 2 ? "#fde68a" : "rgba(201,112,96,0.12)";
                return (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
                    <span className="text-xs font-semibold" style={{ color: "#7a5a54" }}>
                      {t.fieldAbsentWork ?? "Absent from work"}
                    </span>
                    <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                  </div>
                );
              })()}
              {record.absentSocial >= 1 && (() => {
                const val = record.absentSocial;
                const label = val === 3 ? (t.fullDay ?? "Full day") : val === 2 ? (t.partialDay ?? "Partial") : (t.noAbsence ?? "None");
                const color = val === 3 ? "#c05400" : val === 2 ? "#d97706" : "#7a5a54";
                const bg    = val === 3 ? "#fff4ed" : val === 2 ? "#fffbeb" : "rgba(201,112,96,0.04)";
                const border = val === 3 ? "#fdc99a" : val === 2 ? "#fde68a" : "rgba(201,112,96,0.12)";
                return (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
                    <span className="text-xs font-semibold" style={{ color: "#7a5a54" }}>
                      {t.fieldAbsentSocial ?? "Absent from social life"}
                    </span>
                    <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Medicines */}
          {usedMeds.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#b07a70" }}>
                {t.usedMedicines ?? "Medicines used"}
              </p>
              <div className="space-y-1.5">
                {usedMeds.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(123,104,238,0.06)", border: "1px solid rgba(123,104,238,0.18)" }}>
                    <span className="text-xs font-semibold flex-1" style={{ color: "#5a3a54" }}>{m.name}</span>
                    <div className="flex items-center gap-1.5">
                      {m.dose  && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(123,104,238,0.1)", color: "#7b68ee" }}>{m.dose}mg</span>}
                      {m.times && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(123,104,238,0.1)", color: "#7b68ee" }}>{m.times}{t.timesUsed ?? "×"}</span>}
                    </div>
                  </div>
                ))}
                {record.effect > 0 && (
                  <div
                    className="flex items-center justify-between px-3 pt-2"
                    style={{ borderTop: "1px solid rgba(123,104,238,0.1)" }}
                  >
                    <span className="text-xs" style={{ color: "#7a5a54" }}>
                      {t.medicineSatisfaction ?? "Effect"}
                    </span>
                    <EffectLabel value={record.effect} t={t} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Note */}
          {noteText && (
            <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(91,192,222,0.08)", border: "1px solid rgba(91,192,222,0.25)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#3a8aaa" }}>{t.note ?? "Note"}</p>
              <p className="text-sm" style={{ color: "#5a3a34" }}>{noteText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}