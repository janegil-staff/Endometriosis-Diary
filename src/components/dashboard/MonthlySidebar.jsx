"use client";
import { useMemo } from "react";
import { combineScore } from "@/components/dashboard/endoUtils";

function pad(n) { return String(n).padStart(2, "0"); }

function painColor(v) {
  if (v === null || v === undefined) return "#b07a70";
  if (v <= 1) return "#4CC189";
  if (v <= 2) return "#81c784";
  if (v <= 3) return "#FFC659";
  if (v <= 4) return "#FF7473";
  return "#BE3830";
}

function ScoreBar({ value }) {
  const pct   = Math.round(((value - 1) / 4) * 100);
  const color = value <= 2 ? "#4CC189" : value <= 3 ? "#FFC659" : value <= 4 ? "#FF7473" : "#BE3830";
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: "rgba(201,112,96,0.1)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, width: 12, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function SummaryRow({ dot, label, value, valueColor }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5"
      style={{ borderBottom: "1px solid rgba(201,112,96,0.06)" }}>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
      <span style={{ fontSize: 11, color: "#7a5a54", flex: 1 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: valueColor ?? "#8b4038" }}>{value}</span>
    </div>
  );
}

function DayDetailPanel({ t, record, medicines = [] }) {
  if (!record) return null;

  const date      = new Date(record.date + "T00:00:00");
  const dateLabel = date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const score     = combineScore(record);
  const scoreColor =
    !score || score <= 1 ? "#b07a70" :
    score <= 2 ? "#4CC189" : score <= 3 ? "#FFC659" : score <= 4 ? "#FF7473" : "#BE3830";
  const scoreLabel =
    !score || score <= 1 ? (t.noSymptoms ?? "No symptoms") :
    score <= 2 ? (t.mild ?? "Light") : score <= 3 ? (t.moderate ?? "Medium") :
    score <= 4 ? (t.serious ?? "Heavy") : (t.veryHigh ?? "Extreme");

  const SYMPTOMS = [
    { key: "intensity",         label: t.symptomPain     ?? "Pain"        },
    { key: "bowelMovementPain", label: t.symptomBowel    ?? "Bowel pain"  },
    { key: "endoBelly",         label: t.symptomBloating ?? "Bloating"    },
    { key: "fatigue",           label: t.symptomFatigue  ?? "Fatigue"     },
    { key: "nausea",            label: t.symptomNausea   ?? "Nausea"      },
    { key: "headache",          label: t.symptomHeadache ?? "Headache"    },
    { key: "backPain",          label: t.symptomBackPain ?? "Back pain"   },
    { key: "legPain",           label: t.symptomLegPain  ?? "Leg pain"    },
    { key: "moodSwings",        label: t.symptomMood     ?? "Mood"        },
    { key: "anxiety",           label: t.symptomAnxiety  ?? "Anxiety"     },
  ].filter(({ key }) => (record[key] ?? 0) >= 2);

  const periodLabel =
    record.period === 2 ? (t.spotting ?? "Spotting") :
    record.period === 3 ? (t.light    ?? "Light flow") :
    record.period === 4 ? (t.medium   ?? "Medium flow") :
    record.period === 5 ? (t.heavy    ?? "Heavy flow") : null;

  const usedMeds = (record.acuteMedicines ?? [])
    .map((id) => medicines.find((m) => m._id === id || m.id === id))
    .filter(Boolean);

  const absentLabel = (v) =>
    v === 2 ? (t.partial ?? "Partial") : v === 3 ? (t.full ?? "Full") : null;

  const sleepQLabel =
    record.sleepQuality === 1 ? (t.poor ?? "Poor") :
    record.sleepQuality === 2 ? (t.fair ?? "Fair") :
    record.sleepQuality === 3 ? (t.good ?? "Good") : null;

  const row = (dot, label, value, color) => (
    <div key={label} className="flex items-center gap-2 px-4 py-2"
      style={{ borderBottom: "1px solid rgba(201,112,96,0.06)" }}>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
      <span style={{ fontSize: 11, color: "#7a5a54", flex: 1 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}</span>
    </div>
  );

  return (
    <div>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(201,112,96,0.1)" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#b07a70", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {dateLabel}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full" style={{ background: scoreColor }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor }}>{scoreLabel}</span>
        </div>
      </div>

      {SYMPTOMS.length > 0 && (
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(201,112,96,0.08)" }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: "#c97060", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            {t.symptoms ?? "Symptoms"}
          </p>
          <div className="flex flex-col gap-2">
            {SYMPTOMS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <span style={{ fontSize: 11, color: "#7a5a54", width: 80, flexShrink: 0 }}>{label}</span>
                <ScoreBar value={record[key]} />
              </div>
            ))}
          </div>
        </div>
      )}

      {periodLabel && row("#e05a5a", t.symptomPeriod ?? "Period", periodLabel, "#e05a5a")}
      {record.sexPrevented === true && row("#d97fd9", t.sexPrevented ?? "Sex prevented", "✓", "#d97fd9")}
      {absentLabel(record.absentWork)   && row("#e8973a", t.absentWork   ?? "Absent work",   absentLabel(record.absentWork),   "#e8973a")}
      {absentLabel(record.absentSocial) && row("#e8973a", t.absentSocial ?? "Absent social", absentLabel(record.absentSocial), "#e8973a")}

      {usedMeds.length > 0 && (
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(201,112,96,0.08)" }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: "#7b68ee", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            {t.usedMedicines ?? "Medicines"}
          </p>
          {usedMeds.map((med, i) => (
            <div key={i} className="flex items-center justify-between mb-1">
              <span style={{ fontSize: 11, color: "#5a3a54" }}>{med.name}</span>
              <span style={{ fontSize: 11, color: "#7b68ee" }}>
                {[med.dose ? `${med.dose}mg` : "", med.times ? `×${med.times}` : ""].filter(Boolean).join(" ")}
              </span>
            </div>
          ))}
          {record.effect > 0 && (
            <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid rgba(123,104,238,0.12)" }}>
              <span style={{ fontSize: 11, color: "#7a5a54", flex: 1 }}>{t.medicineSatisfaction ?? "Effect"}</span>
              <div className="flex gap-1">
                {[1,2,3].map((s) => (
                  <div key={s} className="w-2 h-2 rounded-full"
                    style={{ background: s <= record.effect ? "#7b68ee" : "rgba(123,104,238,0.15)" }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {((record.physicalActivity ?? 0) > 0 || (record.sleepHours ?? 0) > 0) && (
        <div style={{ borderBottom: "1px solid rgba(201,112,96,0.08)" }}>
          {(record.physicalActivity ?? 0) > 0 && row("#4ab5c4", t.physicalActivity ?? "Activity", record.physicalActivity, "#4ab5c4")}
          {(record.sleepHours ?? 0) > 0       && row("#4a9e8c", t.sleepHours       ?? "Sleep hours", `${record.sleepHours}h`, "#4a9e8c")}
          {sleepQLabel && row(
            record.sleepQuality === 1 ? "#FF7473" : record.sleepQuality === 2 ? "#FFC659" : "#4CC189",
            t.sleepQualityTitle ?? "Sleep quality", sleepQLabel,
            record.sleepQuality === 1 ? "#FF7473" : record.sleepQuality === 2 ? "#FFC659" : "#4CC189",
          )}
        </div>
      )}

      {record.note?.trim?.() && (
        <div className="px-4 py-3">
          <p style={{ fontSize: 9, fontWeight: 800, color: "#3a8aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
            {t.note ?? "Note"}
          </p>
          <p style={{ fontSize: 12, color: "#5a3a34", lineHeight: 1.55 }}>{record.note}</p>
        </div>
      )}
    </div>
  );
}

export default function MonthlySidebar({
  t = {},
  records = [],
  viewYear,
  viewMonth,
  show = {},
  onToggleShow,
  selectedRecord,
  medicines = [],
  onClearSelection,
  selectedField = "",
}) {
  const now      = new Date();
  const vy       = viewYear  ?? now.getFullYear();
  const vm       = viewMonth ?? now.getMonth();
  const monthKey = `${vy}-${pad(vm + 1)}`;

  const monthNames = t.monthNames ?? [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const { counts, avgPain, daysInMonth } = useMemo(() => {
    const daysInMonth  = new Date(vy, vm + 1, 0).getDate();
    const mrs          = records.filter((r) => r.date?.startsWith(monthKey));
    const avgPain      = mrs.length
      ? Math.round((mrs.reduce((s, r) => s + (combineScore(r) ?? 0), 0) / mrs.length) * 10) / 10
      : null;
    const counts = {
      filled:       mrs.length,
      light:        mrs.filter((r) => combineScore(r) === 2).length,
      medium:       mrs.filter((r) => combineScore(r) === 3).length,
      heavy:        mrs.filter((r) => combineScore(r) === 4).length,
      extreme:      mrs.filter((r) => combineScore(r) === 5).length,
      medicineDays: mrs.filter((r) => r.acuteMedicines?.length > 0).length,
      activityDays:  mrs.filter((r) => (r.physicalActivity ?? 0) > 0).length,
      sexPartial:    mrs.filter((r) => (r.sexualPrevented ?? 0) === 2).length,
      sexFull:       mrs.filter((r) => (r.sexualPrevented ?? 0) === 3).length,
    };
    return { counts, avgPain, daysInMonth };
  }, [records, vy, vm, monthKey]);

  // Only: days recorded, avg pain, light/medium/heavy/extreme, medication, activity
  const summaryRows = [
    { dot: "#c97060",          label: t.daysRecorded     ?? "Days recorded", value: `${counts.filled} / ${daysInMonth}` },
    { dot: painColor(avgPain), label: t.avgPain          ?? "Avg. pain",     value: avgPain !== null ? `${avgPain} / 5` : "–", valueColor: painColor(avgPain) },
    { dot: "#4CC189",          label: t.mild             ?? "Light",         value: `${counts.light}d`        },
    { dot: "#FFC659",          label: t.moderate         ?? "Medium",        value: `${counts.medium}d`       },
    { dot: "#FF7473",          label: t.serious          ?? "Heavy",         value: `${counts.heavy}d`        },
    { dot: "#BE3830",          label: t.veryHigh         ?? "Extreme",       value: `${counts.extreme}d`      },
    { dot: "#7b68ee",          label: t.medication       ?? "Medication",    value: `${counts.medicineDays}d`, showKey: "medicine" },
    { dot: "#4ab5c4",          label: t.physicalActivity ?? "Activity",      value: `${counts.activityDays}d`, showKey: "activity"     },
    ...(selectedField === "sexualPain" ? [
      { dot: "#d97fd9", label: t.sexPreventedPartial ?? "Sex prev. (partial)", value: `${counts.sexPartial}d` },
      { dot: "#b060c0", label: t.sexPreventedFull    ?? "Sex prev. (full)",    value: `${counts.sexFull}d` },
    ] : []),
  ].filter(({ showKey }) => !showKey || show[showKey]);

  const showingDetail = !!selectedRecord;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(201,112,96,0.12)", background: "rgba(201,112,96,0.03)" }}
      >
        <p style={{ fontSize: 10, fontWeight: 800, color: "#c97060", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {showingDetail ? (t.dayDetail ?? "Day detail") : `${monthNames[vm]} ${vy}`}
        </p>
        {showingDetail && (
          <button
            onClick={onClearSelection}
            className="flex items-center gap-1 rounded-lg px-2 py-1 transition-all hover:opacity-70"
            style={{ fontSize: 10, color: "#b07a70", background: "rgba(201,112,96,0.08)" }}
          >
            ← {t.summary ?? "Summary"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showingDetail ? (
          <DayDetailPanel t={t} record={selectedRecord} medicines={medicines} />
        ) : counts.filled === 0 ? (
          <div className="py-10 text-center">
            <p style={{ fontSize: 12, color: "#b07a70" }}>
              {t.noDataThisMonth ?? "No entries this month"}
            </p>
          </div>
        ) : (
          summaryRows.map(({ dot, label, value, valueColor }) => (
            <SummaryRow key={label} dot={dot} label={label} value={value} valueColor={valueColor} />
          ))
        )}
      </div>
    </div>
  );
}