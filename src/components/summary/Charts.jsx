"use client";

export function BarChart({ data, colorFn, height = 80 }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md transition-all"
          style={{
            height: `${(d.value / max) * 100}%`,
            background: colorFn(d, i),
            minWidth: 4,
          }}
          title={`${d.label}: ${d.value}`}
        />
      ))}
    </div>
  );
}

export function LineChart({ data, color, height = 80, min = 0, max: maxProp }) {
  if (!data.length) return null;
  const max = maxProp ?? Math.max(...data.map((d) => d.value), 1);
  const w = 300;
  const h = height;
  const pad = 4;
  const xs = data.map((_, i) => pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2));
  const ys = data.map((d) => h - pad - ((d.value - min) / (max - min)) * (h - pad * 2));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <polyline
        points={xs.map((x, i) => `${x},${ys[i]}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="3" fill={color} />
      ))}
    </svg>
  );
}
