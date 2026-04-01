"use client";

export function LogSearch({ t, search, onSearch }) {
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
    </div>
  );
}