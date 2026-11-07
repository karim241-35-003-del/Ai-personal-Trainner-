// Simple SVG line chart (no chart library needed).
// points: [{ x: "11-02", y: 70.5 }, ...] oldest to newest.
export default function LineChart({ points, unit = "", height = 220 }) {
  if (points.length < 2) {
    return <p className="muted">Add at least 2 entries to see the chart.</p>;
  }
  const W = 600, H = height, P = { l: 48, r: 16, t: 16, b: 32 };
  const ys = points.map((p) => p.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.1;
  min -= pad; max += pad;
  const x = (i) => P.l + (i / (points.length - 1)) * (W - P.l - P.r);
  const y = (v) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.y).toFixed(1)}`).join(" ");
  const ticks = [0, 1, 2, 3].map((i) => min + ((max - min) * i) / 3);
  const labelIdx = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Line chart in ${unit}`}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#d9deea" strokeWidth="1" />
          <text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#5f6673">{t.toFixed(1)}</text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#2e5395" strokeWidth="2.5" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.y)} r="3.5" fill="#2e5395">
          <title>{`${p.x}: ${p.y} ${unit}`}</title>
        </circle>
      ))}
      {labelIdx.map((i) => (
        <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="#5f6673">{points[i].x}</text>
      ))}
      <text x={P.l} y={11} fontSize="11" fill="#5f6673">{unit}</text>
    </svg>
  );
}
