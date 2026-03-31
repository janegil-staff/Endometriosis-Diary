"use client";
import { useMemo, useState, useEffect, useRef } from "react";

// ── colour scale ──────────────────────────────────────────────────────────────

function scoreBg(score) {
  if (!score || score < 1) return "#fff";
  if (score <= 1) return "#d6eef8";
  if (score <= 2) return "#4CC189";
  if (score <= 3) return "#FFC659";
  if (score <= 4) return "#FF7473";
  return "#BE3830";
}
function scoreText(score) {
  if (!score || score < 1) return "#000";
  if (score <= 1) return "#4a8aa8";
  if (score <= 2) return "#1a4a32";
  if (score <= 3) return "#4a3800";
  return "#fff";
}
function pad(n) { return String(n).padStart(2, "0"); }

// ── field definitions ─────────────────────────────────────────────────────────

const FIELDS = [
  { key: "intensity",         tKey: "fieldIntensity",    fallback: "Total pain"       },
  { key: "bowelMovementPain", tKey: "fieldBowel",        fallback: "Bowel pain"       },
  { key: "urinationPain",     tKey: "fieldUrination",    fallback: "Urination pain"   },
  { key: "endoBelly",         tKey: "fieldEndoBelly",    fallback: "Endo belly"       },
  { key: "fatigue",           tKey: "fieldFatigue",      fallback: "Fatigue"          },
  { key: "stress",            tKey: "fieldStress",       fallback: "Stress"           },
  { key: "sexualPain",        tKey: "fieldSexualPain",   fallback: "Pain during sex"  },
  { key: "absentWork",        tKey: "fieldAbsentWork",   fallback: "Absent from work" },
  { key: "absentSocial",      tKey: "fieldAbsentSocial", fallback: "Absent socially"  },
  { key: "sleepQuality",      tKey: "fieldSleepQuality", fallback: "Sleep quality"    },
];

function getScore(rec, fieldKey) {
  if (!rec) return 0;
  const val = rec[fieldKey] ?? 0;
  return typeof val === "boolean" ? (val ? 3 : 0) : val;
}

// ── DayCell ───────────────────────────────────────────────────────────────────

