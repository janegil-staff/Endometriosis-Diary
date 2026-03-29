"use client";
import { useMemo } from "react";

// ── Colour scale ─────────────────────────────────────────────────────────
function scoreBg(score) {
  if (!score || score <= 1) return "#d6eef8";
  if (score <= 2) return "#4CC189";
  if (score <= 3) return "#FFC659";
  if (score <= 4) return "#FF7473";
  return "#BE3830";
}

function scoreText(score) {
  if (!score || score <= 1) return "#4a8aa8";
  if (score <= 3) return "#1a1a1a";
  return "#fff";
}

// ── Normalise field values to 1–5 scale ───────────────────────────────────
function normaliseScore(rec, field) {
  if (!rec) return 0;
  const v = rec[field] ?? 1;
  // absent fields: 1=none→1, 2=partial→3, 3=full→5
  if (field === "absentWork" || field === "absentSocial") {
    return v === 1 ? 1 : v === 2 ? 3 : 5;
  }
  // sleepQuality: inverted — only colour if sleep was actually logged (sleepHours > 0)
  // 1=poor→5(red), 2=fair→3(yellow), 3=good→1(blue). No sleep logged → 1(blue/none)
  if (field === "sleepQuality") {
    if (!rec.sleepHours || rec.sleepHours === 0) return 1;
    return v === 1 ? 5 : v === 2 ? 3 : 1;
  }
  // all other fields are 1–5 directly
  return v;
}

// ── Field definitions ─────────────────────────────────────────────────────
const FIELDS = [
  { key: "intensity",         tKey: "fieldIntensity",    fallback: "Total pain"                    },
  { key: "bowelMovementPain", tKey: "fieldBowel",        fallback: "Pain during bowel movements"   },
  { key: "urinationPain",     tKey: "fieldUrination",    fallback: "Pain during urination"         },
  { key: "endoBelly",         tKey: "fieldEndoBelly",    fallback: "Endo belly"                    },
  { key: "fatigue",           tKey: "fieldFatigue",      fallback: "Fatigue"                       },
  { key: "stress",            tKey: "fieldStress",       fallback: "Stress level"                  },
  { key: "sexualPain",        tKey: "fieldSexualPain",   fallback: "Pain during sex"               },
  { key: "absentWork",        tKey: "fieldAbsentWork",   fallback: "Absent from work/school"       },
  { key: "absentSocial",      tKey: "fieldAbsentSocial", fallback: "Absent from social activities" },
  { key: "sleepQuality",      tKey: "fieldSleepQuality", fallback: "Sleep quality"                 },
];

