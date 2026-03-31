"use client";

export function LogSearch({ t, search, onSearch }) {
  const legend = [
    ["#5bc0de", t.note          ?? "Note"],
    ["#7b68ee", t.medication    ?? "Medicine"],
    ["#e05a5a", t.symptomPeriod ?? "Period"],
    ["#5cb85c", t.physicalActivity ?? "Activity"],
  ];

  return (
    <div className="px-6 pt-6 pb-2 max-w-3xl mx-auto w-full">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={`🔍  ${t.searchPlaceholder ?? t.placeholder ?? "Search..."}`}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(201,112,96,0.2)",
          color: "#5a3a34",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#c97060";
          e.target.style.boxShadow = "0 0 0 3px rgba(201,112,96,0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(201,112,96,0.2)";
          e.target.style.boxShadow = "none";
        }}
      />

      <div className="flex flex-wrap gap-4 mt-3 justify-center">
        {legend.map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-xs" style={{ color: "#7a5a54" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}