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

function SummaryRow({ dot, label, value, valueColor, icon }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5"
      style={{ borderBottom: "1px solid rgba(201,112,96,0.06)" }}>
      {icon
        ? <img src={icon} alt="" className="w-5 h-5 flex-shrink-0" />
        : <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
      }
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
    score <= 2 ? (t.mild ?? "Mild") : score <= 3 ? (t.moderate ?? "Moderate") :
    score <= 4 ? (t.serious ?? "Strong") : (t.veryHigh ?? "Extreme");

  const SYMPTOMS = [
    { key: "intensity",         label: t.symptomPain     ?? "Pain"       },
    { key: "bowelMovementPain", label: t.symptomBowel    ?? "Bowel pain" },
    { key: "endoBelly",         label: t.symptomBloating ?? "Bloating"   },
    { key: "fatigue",           label: t.symptomFatigue  ?? "Fatigue"    },
    { key: "nausea",            label: t.symptomNausea   ?? "Nausea"     },
    { key: "headache",          label: t.symptomHeadache ?? "Headache"   },
    { key: "backPain",          label: t.symptomBackPain ?? "Back pain"  },
    { key: "legPain",           label: t.symptomLegPain  ?? "Leg pain"   },
    { key: "moodSwings",        label: t.symptomMood     ?? "Mood"       },
    { key: "anxiety",           label: t.symptomAnxiety  ?? "Anxiety"    },
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
    record.sleepQuality === 3 ? (t.good     ?? "Good") :
    record.sleepQuality === 2 ? (t.moderate ?? "Moderate") :
    record.sleepQuality === 1 ? (t.poor     ?? "Poor") : null;

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

      {(((record.physicalActivityHours ?? 0) * 60 + (record.physicalActivityMinutes ?? 0) + (record.physicalActivity ?? 0)) > 0 || (record.sleepHours ?? 0) > 0) && (
        <div style={{ borderBottom: "1px solid rgba(201,112,96,0.08)" }}>
          {((record.physicalActivityHours ?? 0) * 60 + (record.physicalActivityMinutes ?? 0) + (record.physicalActivity ?? 0)) > 0 && row(
            "#4ab5c4",
            t.physicalActivity ?? "Activity",
            (() => {
              const fromFields = (record.physicalActivityHours ?? 0) * 60 + (record.physicalActivityMinutes ?? 0);
              const totalMins = fromFields > 0 ? fromFields : (record.physicalActivity ?? 0);
              const h = Math.floor(totalMins / 60);
              const m = totalMins % 60;
              const hStr = t.hour ?? 'h'; const mStr = t.minutes ?? 'min'; return h > 0 ? (m > 0 ? `${h}${hStr} ${m}${mStr}` : `${h}${hStr}`) : `${m}${mStr}`;
            })(),
            "#4ab5c4"
          )}
          {(record.sleepHours ?? 0) > 0 && row("#4a9e8c", t.sleepHours ?? "Sleep hours", `${record.sleepHours}h`, "#4a9e8c")}
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

  const { counts, avgPain, daysInMonth, monthlyScore } = useMemo(() => {
    const daysInMonth  = new Date(vy, vm + 1, 0).getDate();
    const mrs          = records.filter((r) => r.date?.startsWith(monthKey));
    const avgPain      = mrs.length
      ? Math.round((mrs.reduce((s, r) => s + (selectedField ? (r[selectedField] ?? 0) : (combineScore(r) ?? 0)), 0) / mrs.length) * 10) / 10
      : null;
    const counts = {
      filled: mrs.length,
      ...((() => {
        const isAbsent = selectedField === "absentWork" || selectedField === "absentSocial";
        const isSleep  = selectedField === "sleepQuality";
        const score = (r) => {
          if (!selectedField) return combineScore(r);
          const v = r[selectedField] ?? 0;
          if (isAbsent) return v === 0 ? 0 : v === 1 ? 1 : v === 2 ? 3 : 4;
          if (isSleep) {
            if (v === 0) return 0;
            if (v === 3) return 2;
            if (v === 2) return 3;
            if (v === 1 && (r.sleepHours ?? 0) > 0) return 5;
            return 1;
          }
          return v;
        };
        const active = mrs.filter((r) => score(r) >= 2);
        return {
          minimal: isSleep
            ? (daysInMonth - mrs.filter((r) => (r.sleepQuality ?? 0) >= 2 || ((r.sleepQuality ?? 0) === 1 && (r.sleepHours ?? 0) > 0)).length)
            : daysInMonth - active.length,
          light:   isSleep ? mrs.filter((r) => (r.sleepQuality ?? 0) === 3).length : isAbsent ? 0 : mrs.filter((r) => score(r) === 2).length,
          medium:  isSleep ? mrs.filter((r) => (r.sleepQuality ?? 0) === 2).length : isAbsent ? mrs.filter((r) => (r[selectedField] ?? 0) === 2).length : mrs.filter((r) => score(r) === 3).length,
          heavy:   isAbsent || isSleep ? 0 : mrs.filter((r) => score(r) === 4).length,
          extreme: isSleep ? 0 : isAbsent ? mrs.filter((r) => (r[selectedField] ?? 0) === 3).length : mrs.filter((r) => score(r) === 5).length,
        };
      })()),
      medicineDays: mrs.filter((r) => r.acuteMedicines?.length > 0).length,
      totalActivityMins: mrs.reduce((s, r) => {
        const fromFields = (r.physicalActivityHours ?? 0) * 60 + (r.physicalActivityMinutes ?? 0);
        return s + (fromFields > 0 ? fromFields : (r.physicalActivity ?? 0));
      }, 0),
      activityDays: mrs.filter((r) => {
        const mins = (r.physicalActivityHours ?? 0) * 60 + (r.physicalActivityMinutes ?? 0) + (r.physicalActivity ?? 0);
        return mins > 0;
      }).length,
      activityAvgMins: (() => {
        const active = mrs.filter((r) => {
          const mins = (r.physicalActivityHours ?? 0) * 60 + (r.physicalActivityMinutes ?? 0) + (r.physicalActivity ?? 0);
          return mins > 0;
        });
        if (!active.length) return null;
        const totalMins = active.reduce((s, r) => {
          const fromFields = (r.physicalActivityHours ?? 0) * 60 + (r.physicalActivityMinutes ?? 0);
          return s + (fromFields > 0 ? fromFields : (r.physicalActivity ?? 0));
        }, 0);
        return Math.round(totalMins / active.length);
      })(),
      sleepPoor:  mrs.filter((r) => (r.sleepQuality ?? 0) === 1 && (r.sleepHours ?? 0) > 0).length,
      sexPartial: mrs.filter((r) => (r.sexualPrevented ?? 0) === 2).length,
      sexFull:    mrs.filter((r) => (r.sexualPrevented ?? 0) === 3).length,
    };
    const monthlyScore = mrs.reduce((s, r) => s + ((r.intensity ?? 1) - 1), 0);
    return { counts, avgPain, daysInMonth, monthlyScore };
  }, [records, vy, vm, monthKey, selectedField]);

  const fmtMins = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const hStr = t.hour ?? "h";
    const mStr = t.minutes ?? "min";
    return h > 0 ? (m > 0 ? `${h}${hStr} ${m}${mStr}` : `${h}${hStr}`) : `${m}${mStr}`;
  };

  const isAbsentField = selectedField === "absentWork" || selectedField === "absentSocial";
  const isSleepField  = selectedField === "sleepQuality";

  const summaryRows = [
    { dot: "#6B3A2A", icon: "/icons/brown_ring.svg", label: t.monthScore ?? "Month score", value: `${monthlyScore}` },
    // Minimal hidden for sleep and absent fields
    ...(!isSleepField && !isAbsentField ? [{ dot: "#4a8aa8", icon: "/icons/ico_intensity_no.png",       label: t.painNone ?? "None",     value: `${counts.minimal} days` }] : []),
    ...(isAbsentField ? [
      { dot: "#FFC659", icon: "/icons/ico_intensity_moderate.png", label: t.partial ?? "Partial", value: `${counts.medium} days`  },
      { dot: "#BE3830", icon: "/icons/ico_intensity_serious.png",  label: t.full    ?? "Full",    value: `${counts.extreme} days` },
    ] : isSleepField ? [
      { dot: "#4CC189", icon: "/icons/ico_intensity_mild.png",     label: t.good     ?? "Good",     value: `${counts.light} days`     },
      { dot: "#FFC659", icon: "/icons/ico_intensity_moderate.png", label: t.moderate ?? "Moderate", value: `${counts.medium} days`    },
      { dot: "#BE3830", icon: "/icons/ico_intensity_serious.png",  label: t.poor     ?? "Poor",     value: `${counts.sleepPoor} days` },
    ] : [
      { dot: "#4CC189", icon: "/icons/ico_intensity_mild.png",     label: t.mild      ?? "Mild",     value: `${counts.light} days`   },
      { dot: "#FFC659", icon: "/icons/ico_intensity_moderate.png", label: t.moderate  ?? "Moderate", value: `${counts.medium} days`  },
      { dot: "#FF7473", icon: "/icons/ico_intensity_serious.png",  label: t.serious   ?? "Strong",   value: `${counts.heavy} days`   },
      ...(selectedField === "sexualPain" ? [] : [{ dot: "#BE3830", icon: "/icons/ico_intensity_extreme.png", label: t.veryHigh ?? "Extreme", value: `${counts.extreme} days` }]),
    ]),
    { dot: "#7b68ee", icon: "/icons/ico_intensity_medicine.png", label: t.medication ?? "Medication", value: `${counts.medicineDays} days`, showKey: "medicine" },
    ...(counts.totalActivityMins > 0 ? [{ dot: "#4ab5c4", icon: "/icons/ico_exercise.png", label: t.totalActivity ?? "Total activity", value: fmtMins(counts.totalActivityMins), showKey: "activity" }] : []),
    ...(selectedField === "sexualPain" ? [
      { dot: "#b060c0", icon: "/icons/ico_prevented.png", label: t.sexPreventedFull ?? "Sex prev. (full)", value: `${counts.sexFull} days` },
    ] : []),
  ].filter(({ showKey }) => !showKey || show[showKey]);

  const showingDetail = !!selectedRecord;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
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

      <div className="flex-1 overflow-y-auto pt-3">
        {showingDetail ? (
          <DayDetailPanel t={t} record={selectedRecord} medicines={medicines} />
        ) : counts.filled === 0 ? (
          <div className="py-10 text-center">
            <p style={{ fontSize: 12, color: "#b07a70" }}>
              {t.noDataThisMonth ?? "No entries this month"}
            </p>
          </div>
        ) : (
          summaryRows.map(({ dot, icon, label, value, valueColor }) => (
            <SummaryRow key={label} dot={dot} icon={icon} label={label} value={value} valueColor={valueColor} />
          ))
        )}
      </div>
    </div>
  );
}