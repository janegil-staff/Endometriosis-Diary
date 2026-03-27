"use client";

const Y_TICKS = 3;

export function BarChart({ data, colorFn, height = 80 }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="relative flex items-end gap-1" style={{ height, paddingLeft: 18 }}>
      {/* Guide lines */}
      {Array.from({ length: Y_TICKS }).map((_, i) => (
        <div
          key={i}
          className="absolute w-full pointer-events-none"
          style={{
            top: `${(i / (Y_TICKS - 1)) * 100}%`,
            borderTop: "1px dashed rgba(201,112,96,0.12)",
            left: 0,
          }}
        />
      ))}

      {/* Y labels — overlaid on the left, top/mid/bottom */}
      <div
        className="absolute left-0 top-0 h-full flex flex-col justify-between pointer-events-none"
        style={{ zIndex: 20 }}
      >
        {Array.from({ length: Y_TICKS }).map((_, i) => {
          const val = Math.round(max * ((Y_TICKS - 1 - i) / (Y_TICKS - 1)));
          return (
            <span
              key={i}
              style={{
                fontSize: 9,
                color: "#b07a70",
                lineHeight: 1,
                background: "rgba(255,255,255,0.7)",
                paddingRight: 1,
              }}
            >
              {val}
            </span>
          );
        })}
      </div>

      {/* Bars */}
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md transition-all relative z-10"
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
  const W = 300;
  const H = height;
  const padL = 6;
  const padR = 6;
  const padT = 8;
  const padB = 4;

  const xs = data.map(
    (_, i) => padL + (i / Math.max(data.length - 1, 1)) * (W - padL - padR),
  );
  const ys = data.map(
    (d) => padT + (1 - (d.value - min) / (max - min)) * (H - padT - padB),
  );

  // X position of first data point — labels aligned here
  const x0 = xs[0];

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      {/* Horizontal guide lines + Y labels over first data point */}
      {Array.from({ length: Y_TICKS }).map((_, i) => {
        const frac = i / (Y_TICKS - 1);
        const val = Math.round(min + (1 - frac) * (max - min));
        const y = padT + frac * (H - padT - padB);
        return (
          <g key={i}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="rgba(201,112,96,0.12)"
              strokeWidth="0.8"
              strokeDasharray="3,3"
            />
            {/* Label centred over first data point */}
            <rect
              x={x0 - 8}
              y={y - 6}
              width={16}
              height={8}
              fill="rgba(255,255,255,0.75)"
              rx="2"
            />
            <text
              x={x0}
              y={y + 2}
              textAnchor="middle"
              fontSize="8"
              fill="#b07a70"
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* Line */}
      <polyline
        points={xs.map((x, i) => `${x},${ys[i]}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="3" fill={color} />
      ))}
    </svg>
  );
}
