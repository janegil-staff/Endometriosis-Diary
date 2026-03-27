"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { useTranslation } from "@/hooks/useTranslation";

const INTENSITY_COLORS = {
  0: "transparent",
  1: "#f5e8e4",
  2: "#e8b5a8",
  3: "#d98878",
  4: "#c97060",
  5: "#8b4038",
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  let d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday-first
}

function combineScore(rec) {
  if (!rec) return 0;
  const fields = [
    rec.intensity, rec.endoBelly, rec.bowelMovementPain,
    rec.urinationPain, rec.fatigue, rec.stress, rec.sexualPain,
  ];
  const vals = fields.filter(v => v > 1);
  if (!vals.length) return 1;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg);
}

function DayCell({ day, dateStr, rec, isToday, onClick }) {
  const score = combineScore(rec);
  const bg = INTENSITY_COLORS[score] || "transparent";
  const hasPeriod = rec && rec.period >= 2;
  const hasMedicine = rec && rec.acuteMedicines && rec.acuteMedicines.length > 0;
  const hasNote = rec && rec.note && rec.note.trim().length > 0;
  const hasActivity = rec && rec.physicalActivity > 0;
  const hasFlareUp = rec && (rec.intensity >= 4 || rec.bowelMovementPain >= 4 || rec.endoBelly >= 4);
  const textColor = score >= 4 ? "#fff" : "#5a3a34";

  return (
    <div
      onClick={() => onClick(dateStr)}
      className="relative flex flex-col items-center rounded-2xl cursor-pointer transition-all hover:scale-105 hover:shadow-md select-none"
      style={{
        background: score > 0 ? bg : "rgba(255,255,255,0.35)",
        border: isToday ? "2px solid #8b4038" : "1.5px solid rgba(201,112,96,0.2)",
        minHeight: 72,
        padding: "6px 4px 4px",
      }}
    >
      <span
        className="text-sm font-bold mb-1"
        style={{ color: textColor }}
      >
        {day}
      </span>

      {/* Indicators row */}
      <div className="flex gap-0.5 flex-wrap justify-center">
        {hasPeriod && (
          <span title="Period" style={{ fontSize: 10 }}>🩸</span>
        )}
        {hasFlareUp && (
          <span title="Flare-up" style={{ fontSize: 10 }}>⚡</span>
        )}
        {hasMedicine && (
          <span title="Medicine" style={{ fontSize: 10 }}>💊</span>
        )}
        {hasActivity && (
          <span title="Activity" style={{ fontSize: 10 }}>🏃</span>
        )}
        {hasNote && (
          <span title="Note" style={{ fontSize: 10 }}>📝</span>
        )}
      </div>
    </div>
  );
}

export default function CalendarView({ records = [], scores = {} }) {
  const router = useRouter();
  const { lang } = useLang();
  const { t } = useTranslation(lang);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const recordMap = {};
  records.forEach((r) => { recordMap[r.date] = r; });

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const todayStr = today.toISOString().slice(0, 10);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const monthNames = t.monthNames || ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = t.days || ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const monthLabel = `${monthNames[month]} ${year}`;
  const monthScore = scores[`${monthKey}-01`];

  const handleDayClick = (dateStr) => {
    router.push(`/log?date=${dateStr}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(201,112,96,0.15)", color: "#8b4038" }}
        >
          ‹
        </button>
        <div className="text-center">
          <h2 className="text-xl font-extrabold" style={{ color: "#5a3a34" }}>
            {monthLabel}
          </h2>
          {monthScore !== undefined && (
            <span
              className="text-xs font-bold px-3 py-0.5 rounded-full"
              style={{ background: "#c97060", color: "#fff" }}
            >
              {t.scoreHeader || "Score"} {monthScore}
            </span>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(201,112,96,0.15)", color: "#8b4038" }}
        >
          ›
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {dayNames.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-bold pb-1"
            style={{ color: "#c97060" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${monthKey}-${String(day).padStart(2, "0")}`;
          const rec = recordMap[dateStr];
          return (
            <DayCell
              key={dateStr}
              day={day}
              dateStr={dateStr}
              rec={rec}
              isToday={dateStr === todayStr}
              onClick={handleDayClick}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.5)" }}>
        <p className="text-xs font-bold mb-3" style={{ color: "#8b4038" }}>
          {t.scoreHeader || "Legend"}
        </p>
        <div className="flex gap-3 flex-wrap mb-3">
          {Object.entries(INTENSITY_COLORS).filter(([k]) => k > 0).map(([level, color]) => (
            <div key={level} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md" style={{ background: color, border: "1px solid rgba(201,112,96,0.3)" }} />
              <span className="text-xs" style={{ color: "#7a3a2e" }}>
                {["", t.low || "Low", "", t.moderate || "Moderate", "", t.high || "High"][level] || `${level}`}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 flex-wrap">
          {[
            { icon: "🩸", label: t.symptomPeriod || "Period" },
            { icon: "⚡", label: t.exacerbation || "Flare-up" },
            { icon: "💊", label: t.medication || "Medicine" },
            { icon: "🏃", label: t.physicalActivity || "Activity" },
            { icon: "📝", label: t.note || "Note" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1">
              <span style={{ fontSize: 13 }}>{icon}</span>
              <span className="text-xs" style={{ color: "#7a3a2e" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}