export default function CalendarPanel({
  t,
  records,
  medicines,
  onDayClick,
  selectedDate,
  show,
  onToggleShow,
  viewYear,
  viewMonth,
  onViewChange,
  selectedField,
  onFieldChange,
}) {
  const now = new Date();
  const vy  = viewYear  ?? now.getFullYear();
  const vm  = viewMonth ?? now.getMonth();

  const pad        = (n) => String(n).padStart(2, "0");
  const monthKey   = `${vy}-${pad(vm + 1)}`;
  const todayStr   = now.toISOString().slice(0, 10);
  const monthNames = t.monthNames ?? ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames   = t.days ?? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const firstDay    = (() => { const d = new Date(vy, vm, 1).getDay(); return d === 0 ? 6 : d - 1; })();

  const prevMonth = () => {
    if (vm === 0) onViewChange(vy - 1, 11);
    else          onViewChange(vy, vm - 1);
  };
  const nextMonth = () => {
    if (vm === 11) onViewChange(vy + 1, 0);
    else           onViewChange(vy, vm + 1);
  };

  const recordMap = useMemo(() => {
    const map = {};
    (records || []).forEach((r) => { map[r.date] = r; });
    return map;
  }, [records]);

  const monthRecords = useMemo(
    () => (records || []).filter((r) => r.date.startsWith(monthKey)),
    [records, monthKey],
  );

  // Monthly summary based on selectedField — wrapped in useMemo so it recomputes on field change
  const fieldScores = useMemo(
    () => monthRecords.map((r) => normaliseScore(r, selectedField)),
    [monthRecords, selectedField],
  );
  const counts = {
    filled:       monthRecords.length,
    periodDays:   monthRecords.filter((r) => r.period >= 2).length,
    light:        fieldScores.filter((s) => s === 2).length,
    medium:       fieldScores.filter((s) => s === 3).length,
    heavy:        fieldScores.filter((s) => s === 4).length,
    extreme:      fieldScores.filter((s) => s === 5).length,
    medicineDays: monthRecords.filter((r) => r.acuteMedicines?.length > 0).length,
  };

  const checkboxes = [
    { key: "period",   label: t.showPeriod   ?? "Show period",   color: "#e05a5a" },
    { key: "flareUp",  label: t.showFlareUp  ?? "Show flare-up", color: "#f5a623" },
    { key: "medicine", label: t.showMedicine ?? "Show medicine",  color: "#7b68ee" },
    { key: "note",     label: t.showNote     ?? "Show notes",     color: "#5bc0de" },
    { key: "activity", label: t.showActivity ?? "Show activity",  color: "#5cb85c" },
  ];

  const d = (n) => `${n} ${n === 1 ? "day" : "days"}`;
  const isAbsentField = selectedField === "absentWork" || selectedField === "absentSocial";
  const isSleepField  = selectedField === "sleepQuality";

  const absentPartial  = isAbsentField ? monthRecords.filter((r) => r[selectedField] === 2).length : 0;
  const sexPrevented   = monthRecords.filter((r) => r.sexualPrevented === 3).length;

  const absentFull    = isAbsentField ? monthRecords.filter((r) => r[selectedField] === 3).length : 0;
  // Only count sleep entries where sleepHours > 0 (actually logged)
  const sleepRecords  = isSleepField ? monthRecords.filter((r) => r.sleepHours > 0) : [];
  const sleepPoor     = sleepRecords.filter((r) => r.sleepQuality === 1).length;
  const sleepFair     = sleepRecords.filter((r) => r.sleepQuality === 2).length;
  const sleepGood     = sleepRecords.filter((r) => r.sleepQuality === 3).length;

  const allSummaryRows = isAbsentField ? [
    { color: "#c97060", label: t.monthlySummary ?? "Month sum",  value: d(counts.filled),       always: true },
    { color: "#FFC659", label: t.partial        ?? "Partial",    value: d(absentPartial),        always: true },
    { color: "#BE3830", label: t.full           ?? "Full day",   value: d(absentFull),           always: true },
    { color: "#7b68ee", label: t.medication     ?? "Medication", value: d(counts.medicineDays),  showKey: "medicine" },
  ] : isSleepField ? [
    { color: "#c97060", label: t.monthlySummary ?? "Month sum",  value: d(counts.filled),       always: true },
    { color: "#FF7473", label: t.poor           ?? "Poor",       value: d(sleepPoor),            always: true },
    { color: "#FFC659", label: t.fair           ?? "Fair",       value: d(sleepFair),            always: true },
    { color: "#4CC189", label: t.good           ?? "Good",       value: d(sleepGood),            always: true },
    { color: "#7b68ee", label: t.medication     ?? "Medication", value: d(counts.medicineDays),  showKey: "medicine" },
  ] : [
    { color: "#c97060", label: t.monthlySummary ?? "Month sum",  value: d(counts.filled),        always: true        },
    { color: "#e05a5a", label: t.symptomPeriod  ?? "Period",     value: d(counts.periodDays),    showKey: "period"   },
    { color: "#4CC189", label: t.mild           ?? "Light",      value: d(counts.light),         always: true        },
    { color: "#FFC659", label: t.moderate       ?? "Medium",     value: d(counts.medium),        always: true        },
    { color: "#FF7473", label: t.serious        ?? "Heavy",      value: d(counts.heavy),         always: true        },
    { color: "#BE3830", label: t.veryHigh       ?? "Extreme",    value: d(counts.extreme),       always: true        },
    { color: "#7b68ee", label: t.medication     ?? "Medication", value: d(counts.medicineDays),  showKey: "medicine" },
    ...(selectedField === "sexualPain" ? [
      { color: "#e05a5a", label: t.fieldSexualPrevented ?? "Sex prevented", value: d(sexPrevented), always: true },
    ] : []),
  ];
  const summaryRows = allSummaryRows.filter(({ always, showKey }) => always || show[showKey]);

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
          style={{ color: "#c97060", fontSize: 18 }}
        >
          ‹
        </button>
        <h2
          className="text-lg font-bold tracking-wide"
          style={{ color: "#5a3a34", fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {monthNames[vm]} {vy}
        </h2>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
          style={{ color: "#c97060", fontSize: 18 }}
        >
          ›
        </button>
      </div>

      {/* Field dropdown */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold shrink-0" style={{ color: "#b07a70" }}>
            {t.dropdownLabel ?? "Showing"}:
          </span>
          <div className="relative flex-1">
            <select
              value={selectedField}
              onChange={(e) => onFieldChange(e.target.value)}
              className="w-full appearance-none text-xs font-semibold rounded-xl px-3 py-2 pr-8 cursor-pointer outline-none transition-all"
              style={{
                background: "rgba(201,112,96,0.07)",
                border: "1px solid rgba(201,112,96,0.2)",
                color: "#c97060",
              }}
            >
              {FIELDS.map(({ key, tKey, fallback }) => (
                <option key={key} value={key}>
                  {t[tKey] ?? fallback}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="#c97060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center" style={{ fontSize: 10, fontWeight: 700, color: "#c97060" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day        = i + 1;
          const dateStr    = `${monthKey}-${pad(day)}`;
          const rec        = recordMap[dateStr];
          const score      = normaliseScore(rec, selectedField);
          const bg         = rec ? scoreBg(score) : "rgba(201,112,96,0.03)";
          const tc         = scoreText(score);
          const isToday    = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          const hasPeriod   = show.period   && rec && rec.period >= 2;
          const hasFlareUp  = show.flareUp  && rec && (rec.intensity >= 4 || rec.bowelMovementPain >= 4 || rec.endoBelly >= 4);
          const hasMedicine = show.medicine && rec?.acuteMedicines?.length > 0;
          const hasActivity = show.activity && rec?.physicalActivity > 0;
          const hasNote     = show.note     && rec?.note?.trim().length > 0;

          return (
            <div
              key={dateStr}
              onClick={() => rec && onDayClick(rec)}
              className="rounded-xl flex flex-col items-center transition-all select-none"
              style={{
                background: bg,
                border: isSelected
                  ? "2px solid #8b4038"
                  : isToday
                  ? "2px solid #c97060"
                  : "1.5px solid rgba(201,112,96,0.15)",
                cursor: rec ? "pointer" : "default",
                minHeight: 52,
                padding: "4px 2px 3px",
                boxShadow: rec ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
              }}
            >
              <span
                className="text-xs font-bold leading-none mb-1"
                style={{ color: rec ? tc : "#d0b0a8" }}
              >
                {day}
              </span>
              <div className="flex gap-0.5 flex-wrap justify-center px-0.5">
                {hasPeriod   && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#e05a5a" }} />}
                {hasFlareUp  && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f5a623" }} />}
                {hasMedicine && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#7b68ee" }} />}
                {hasActivity && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#5cb85c" }} />}
                {hasNote     && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#5bc0de" }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visibility checkboxes */}
      <div
        className="mt-4 rounded-xl px-4 py-3"
        style={{ background: "rgba(201,112,96,0.03)", border: "1px solid rgba(201,112,96,0.1)" }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#b07a70" }}>
          {t.showIn ?? "Show in calendar"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
          {checkboxes.map(({ key, label, color }) => (
            <div
              key={key}
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => onToggleShow(key)}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: show[key] ? color : "transparent",
                  border: `1.5px solid ${show[key] ? color : "#e0c0b8"}`,
                  boxShadow: show[key] ? `0 0 0 2px ${color}22` : "none",
                }}
              >
                {show[key] && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium" style={{ color: show[key] ? "#5a3a34" : "#b07a70" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly summary */}
      <div
        className="mt-5 rounded-xl overflow-hidden"
        style={{
          background: "#fff",
          border: "1px solid rgba(201,112,96,0.14)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <div className="px-4 pt-3 pb-2" style={{ borderBottom: "1px solid rgba(201,112,96,0.08)" }}>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#c97060" }}>
            {t.monthlySummary ?? "Monthly summary"}
          </p>
        </div>
        {summaryRows.map(({ color, label, value }) => (
          <div
            key={label}
            className="flex items-center px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(201,112,96,0.06)" }}
          >
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="flex-1 text-sm ml-3" style={{ color: "#7a5a54" }}>{label}</span>
            <span className="text-sm font-bold" style={{ color: "#8b4038" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}