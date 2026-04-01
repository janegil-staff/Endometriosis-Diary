"use client";
import { RecordRow } from "./RecordRow";

export function RecordList({
  t, visible, filtered, patient, expandedDate,
  onToggle, hasMore, sentinelRef, PAGE_SIZE, selectedField,
}) {
  if (filtered.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: "#b07a70" }}>
          {t.noEntries ?? "No entries this month."}
        </p>
      </div>
    );
  }

  let currentYear = null;

  return (
    <>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(201,112,96,0.14)",
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        }}
      >
        {visible.map((record, idx) => {
          const year = record.date.slice(0, 4);
          const showYear = year !== currentYear;
          if (showYear) currentYear = year;

          return (
            <div key={record.date}>
              {showYear && (
                <div
                  className="flex items-center gap-2 px-4"
                  style={{
                    paddingTop: idx > 0 ? 10 : 6,
                    paddingBottom: 6,
                    borderTop: idx > 0 ? "1px solid rgba(201,112,96,0.12)" : "none",
                  }}
                >
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#c97060" }}>
                    {year}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(201,112,96,0.2)" }} />
                </div>
              )}
              <RecordRow
                record={record}
                medicines={patient.medicines}
                t={t}
                expanded={expandedDate === record.date}
                onToggle={() => onToggle(record.date)}
                isFirst={idx === 0 || showYear}
                selectedField={selectedField}
              />
            </div>
          );
        })}
      </div>

      <div ref={sentinelRef} className="py-2 text-center">
        {hasMore ? (
          <p className="text-xs" style={{ color: "#b07a70" }}>
            {visible.length} / {filtered.length} {t.entries ?? "entries"}
          </p>
        ) : filtered.length > PAGE_SIZE ? (
          <p className="text-xs" style={{ color: "#d0b0a8" }}>
            ✓ {filtered.length} {t.entries ?? "entries"}
          </p>
        ) : null}
      </div>
    </>
  );
}