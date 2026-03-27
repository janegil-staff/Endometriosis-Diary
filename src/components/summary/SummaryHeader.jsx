"use client";

export function SummaryHeader({
  t, months, vm, vy, hasPrev, hasNext,
  recordsCount, onBack, onPrev, onNext,
}) {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 relative"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(201,112,96,0.15)",
      }}
    >
      <button
        onClick={onBack}
        className="text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
        style={{
          background: "rgba(201,112,96,0.1)",
          color: "#c97060",
          border: "1px solid rgba(201,112,96,0.25)",
        }}
      >
        {t.back ?? "← Back"}
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-black/5 disabled:opacity-30"
          style={{ color: "#c97060", fontSize: 16 }}
        >
          ‹
        </button>
        <span
          className="text-sm font-semibold px-1 whitespace-nowrap"
          style={{ color: "#c97060" }}
        >
          {months[vm]} {vy}
        </span>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-black/5 disabled:opacity-30"
          style={{ color: "#c97060", fontSize: 16 }}
        >
          ›
        </button>
      </div>

      <span
        className="text-xs px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(201,112,96,0.08)",
          color: "#c97060",
          border: "1px solid rgba(201,112,96,0.2)",
        }}
      >
        {recordsCount} {t.entries ?? "entries"}
      </span>
    </header>
  );
}
