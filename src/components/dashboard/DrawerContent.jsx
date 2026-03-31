"use client";
import {
  combineScore,
  scoreColor,
  resolveMedicines,
} from "@/components/dashboard/endoUtils";

const SYMPTOM_FIELDS = [
  { key: "intensity",         labelKey: "symptomPain",       fallback: "Pelvic pain"    },
  { key: "period",            labelKey: "symptomPeriod",     fallback: "Menstrual flow" },
  { key: "endoBelly",         labelKey: "symptomEndoBelly",  fallback: "Endo belly"     },
  { key: "bowelMovementPain", labelKey: "symptomBowel",      fallback: "Bowel pain"     },
  { key: "urinationPain",     labelKey: "symptomUrination",  fallback: "Urination pain" },
  { key: "fatigue",           labelKey: "symptomFatigue",    fallback: "Fatigue"        },
  { key: "stress",            labelKey: "symptomStress",     fallback: "Stress"         },
  { key: "emotion",           labelKey: "symptomEmotion",    fallback: "Mood"           },
  { key: "sexualPain",        labelKey: "symptomSexualPain", fallback: "Sexual pain"    },
];

function ScoreBar({ value }) {
  const pct = ((value - 1) / 4) * 100;
  const color =
    value <= 1 ? "#e0c0b8"
    : value <= 2 ? "#4CC189"
    : value <= 3 ? "#FFC659"
    : value <= 4 ? "#FF7473"
    : "#BE3830";

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(201,112,96,0.12)" }}>
        <div className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color, transition: "width 0.3s" }} />
      </div>
      <span className="text-xs font-bold w-4 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