function DayCell({
  day, rec, isToday, isSelected, onClick, fieldKey,
  showMedicine, showNote, showActivity, showPeriod, showSexPrevented,
}) {
  const score     = getScore(rec, fieldKey);
  const hasPeriod   = showPeriod   && (rec?.period ?? 0) >= 2;
  const hasMedicine = showMedicine && rec?.acuteMedicines?.length > 0;
  const hasNote     = showNote     && rec?.note?.trim?.().length > 0;
  const hasActivity      = showActivity     && (rec?.physicalActivity ?? 0) > 0;
  const hasSexPrevented  = showSexPrevented && (rec?.sexualPrevented ?? 0) === 3;

  const bg = isSelected ? "#8b4038" : rec ? scoreBg(score) : "#fff";
  const tc = isSelected ? "#fff"    : rec ? scoreText(score) : "#000";

  return (
    <div
      onClick={() => rec && onClick(rec)}
      className="flex items-center justify-center transition-all select-none"
      style={{
        position: "relative",
        width: 24, height: 24,
        cursor: rec ? "pointer" : "default",
      }}
    >
      {/* Pink square behind for period days */}
      {hasPeriod && (
        <div style={{
          position: "absolute",
          inset: -4,
          background: "#ffb6c1",
          borderRadius: 9,
          zIndex: 0,
        }} />
      )}

      {/* Day cell */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: 24, height: 24,
        borderRadius: 7,
        background: bg,
        border: isSelected
          ? "1.5px solid #8b4038"
          : isToday
          ? "1.5px solid #c97060"
          : rec
          ? "1.5px solid transparent"
          : "1.5px solid #000",
        boxShadow: isSelected ? "0 2px 8px rgba(139,64,56,0.28)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: tc, lineHeight: 1 }}>
          {day}
        </span>
      </div>

      {/* Medicine — white circle, red border, thick cross — top right */}
      {hasMedicine && (
        <div style={{
          position: "absolute", top: -5, right: -3,
          width: 13, height: 13,
          background: "#fff",
          borderRadius: "50%",
          border: "1px solid #e05a5a",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10,
        }}>
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
            <rect x="3.5" y="1" width="3" height="8" rx="0.5" fill="#e05a5a" />
            <rect x="1" y="3.5" width="8" height="3" rx="0.5" fill="#e05a5a" />
          </svg>
        </div>
      )}

      {/* Note — white circle, blue border, chat bubble — bottom right */}
      {hasNote && (
        <div style={{
          position: "absolute", bottom: -5, right: -3,
          width: 13, height: 13,
          background: "#fff",
          borderRadius: "50%",
          border: "1px solid #4a9eca",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10,
        }}>
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
            <rect x="1" y="1" width="8" height="6" rx="1.5" fill="#4a9eca" />
            <polygon points="5.5,7 8,7 8,9.5" fill="#4a9eca" />
          </svg>
        </div>
      )}

      {/* Activity — exercise icon image — bottom left */}
      {hasActivity && (
        <div style={{
          position: "absolute", bottom: -5, left: -3,
          width: 13, height: 13,
          borderRadius: "50%",
          overflow: "hidden",
          zIndex: 10,
        }}>
          <img
            src="/icons/ico_exercise.png"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Sex prevented (full) — lightning bolt icon — top left */}
      {hasSexPrevented && (
        <div style={{
          position: "absolute", top: -5, left: -3,
          width: 13, height: 13,
          borderRadius: "50%",
          overflow: "hidden",
          zIndex: 10,
        }}>
          <img
            src="/icons/ico_prevented.png"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
    </div>
  );
}

// ── CalendarPanel ─────────────────────────────────────────────────────────────

export default function CalendarPanel({
  t = {},
  records = [],
  onDayClick,
  selectedDate,
  viewYear,
  viewMonth,
  onViewChange,
  show = {},
  onToggleShow,
  selectedField = "intensity",
  onFieldChange,
}) {
  const fieldKey    = selectedField;
  const setFieldKey = (k) => onFieldChange?.(k);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handle(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [dropdownOpen]);

  const now  = new Date();
  const vy   = viewYear  ?? now.getFullYear();
  const vm   = viewMonth ?? now.getMonth();

  const monthNames = t.monthNames ?? [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const dayLetters = (t.days ?? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"])
    .map((d) => d.slice(0, 1));

  const todayStr       = now.toISOString().slice(0, 10);
  const daysInMonth    = new Date(vy, vm + 1, 0).getDate();
  const firstDayOffset = (() => { const d = new Date(vy, vm, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const isCurrentMonth = vy === now.getFullYear() && vm === now.getMonth();

  const recordMap = useMemo(() => {
    const map = {};
    records.forEach((r) => { if (r.date) map[r.date] = r; });
    return map;
  }, [records]);

  function prevMonth() {
    if (vm === 0) onViewChange?.(vy - 1, 11);
    else          onViewChange?.(vy, vm - 1);
  }
  function nextMonth() {
    const next = new Date(vy, vm + 1, 1);
    if (next <= now) {
      if (vm === 11) onViewChange?.(vy + 1, 0);
      else           onViewChange?.(vy, vm + 1);
    }
  }

  const cells = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const activeField = FIELDS.find((f) => f.key === fieldKey) ?? FIELDS[0];
  const activeLabel = t[activeField.tKey] ?? activeField.fallback;

  return (
    <div className="w-full">

      {/* ── Month nav ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
          style={{ background: "rgba(201,112,96,0.1)" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="#c97060" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <p style={{ fontSize: 13, fontWeight: 700, color: "#5a3a34" }}>
          {monthNames[vm]} {vy}
        </p>

        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
          style={{
            background: isCurrentMonth ? "transparent" : "rgba(201,112,96,0.1)",
            opacity: isCurrentMonth ? 0.3 : 1,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="#c97060" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* ── Field selector dropdown ───────────────────────────────────── */}
      <div className="relative mb-4" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all"
          style={{
            background: "rgba(201,112,96,0.07)",
            border: "1px solid rgba(201,112,96,0.2)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "#c97060" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#5a3a34" }}>
              {activeLabel}
            </span>
          </div>
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="#c97060" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {dropdownOpen && (
          <div
            className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
            style={{
              background: "#fff",
              border: "1px solid rgba(201,112,96,0.18)",
              boxShadow: "0 8px 24px rgba(139,64,56,0.12)",
            }}
          >
            {FIELDS.map((f) => {
              const label    = t[f.tKey] ?? f.fallback;
              const isActive = f.key === fieldKey;
              return (
                <button
                  key={f.key}
                  onClick={() => { setFieldKey(f.key); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2 transition-colors"
                  style={{
                    background: isActive ? "rgba(201,112,96,0.08)" : "transparent",
                    borderBottom: "1px solid rgba(201,112,96,0.06)",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: isActive ? "#c97060" : "rgba(201,112,96,0.25)" }}
                  />
                  <span style={{ fontSize: 11, color: isActive ? "#c97060" : "#7a5a54", fontWeight: isActive ? 700 : 400 }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Day-of-week letters ───────────────────────────────────────── */}
      <div className="grid grid-cols-7 mb-2" style={{ rowGap: 10, columnGap: 10, justifyItems: "center" }}>
        {dayLetters.map((l, i) => (
          <div key={i} className="flex items-center justify-center">
            <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(201,112,96,0.45)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {l}
            </span>
          </div>
        ))}
      </div>

      {/* ── Day grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-7" style={{ rowGap: 10, columnGap: 10, justifyItems: "center", overflow: "visible" }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} style={{ width: 24, height: 24 }} />;
          const dateStr = `${vy}-${pad(vm + 1)}-${pad(day)}`;
          return (
            <DayCell
              key={dateStr}
              day={day}
              rec={recordMap[dateStr]}
              isToday={dateStr === todayStr}
              isSelected={dateStr === selectedDate}
              onClick={onDayClick}
              fieldKey={fieldKey}
              showMedicine={show.medicine ?? true}
              showNote={show.note     ?? true}
              showActivity={show.activity  ?? true}
              showPeriod={show.period   ?? true}
              showSexPrevented={fieldKey === "sexualPain"}
            />
          );
        })}
      </div>
    </div>
  );
}