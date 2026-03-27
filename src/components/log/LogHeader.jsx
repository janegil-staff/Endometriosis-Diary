"use client";

export function LogHeader({ t, filteredCount, onBack, onPdfOpen }) {
  return (
    <header
      className="flex items-center justify-between px-6 py-4"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(201,112,96,0.15)",
      }}
    >
      <div className="flex items-center gap-3">
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
        <h1
          className="text-lg font-bold"
          style={{
            color: "#5a3a34",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {t.symptomLog ?? "Symptom Log"}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="hidden md:inline text-xs px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(201,112,96,0.08)",
            color: "#c97060",
            border: "1px solid rgba(201,112,96,0.2)",
          }}
        >
          {filteredCount} {t.entries ?? "entries"}
        </span>
        <button
          onClick={onPdfOpen}
          disabled={filteredCount === 0}
          className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1.5"
          style={{
            background: "#c97060",
            color: "#fff",
            border: "1px solid rgba(201,112,96,0.4)",
          }}
        >
          ⬇ PDF
        </button>
      </div>
    </header>
  );
}
