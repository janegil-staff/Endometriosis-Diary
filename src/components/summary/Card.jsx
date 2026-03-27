export function Card({ title, subtitle, accent, children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(201,112,96,0.18)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="flex items-start justify-between px-5 pt-4 pb-3"
        style={{ borderBottom: "1px solid rgba(201,112,96,0.08)" }}
      >
        <div>
          <p className="text-sm font-bold" style={{ color: "#5a3a34" }}>{title}</p>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "#b07a70" }}>{subtitle}</p>
          )}
        </div>
        {accent && (
          <div
            className="text-lg font-extrabold leading-none"
            style={{ color: accent.color }}
          >
            {accent.value}
          </div>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