export default function DrawerContent({ t, record, onClose, medicines, show }) {
  if (!record) return null;

  const score    = combineScore(record);
  const colors   = scoreColor(score);
  const usedMeds = resolveMedicines(record, medicines);

  const showPeriod       = show?.period       ?? true;
  const showMedicine     = show?.medicine     ?? true;
  const showNote         = show?.note         ?? true;
  const showActivity     = show?.activity     ?? true;
  const showSexPrevented = show?.sexPrevented ?? true;

  const hasActivity  = record.physicalActivity > 0;
  const hasSleep     = record.sleepHours > 0;
  const hasNote      = record.note?.trim().length > 0;
  const hasAbsence   = record.absentWork >= 2 || record.absentSocial >= 2;
  const sexPrevented = showSexPrevented && record.sexualPrevented >= 2;

  const visibleSymptoms = SYMPTOM_FIELDS.filter(({ key }) => {
    if (key === "period" && !showPeriod) return false;
    return true;
  });

  const formatActivity = (mins) => {
    if (!mins || mins <= 0) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const hLabel = h === 1 ? (t.hourSingular ?? "hour") : (t.hours ?? "hours");
    const mLabel = t.minutes ?? "minutes";
    if (h > 0 && m > 0) return `${h} ${hLabel} ${m} ${mLabel}`;
    if (h > 0)           return `${h} ${hLabel}`;
    return `${m} ${mLabel}`;
  };

  return (
    <div className="px-5 pb-6 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#b07a70" }}>
            {record.date}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="px-3 py-0.5 rounded-full text-xs font-bold"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
              {t.painScore ?? "Pain score"}: {score}
            </div>
          </div>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all hover:bg-black/5"
          style={{ color: "#b07a70" }}>
          ×
        </button>
      </div>

      {/* Symptom bars */}
      <div className="space-y-2 mb-4">
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#c97060" }}>
          {t.symptomLog ?? "Symptoms"}
        </p>
        {visibleSymptoms.map(({ key, labelKey, fallback }) => {
          const val = record[key];
          if (!val || val < 2) return null;
          if (key === "sleepQuality") {
            const sqLabel = val === 1 ? (t.poor ?? "Poor") : val === 2 ? (t.fair ?? "Fair") : (t.good ?? "Good");
            const sqColor = val === 1 ? "#FF7473" : val === 2 ? "#FFC659" : "#4CC189";
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs w-32 flex-shrink-0" style={{ color: "#7a5a54" }}>
                  {t[labelKey] ?? fallback}
                </span>
                <span className="text-xs font-bold" style={{ color: sqColor }}>{sqLabel}</span>
              </div>
            );
          }
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs w-32 flex-shrink-0" style={{ color: "#7a5a54" }}>
                {t[labelKey] ?? fallback}
              </span>
              <ScoreBar value={val} />
            </div>
          );
        })}
      </div>

      {/* Absence */}
      {hasAbsence && (
        <div className="rounded-xl p-3 mb-3"
          style={{ background: "rgba(201,112,96,0.06)", border: "1px solid rgba(201,112,96,0.12)" }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#c97060" }}>
            {t.absence ?? "Absence"}
          </p>
          <div className="space-y-1">
            {record.absentWork >= 2 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#e05a5a" }} />
                <span className="text-xs" style={{ color: "#7a5a54" }}>
                  {t.fieldAbsentWork ?? "Absent from work"}
                  {record.absentWork === 3 ? ` (${t.full ?? "full"})` : ` (${t.partial ?? "partial"})`}
                </span>
              </div>
            )}
            {record.absentSocial >= 2 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#f5a623" }} />
                <span className="text-xs" style={{ color: "#7a5a54" }}>
                  {t.fieldAbsentSocial ?? "Absent from social life"}
                  {record.absentSocial === 3 ? ` (${t.full ?? "full"})` : ` (${t.partial ?? "partial"})`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sex prevented */}
      {sexPrevented && (
        <div className="rounded-xl p-3 mb-3"
          style={{ background: "rgba(224,90,90,0.06)", border: "1px solid rgba(224,90,90,0.15)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#c084a0" }} />
            <span className="text-xs font-semibold" style={{ color: "#7a5a54" }}>
              {t.fieldSexualPrevented ?? "Sex prevented"}
              {record.sexualPrevented === 3
                ? ` (${t.full ?? "full"})`
                : ` (${t.partial ?? "partial"})`}
            </span>
          </div>
        </div>
      )}

      {/* Activity & sleep */}
      {(showActivity && hasActivity || hasSleep) && (
        <div className="rounded-xl p-3 mb-3"
          style={{ background: "rgba(92,184,92,0.06)", border: "1px solid rgba(92,184,92,0.15)" }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#3a8a3a" }}>
            {t.physicalActivity ?? "Activity & sleep"}
          </p>
          <div className="space-y-1">
            {showActivity && hasActivity && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "#7a5a54" }}>{t.physicalActivity ?? "Activity"}</span>
                <span className="text-xs font-bold" style={{ color: "#3a8a3a" }}>
                  {formatActivity(record.physicalActivity)}
                </span>
              </div>
            )}
            {hasSleep && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "#7a5a54" }}>{t.sleepHours ?? "Sleep hours"}</span>
                <span className="text-xs font-bold" style={{ color: "#3a8a3a" }}>
                  {record.sleepHours === 1
                    ? `1 ${t.hourSingular ?? "hour"}`
                    : `${record.sleepHours} ${t.hours ?? "hours"}`}
                </span>
              </div>
            )}
            {record.sleepHours > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "#7a5a54" }}>{t.sleepQualityTitle ?? "Sleep quality"}</span>
                <span className="text-xs font-bold" style={{
                  color: record.sleepQuality === 1 ? "#FF7473" : record.sleepQuality === 2 ? "#FFC659" : "#4CC189"
                }}>
                  {record.sleepQuality === 3 ? (t.good ?? "Good") : record.sleepQuality === 2 ? (t.moderate ?? "Moderate") : (t.poor ?? "Poor")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medicines */}
      {showMedicine && usedMeds.length > 0 && (
        <div className="rounded-xl p-3 mb-3"
          style={{ background: "rgba(123,104,238,0.06)", border: "1px solid rgba(123,104,238,0.15)" }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#7b68ee" }}>
            {t.usedMedicines ?? "Medicines used"}
          </p>
          <div className="space-y-1.5">
            {usedMeds.map((med, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "#5a3a54" }}>{med.name}</span>
                <span className="text-xs" style={{ color: "#7b68ee" }}>
                  {med.dose ? `${med.dose}mg` : ""}
                  {med.times ? ` × ${med.times}` : ""}
                </span>
              </div>
            ))}
            {record.effect > 0 && (
              <div className="flex items-center justify-between mt-1 pt-1"
                style={{ borderTop: "1px solid rgba(123,104,238,0.1)" }}>
                <span className="text-xs" style={{ color: "#7a5a54" }}>
                  {t.medicineSatisfaction ?? "Effect"}
                </span>
                <div className="flex gap-0.5">
                  {[1,2,3].map((s) => (
                    <div key={s} className="w-3 h-3 rounded-full"
                      style={{ background: s <= record.effect ? "#7b68ee" : "rgba(123,104,238,0.15)" }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Note */}
      {showNote && hasNote && (
        <div className="rounded-xl p-3"
          style={{ background: "rgba(91,192,222,0.06)", border: "1px solid rgba(91,192,222,0.18)" }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "#3a8aaa" }}>
            {t.note ?? "Note"}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#5a3a34" }}>{record.note}</p>
        </div>
      )}
    </div>
  );
}