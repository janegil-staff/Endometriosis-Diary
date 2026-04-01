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
        background: "linear-gradient(135deg, #c97060 0%, #8b4038 100%)",
        boxShadow: "0 2px 16px rgba(139,64,56,0.28)",
      }}
    >
      {/* Row 1: back | month navigator | count pill */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          {t.back ?? "← Back"}
        </button>

        {/* Month navigator – centred absolutely */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-30"
            style={{ color: "#fff", fontSize: 18 }}
          >
            ‹
          </button>
          <span
            className="text-sm font-semibold px-2"
            style={{ color: "#fff", whiteSpace: "nowrap", textAlign: "center", minWidth: 140 }}
          >
            {rangeLabel}
          </span>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-30"
            style={{ color: "#fff", fontSize: 18 }}
          >
            ›
          </button>
        </div>

        {/* Entry count */}
        <span
          className="text-xs px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          {recordsCount} {t.entries ?? "entries"}
        </span>
      </div>

      {/* Row 2: month range dropdown */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
          {t.dropdownLabel ?? "Showing"}
        </span>
        <div className="relative">
          <select
            value={monthRange}
            onChange={(e) => onRangeChange(Number(e.target.value))}
            className="text-xs font-semibold rounded-full outline-none cursor-pointer pr-6 pl-3 py-1"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              appearance: "none",
            }}
          >
            {Array.from({ length: maxRange }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n} style={{ background: "#8b4038", color: "#fff" }}>
                {n} {n === 1 ? (t.monthSingular ?? "month") : (t.months ?? "months")}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "#fff" }}
          >
            ▾
          </span>
        </div>
      </div>
    </header>
  );
}