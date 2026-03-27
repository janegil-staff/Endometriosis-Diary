export function StatRow({ label, value, color }) {
  return (
    <div
      className="flex items-center justify-between py-1.5"
      style={{ borderBottom: "1px solid rgba(201,112,96,0.06)" }}
    >
      <span className="text-xs" style={{ color: "#7a5a54" }}>{label}</span>
      <span
        className="text-sm font-bold"
        style={{ color: color ?? "#8b4038" }}
      >
        {value}
      </span>
    </div>
  );
}
