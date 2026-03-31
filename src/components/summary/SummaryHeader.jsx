"use client";

export function SummaryHeader({
  t,
  months,
  vm,
  vy,
  hasPrev,
  hasNext,
  recordsCount,
  monthRange,
  onRangeChange,
  onBack,
  onPrev,
  onNext,
  allRecords = [],
}) {
  // Cap dropdown at how many distinct months have records up to current view
  const maxRange = (() => {
    const pad        = (n) => String(n).padStart(2, "0");
    const currentKey = `${vy}-${pad(vm + 1)}`;
    const keys = new Set(
      allRecords
        .filter((r) => r.date.slice(0, 7) <= currentKey)
        .map((r) => r.date.slice(0, 7)),
    );
    return Math.max(1, Math.min(keys.size, 12));
  })();

  const rangeLabel = (() => {
    if (monthRange === 1) return `${months[vm]} ${vy}`;
    const startDate = new Date(vy, vm - (monthRange - 1), 1);
    const startM    = startDate.getMonth();
    const startY    = startDate.getFullYear();
    if (startY === vy) return `${months[startM]} – ${months[vm]} ${vy}`;
    return `${months[startM]} ${startY} – ${months[vm]} ${vy}`;
  })();

  return (
    <header
      className="px-4 sm:px-6 py-3 flex flex-col gap-2"
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(201,112,96,0.15)",
      }}
    >
      {/* Row 1: back | month navigator | count pill */}
      <div className="flex items-center justify-between">
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

        {/* Month navigator – centred absolutely */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-black/5 disabled:opacity-30"
            style={{ color: "#c97060", fontSize: 18 }}
          >
            ‹
          </button>
          <span
            className="text-sm font-semibold px-2"
            style={{ color: "#c97060", whiteSpace: "nowrap", textAlign: "center", minWidth: 140 }}
          >
            {rangeLabel}
          </span>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-black/5 disabled:opacity-30"
            style={{ color: "#c97060", fontSize: 18 }}
          >
            ›
          </button>
        </div>

        {/* Entry count */}
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
      </div>

      {/* Row 2: month range dropdown */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs" style={{ color: "#b07a70" }}>
          {t.dropdownLabel ?? "Showing"}
        </span>
        <div className="relative">
          <select
            value={monthRange}
            onChange={(e) => onRangeChange(Number(e.target.value))}
            className="text-xs font-semibold rounded-full outline-none cursor-pointer pr-6 pl-3 py-1"
            style={{
              background: "rgba(201,112,96,0.07)",
              color: "#c97060",
              border: "1px solid rgba(201,112,96,0.25)",
              appearance: "none",
            }}
          >
            {Array.from({ length: maxRange }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? (t.monthSingular ?? "month") : (t.months ?? "months")}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "#c97060" }}
          >
            ▾
          </span>
        </div>
      </div>
    </header>
  );
}