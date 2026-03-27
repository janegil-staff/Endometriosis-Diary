"use client";
import { useState, useMemo } from "react";
import { combineScore } from "@/components/dashboard/endoUtils";

function scoreBg(score) {
  if (!score || score <= 1) return "#d6eef8";
  if (score <= 2) return "#4CC189";
  if (score <= 3) return "#FFC659";
  if (score <= 4) return "#FF7473";
  return "#BE3830";
}

function scoreText(score) {
  if (!score || score <= 1) return "#4a8aa8";
  if (score <= 2) return "#fff";
  if (score <= 3) return "#7a5200";
  return "#fff";
}

export default function CalendarPanel({
  t,
  records,
  medicines,
  onDayClick,
  selectedDate,
  show,
  onToggleShow,
}) {
  const recordMap = useMemo(() => {
    const map = {};
    (records || []).forEach((r) => {
      map[r.date] = r;
    });
    return map;
  }, [records]);

  const now = new Date();
  const [viewYear, setViewYear] = useState(() => {
    if (records?.length)
      return parseInt(records[records.length - 1].date.slice(0, 4));
    return now.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (records?.length)
      return parseInt(records[records.length - 1].date.slice(5, 7)) - 1;
    return now.getMonth();
  });

  const pad = (n) => String(n).padStart(2, "0");
  const monthNames = t.monthNames ?? [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const dayNames = t.days ?? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const monthKey = `${viewYear}-${pad(viewMonth + 1)}`;
  const todayStr = now.toISOString().slice(0, 10);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = (() => {
    const d = new Date(viewYear, viewMonth, 1).getDay();
    return d === 0 ? 6 : d - 1;
  })();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const monthRecords = useMemo(
    () => (records || []).filter((r) => r.date.startsWith(monthKey)),
    [records, monthKey],
  );

  const avgPain = monthRecords.length
    ? Math.round(
        monthRecords.reduce((s, r) => s + combineScore(r), 0) /
          monthRecords.length,
      )
    : null;

  const counts = {
    flareUps: monthRecords.filter(
      (r) => r.intensity >= 4 || r.bowelMovementPain >= 4 || r.endoBelly >= 4,
    ).length,
    periodDays: monthRecords.filter((r) => r.period >= 2).length,
    medicineDays: monthRecords.filter((r) => r.acuteMedicines?.length > 0).length,
    activityDays: monthRecords.filter((r) => r.physicalActivity > 0).length,
    filled: monthRecords.length,
  };

  const checkboxes = [
    { key: "period",   label: t.showPeriod   ?? "Show period",    color: "#e05a5a" },
    { key: "flareUp",  label: t.showFlareUp  ?? "Show flare-up",  color: "#f5a623" },
    { key: "medicine", label: t.showMedicine ?? "Show medicine",   color: "#7b68ee" },
    { key: "note",     label: t.showNote     ?? "Show notes",      color: "#5bc0de" },
    { key: "activity", label: t.showActivity ?? "Show activity",   color: "#5cb85c" },
  ];

  // Monthly summary rows — real computed values, filtered by show toggles
  const summaryRows = [
    {
      showKey: null, // always visible
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c97060" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
          <path d="M12 8v4l3 3"/>
        </svg>
      ),
      label: t.daysRecorded ?? "Days recorded",
      value: counts.filled,
      unit: `/ ${daysInMonth}`,
    },
    {
      showKey: null, // always visible
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9b7ac9" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ),
      label: t.avgPain ?? t.avgSymptoms ?? "Avg. pain score",
      value: avgPain !== null ? avgPain : "–",
      unit: avgPain !== null ? "/ 5" : "",
      valueColor: avgPain === null ? "#b07a70"
        : avgPain <= 1 ? "#4a8aa8"
        : avgPain <= 2 ? "#2a9e68"
        : avgPain <= 3 ? "#c99500"
        : avgPain <= 4 ? "#cc5050"
        : "#8a2020",
    },
    {
      showKey: "period",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e05a5a" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      label: t.period ?? "Period days",
      value: counts.periodDays,
      unit: t.days2 ?? "days",
    },
    {
      showKey: "flareUp",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      label: t.flareUps ?? "Flare-up days",
      value: counts.flareUps,
      unit: t.days2 ?? "days",
    },
    {
      showKey: "medicine",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b68ee" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      ),
      label: t.medicineDays ?? t.medicines ?? "Medicine days",
      value: counts.medicineDays,
      unit: t.days2 ?? "days",
    },
    {
      showKey: "activity",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5cb85c" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
      label: t.physicalActivity ?? "Active days",
      value: counts.activityDays,
      unit: t.days2 ?? "days",
    },
  ].filter(({ showKey }) => showKey === null || show[showKey]);

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
          {monthNames[viewMonth]} {viewYear}
        </h2>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
          style={{ color: "#c97060", fontSize: 18 }}
        >
          ›
        </button>
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
          const day = i + 1;
          const dateStr = `${monthKey}-${pad(day)}`;
          const rec = recordMap[dateStr];
          const score = combineScore(rec);
          const bg = rec ? scoreBg(score) : "rgba(201,112,96,0.03)";
          const tc = scoreText(score);
          const isToday = dateStr === todayStr;
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
              <span className="text-xs font-bold leading-none mb-1" style={{ color: rec ? tc : "#d0b0a8" }}>
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
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

      {/* Monthly summary — real computed stats */}
      <div
        className="mt-5 rounded-xl overflow-hidden"
        style={{
          background: "#fff",
          border: "1px solid rgba(201,112,96,0.14)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div className="px-4 pt-3 pb-2" style={{ borderBottom: "1px solid rgba(201,112,96,0.08)" }}>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#c97060" }}>
            {t.monthlySummary ?? "Monthly summary"}
          </p>
        </div>

        {/* No data state */}
        {counts.filled === 0 ? (
          <div className="px-4 py-5 text-center">
            <p className="text-sm" style={{ color: "#b07a70" }}>
              {t.noEntries ?? "No entries this month."}
            </p>
          </div>
        ) : (
          summaryRows.map(({ icon, label, value, unit, valueColor }, idx) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4"
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                borderBottom: idx < summaryRows.length - 1
                  ? "1px solid rgba(201,112,96,0.06)"
                  : "none",
              }}
            >
              {/* Icon */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(201,112,96,0.07)" }}
              >
                {icon}
              </div>

              {/* Label */}
              <span className="flex-1 text-sm" style={{ color: "#7a5a54" }}>
                {label}
              </span>

              {/* Value */}
              <div className="flex items-baseline gap-1">
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: valueColor ?? "#5a3a34" }}
                >
                  {value}
                </span>
                {unit && (
                  <span className="text-xs" style={{ color: "#b07a70" }}>
                    {unit}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}